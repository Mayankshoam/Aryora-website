import { NextResponse } from "next/server";
import { verifyAdminToken, extractAdminToken } from "@/lib/adminAuth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { getServerCustomers } from "@/lib/serverCustomerStore";
import { maskPAN } from "@/lib/customerStore";

export async function GET(req: Request) {
  try {
    const ip = getClientIp(req);

    // Rate limit: 60 requests/minute
    const rateCheck = checkRateLimit(`admin-customers:${ip}`, {
      limit: 60,
      windowMs: 60 * 1000,
    });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Retry in ${rateCheck.resetInSeconds}s.` },
        { status: 429 }
      );
    }

    // Role & Authorization Check
    const token = extractAdminToken(req);
    const auth = verifyAdminToken(token);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized admin access." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").trim().toLowerCase();
    const status = (searchParams.get("status") || "all").toLowerCase();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)));

    let customers = getServerCustomers();

    // 1. Filter by PAN status
    if (status === "verified") {
      customers = customers.filter((c) => c.panVerified === true);
    } else if (status === "unverified") {
      customers = customers.filter((c) => c.panVerified === false);
    }

    // 2. Search by name, mobile, customer ID, or masked/unmasked PAN
    if (query) {
      customers = customers.filter((c) => {
        const masked = maskPAN(c.panNumber).toLowerCase();
        const rawPan = (c.panNumber || "").toLowerCase();
        return (
          c.name.toLowerCase().includes(query) ||
          c.mobile.includes(query) ||
          c.customerId.toLowerCase().includes(query) ||
          masked.includes(query) ||
          rawPan.includes(query)
        );
      });
    }

    const total = customers.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = customers.slice(startIndex, startIndex + limit);

    // Mask PAN for safe client display
    const sanitized = paginated.map((c) => ({
      ...c,
      panNumberMasked: maskPAN(c.panNumber),
      panImageUrl: undefined, // Do not expose raw private document URL in listing!
    }));

    return NextResponse.json({
      success: true,
      customers: sanitized,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
      },
      stats: {
        totalCustomers: getServerCustomers().length,
        verifiedCustomers: getServerCustomers().filter((c) => c.panVerified).length,
        unverifiedCustomers: getServerCustomers().filter((c) => !c.panVerified).length,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch customers." },
      { status: 500 }
    );
  }
}

