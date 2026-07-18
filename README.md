# Cloud Spreadsheet Lead Sync — Integration Guide

This project syncs every register / newsletter / enquiry / appointment / cart /
checkout / order event to a cloud-hosted spreadsheet, as a new row, automatically.
The workbook structure is `Aryora-Leads-Template.xlsx` in this folder — upload it
to Google Sheets or OneDrive to get started.

The backend code that performs the sync lives at
`backend/src/services/sheetSyncService.ts`, called from
`backend/src/services/leadService.ts` on every lead-generating action.
You only need to configure **one** of the two providers below.

---

## Option A — Google Sheets (recommended: simplest to set up)

1. **Create the sheet**: In Google Drive, upload `Aryora-Leads-Template.xlsx`
   and open it with Google Sheets (File → Save as Google Sheets), or create a
   blank Google Sheet and rename the first tab to `Leads`, pasting in the
   header row from this template.
2. **Create a Google Cloud project** at console.cloud.google.com, enable the
   **Google Sheets API**.
3. **Create a Service Account** (IAM & Admin → Service Accounts), then create
   a JSON key for it.
4. **Share the spreadsheet** with the service account's email address
   (found in the JSON key, `client_email`) with Editor access.
5. Copy these values into `backend/.env`:
   - `GOOGLE_SHEETS_ENABLED=true`
   - `GOOGLE_SHEETS_SPREADSHEET_ID` — the long ID in the sheet's URL
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` — `client_email` from the JSON key
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` — `private_key` from the JSON key
     (keep the `\n` characters escaped, exactly as they appear in the JSON)

That's it — the backend will create the header row automatically on first
sync if it's missing, then append one row per lead event.

---

## Option B — Microsoft OneDrive / Excel Online

1. Upload `Aryora-Leads-Template.xlsx` to OneDrive, e.g. at `/Aryora/aryora-leads.xlsx`.
2. Open the file in Excel Online, select the header row + a few blank rows,
   and **Insert → Table**, naming it `LeadsTable` (Table Design → Table Name).
3. **Register an app** in Azure AD (Entra ID) → App registrations → New
   registration. Add the redirect URI `http://localhost:5000/auth/callback`
   for the one-time consent step.
4. Under **API permissions**, add Microsoft Graph delegated permission
   `Files.ReadWrite` and `offline_access`, then grant admin consent.
5. Perform a one-time OAuth authorization-code flow (any OAuth tool, or a
   short throwaway script) to obtain a **refresh token** for a user who has
   edit access to the file. Store it as `MS_REFRESH_TOKEN`.
6. Fill in `backend/.env`:
   - `ONEDRIVE_SHEETS_ENABLED=true`
   - `MS_CLIENT_ID`, `MS_CLIENT_SECRET`, `MS_TENANT_ID`, `MS_REFRESH_TOKEN`
   - `MS_EXCEL_FILE_PATH=/Aryora/aryora-leads.xlsx`
   - `MS_EXCEL_TABLE_NAME=LeadsTable`

The backend calls the Microsoft Graph `workbook/tables/{table}/rows/add`
endpoint, which appends a row into the named Excel Table inside the file —
no polling or file-locking issues, and it works even while someone has the
file open in Excel Online.

---

## How the sync behaves

- Every lead-generating action (see `leadService.ts`) first **validates**
  required fields and **checks for duplicates** (same email/phone within a
  5-minute window for the same lead source), then writes to the database.
- The spreadsheet write happens **after** the database write and is
  fire-and-forget — a spreadsheet outage never blocks or fails a customer's
  registration, order, or enquiry.
- If the spreadsheet write fails, the `Lead` row is marked `FAILED` with the
  error message recorded. A scheduled job (`retrySyncQueue`, run every 5
  minutes from `server.ts`) retries failed rows up to 5 times.
- Admins can see live sync status at `GET /api/admin/leads?status=FAILED`.

## Regenerating the template

```bash
cd excel-integration
npm install
node generate-workbook.js
```
