/**
 * Generates Aryora-Leads-Template.xlsx — the workbook structure the backend
 * (see backend/src/services/sheetSyncService.ts) appends new rows to.
 *
 * Run: node generate-workbook.js
 */
const ExcelJS = require("exceljs");

const HEADERS = [
  "Customer ID", "Full Name", "Mobile Number", "Email ID", "Date of Birth", "Anniversary",
  "Product Name", "Product Code", "Quantity", "Cart Value", "Order ID", "Address", "City",
  "State", "PIN Code", "Lead Source", "Date & Time", "Status", "Customer Notes",
];

const SAMPLE_ROWS = [
  ["ARY-000001", "Ishita Verma", "9876543210", "ishita.verma@example.com", "1996-04-12", "", "", "", "", "", "", "", "", "", "", "REGISTER", "2026-07-01 10:14:02", "SYNCED", ""],
  ["ARY-000002", "Rohan Malhotra", "9812345678", "rohan.m@example.com", "", "", "The Emerald Cut Solitaire", "ARY-RG-0001", 1, "₹12,45,000.00", "AOD-2607011234", "", "", "", "", "CART", "2026-07-01 11:02:44", "SYNCED", ""],
  ["ARY-000003", "Priya Nair", "9900112233", "priya.nair@example.com", "", "", "The Emerald Cut Solitaire", "ARY-RG-0001", 1, "₹12,45,000.00", "AOD-2607021009", "12 Gomti Nagar Extension", "Lucknow", "Uttar Pradesh", "226010", "ORDER", "2026-07-02 09:41:17", "SYNCED", "Gift wrap requested"],
];

async function main() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Aryora";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Leads", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = HEADERS.map((h) => ({ header: h, key: h, width: Math.max(16, h.length + 4) }));

  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFF7F5F0" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0B3D2E" } };
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });

  SAMPLE_ROWS.forEach((row) => sheet.addRow(row));

  // Data validation for Lead Source and Status columns keeps rows added
  // manually (e.g. by staff at the boutique) consistent with API-synced rows.
  const leadSourceCol = "P"; // 16th column
  const statusCol = "R"; // 18th column
  for (let r = 2; r <= 500; r++) {
    sheet.getCell(`${leadSourceCol}${r}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: ['"REGISTER,NEWSLETTER,ENQUIRY,APPOINTMENT,CART,CHECKOUT,ORDER"'],
    };
    sheet.getCell(`${statusCol}${r}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: ['"NEW,SYNCED,FAILED"'],
    };
  }

  sheet.autoFilter = { from: "A1", to: "S1" };

  await workbook.xlsx.writeFile("Aryora-Leads-Template.xlsx");
  console.log("Workbook written: Aryora-Leads-Template.xlsx");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
