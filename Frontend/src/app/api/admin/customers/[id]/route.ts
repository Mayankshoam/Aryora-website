import { NextResponse } from "next/server";
import { verifyAdminToken, extractAdminToken } from "@/lib/adminAuth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import {
  getServerCustomerById,
  getServerInvoices,
  getServerCustomerWishlist,
  getServerAuditLogs,
} from "@/lib/serverCustomerStore";
import { maskPAN } from "@/lib/customerStore";
import { getAllProducts } from "@/lib/data";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ip = getClientIp(req);
    const customerId = params.id;

    // Rate limit
    const rateCheck = checkRateLimit(`admin-cust-detail:${ip}`, {
      limit: 60,
      windowMs: 60 * 1000,
    });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }

    // Auth
    const token = extractAdminToken(req);
    const auth = verifyAdminToken(token);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized access." },
        { status: 403 }
      );
    }

    const customer = getServerCustomerById(customerId);
    if (!customer) {
      return NextResponse.json(
        { error: `Customer with ID ${customerId} not found.` },
        { status: 404 }
      );
    }

    // Load related items
    const allProducts = getAllProducts();
    const wishlistSlugs = getServerCustomerWishlist(customerId);
    const wishlistProducts = wishlistSlugs
      .map((slug) => allProducts.find((p) => p.slug === slug))
      .filter(Boolean);

    const invoices = getServerInvoices().filter((inv) => inv.customerId === customerId);
    const auditLogs = getServerAuditLogs(customerId);

    return NextResponse.json({
      success: true,
      customer: {
        ...customer,
        panNumberMasked: maskPAN(customer.panNumber),
        hasPanImage: Boolean(customer.panImageUrl),
        panImageUrl: undefined, // Private - accessible only via short-lived signed URL
      },
      wishlist: wishlistProducts,
      invoices,
      auditLogs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load customer profile." },
      { status: 500 }
    );
  }
}
