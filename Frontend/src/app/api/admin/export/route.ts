import { NextResponse } from "next/server";
import { verifyAdminToken, extractAdminToken } from "@/lib/adminAuth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { getServerCustomers, getServerInvoices } from "@/lib/serverCustomerStore";
import { maskPAN } from "@/lib/customerStore";

function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(req: Request) {
  try {
    const ip = getClientIp(req);

    // Rate limit: 20 exports per minute
    const rateCheck = checkRateLimit(`admin-export:${ip}`, {
      limit: 20,
      windowMs: 60 * 1000,
    });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Export rate limit exceeded. Please wait." },
        { status: 429 }
      );
    }

    // Role check
    const token = extractAdminToken(req);
    const auth = verifyAdminToken(token);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || "Admin authorization required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "customers").toLowerCase();
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let csvContent = "";
    let filename = "";

    if (type === "invoices") {
      filename = `ayor_invoices_export_${new Date().toISOString().slice(0, 10)}.csv`;
      let invoices = getServerInvoices();

      if (startDate) {
        const start = new Date(startDate).getTime();
        invoices = invoices.filter((inv) => new Date(inv.invoiceDate).getTime() >= start);
      }
      if (endDate) {
        const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000;
        invoices = invoices.filter((inv) => new Date(inv.invoiceDate).getTime() <= end);
      }

      const headers = [
        "Invoice Number",
        "Invoice Date",
        "Customer ID",
        "Customer Name",
        "Mobile",
        "Masked PAN",
        "Address",
        "HSN Code",
        "Taxable Amount (INR)",
        "CGST 1.5% (INR)",
        "SGST 1.5% (INR)",
        "Total Amount (INR)",
        "Payment Mode",
        "Payment Status",
      ];

      const rows = invoices.map((inv) => [
        inv.invoiceNumber,
        inv.invoiceDate,
        inv.customerId,
        inv.customerName,
        inv.customerMobile,
        inv.customerPanMasked || "N/A",
        inv.customerAddress,
        "7113",
        inv.taxableAmount,
        inv.cgst,
        inv.sgst,
        inv.totalAmount,
        inv.paymentMode,
        inv.paymentStatus,
      ]);

      csvContent = [
        headers.map(escapeCsvCell).join(","),
        ...rows.map((r) => r.map(escapeCsvCell).join(",")),
      ].join("\r\n");
    } else {
      filename = `ayor_customers_export_${new Date().toISOString().slice(0, 10)}.csv`;
      let customers = getServerCustomers();

      if (startDate) {
        const start = new Date(startDate).getTime();
        customers = customers.filter((c) => new Date(c.createdAt).getTime() >= start);
      }
      if (endDate) {
        const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000;
        customers = customers.filter((c) => new Date(c.createdAt).getTime() <= end);
      }

      const headers = [
        "Customer ID",
        "Name",
        "Mobile",
        "Email",
        "Address",
        "City",
        "State",
        "Pincode",
        "PAN Verified",
        "Masked PAN",
        "Official Name Locked",
        "Welcome Discount Active",
        "Created At",
        "Updated At",
      ];

      const rows = customers.map((c) => [
        c.customerId,
        c.name,
        c.mobile,
        c.email || "",
        c.address || "",
        c.city || "",
        c.state || "",
        c.pincode || "",
        c.panVerified ? "YES" : "NO",
        maskPAN(c.panNumber),
        c.nameLocked ? "YES (LOCKED)" : "NO (EDITABLE)",
        c.hasWelcomeDiscount ? "YES" : "NO",
        c.createdAt,
        c.updatedAt,
      ]);

      csvContent = [
        headers.map(escapeCsvCell).join(","),
        ...rows.map((r) => r.map(escapeCsvCell).join(",")),
      ].join("\r\n");
    }

    return new Response("\uFEFF" + csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to generate CSV export." },
      { status: 500 }
    );
  }
}

