import { google } from "googleapis";
import { prisma } from "../prisma/client";

const SHEET_HEADERS = [
  "Customer ID",
  "Full Name",
  "Mobile Number",
  "Email ID",
  "Date of Birth",
  "Anniversary",
  "Product Name",
  "Product Code",
  "Quantity",
  "Cart Value",
  "Order ID",
  "Address",
  "City",
  "State",
  "PIN Code",
  "Lead Source",
  "Date & Time",
  "Status",
  "Customer Notes",
];

function fmtDate(d?: Date | null) {
  if (!d) return "";
  return d.toISOString().split("T")[0];
}

function fmtCurrency(v: unknown) {
  if (v === null || v === undefined) return "";
  return `₹${Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function leadToRow(lead: any): (string | number)[] {
  return [
    lead.customerId ?? "",
    lead.fullName ?? "",
    lead.mobileNumber ?? "",
    lead.emailId ?? "",
    fmtDate(lead.dateOfBirth),
    fmtDate(lead.anniversary),
    lead.productName ?? "",
    lead.productCode ?? "",
    lead.quantity ?? "",
    fmtCurrency(lead.cartValue),
    lead.orderId ?? "",
    lead.address ?? "",
    lead.city ?? "",
    lead.state ?? "",
    lead.pinCode ?? "",
    lead.leadSource,
    new Date(lead.createdAt).toISOString().replace("T", " ").slice(0, 19),
    lead.status,
    lead.customerNotes ?? "",
  ];
}

/**
 * Appends one lead as a new row to the connected cloud spreadsheet.
 * Provider is chosen by env flag so the same lead pipeline works whether
 * the business keeps its workbook in Google Sheets or OneDrive/Excel Online.
 */
export async function syncLeadToSheet(leadId: string) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return;

  try {
    if (process.env.GOOGLE_SHEETS_ENABLED === "true") {
      await appendToGoogleSheet(leadToRow(lead));
    } else if (process.env.ONEDRIVE_SHEETS_ENABLED === "true") {
      await appendToOneDriveExcel(leadToRow(lead));
    } else {
      throw new Error("No cloud spreadsheet provider is enabled in .env");
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: { status: "SYNCED", syncedAt: new Date(), lastSyncError: null },
    });
  } catch (err: any) {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: "FAILED",
        syncAttempts: { increment: 1 },
        lastSyncError: err?.message?.slice(0, 500) ?? "Unknown sync error",
      },
    });
    throw err;
  }
}

// ---------- Google Sheets ----------

async function getSheetsClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

async function appendToGoogleSheet(row: (string | number)[]) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID as string;

  // Ensure headers exist once (cheap no-op after the first successful run).
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Leads!A1:S1",
  });
  if (!existing.data.values || existing.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Leads!A1",
      valueInputOption: "RAW",
      requestBody: { values: [SHEET_HEADERS] },
    });
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Leads!A1",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

// ---------- Microsoft OneDrive / Excel Online ----------
// Uses the Microsoft Graph "workbook table" API so rows append into a
// pre-created Excel Table (named range) inside the .xlsx file on OneDrive.
// Requires a one-time OAuth consent to obtain MS_REFRESH_TOKEN (see
// excel-integration/README.md for the exact steps).

async function getGraphAccessToken() {
  const params = new URLSearchParams({
    client_id: process.env.MS_CLIENT_ID as string,
    client_secret: process.env.MS_CLIENT_SECRET as string,
    grant_type: "refresh_token",
    refresh_token: process.env.MS_REFRESH_TOKEN as string,
    scope: "https://graph.microsoft.com/.default offline_access",
  });

  const res = await fetch(
    `https://login.microsoftonline.com/${process.env.MS_TENANT_ID}/oauth2/v2.0/token`,
    { method: "POST", body: params }
  );
  if (!res.ok) throw new Error(`Microsoft Graph auth failed: ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

async function appendToOneDriveExcel(row: (string | number)[]) {
  const token = await getGraphAccessToken();
  const filePath = process.env.MS_EXCEL_FILE_PATH;
  const table = process.env.MS_EXCEL_TABLE_NAME;

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/me/drive/root:${filePath}:/workbook/tables/${table}/rows/add`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [row] }),
    }
  );
  if (!res.ok) throw new Error(`Microsoft Graph append failed: ${res.status} ${await res.text()}`);
}
