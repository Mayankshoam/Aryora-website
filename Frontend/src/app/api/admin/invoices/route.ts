import { NextResponse } from "next/server";
import { verifyAdminToken, extractAdminToken } from "@/lib/adminAuth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { getServerInvoices } from "@/lib/serverCustomerStore";

export async function GET(req: Request) {
  try {
    const ip = getClientIp(req);

    // Rate limit
    const rateCheck = checkRateLimit(`admin-invoices:${ip}`, {
      limit: 60,
      windowMs: 60 * 1000,
    });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait." },
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
    const query = (searchParams.get("q") || "").trim().toLowerCase();
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let invoices = getServerInvoices();

    // Search filter
    if (query) {
      invoices = invoices.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(query) ||
          inv.customerName.toLowerCase().includes(query) ||
          inv.customerId.toLowerCase().includes(query) ||
          inv.customerMobile.includes(query) ||
          inv.invoiceDate.toLowerCase().includes(query)
      );
    }

    // Date range filter
    if (startDate) {
      const start = new Date(startDate).getTime();
      invoices = invoices.filter((inv) => new Date(inv.invoiceDate).getTime() >= start);
    }
    if (endDate) {
      const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000;
      invoices = invoices.filter((inv) => new Date(inv.invoiceDate).getTime() <= end);
    }

    return NextResponse.json({
      success: true,
      invoices,
      total: invoices.length,
      totalBilledINR: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch invoices." },
      { status: 500 }
    );
  }
}
