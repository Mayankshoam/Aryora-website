import { NextResponse } from "next/server";
import {
  verifyAdminToken,
  extractAdminToken,
  generatePanSignedUrl,
} from "@/lib/adminAuth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { getServerCustomerById } from "@/lib/serverCustomerStore";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ip = getClientIp(req);
    const customerId = params.id;

    // Rate limit
    const rateCheck = checkRateLimit(`admin-pan-url:${ip}`, {
      limit: 20,
      windowMs: 60 * 1000,
    });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many signed URL requests. Please wait." },
        { status: 429 }
      );
    }

    // Role check
    const token = extractAdminToken(req);
    const auth = verifyAdminToken(token);
    if (!auth.authorized || !auth.admin) {
      return NextResponse.json(
        { error: auth.error || "Admin authorization required." },
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

    if (!customer.panImageUrl) {
      return NextResponse.json(
        { error: "No PAN card document has been uploaded for this customer." },
        { status: 404 }
      );
    }

    // Generate short-lived signed viewing URL (valid for 60 seconds)
    const { signedUrl, expiresAt, token: signedToken } = generatePanSignedUrl(
      customerId,
      auth.admin.username,
      60 // 60 seconds TTL
    );

    return NextResponse.json({
      success: true,
      signedUrl,
      token: signedToken,
      expiresAt,
      ttlSeconds: 60,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to generate signed PAN URL." },
      { status: 500 }
    );
  }
}
