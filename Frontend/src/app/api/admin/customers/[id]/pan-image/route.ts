import { NextResponse } from "next/server";
import {
  verifyPanSignedToken,
  verifyAdminToken,
  extractAdminToken,
} from "@/lib/adminAuth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import {
  getServerCustomerById,
  recordServerAuditLog,
} from "@/lib/serverCustomerStore";
import { maskPAN } from "@/lib/customerStore";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ip = getClientIp(req);
    const customerId = params.id;

    // Rate limit
    const rateCheck = checkRateLimit(`admin-pan-view:${ip}`, {
      limit: 30,
      windowMs: 60 * 1000,
    });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many PAN inspection requests. Rate limit active." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const signedToken = searchParams.get("token");
    let adminUsername = "admin@ayor.in";

    // Validate access: either valid short-lived signed token OR valid Admin Bearer token
    if (signedToken) {
      const tokenVerification = verifyPanSignedToken(signedToken);
      if (!tokenVerification.valid || !tokenVerification.payload) {
        return NextResponse.json(
          { error: tokenVerification.error || "Invalid or expired signed PAN link." },
          { status: 403 }
        );
      }
      if (tokenVerification.payload.customerId !== customerId) {
        return NextResponse.json(
          { error: "Signed token customer mismatch." },
          { status: 403 }
        );
      }
      adminUsername = tokenVerification.payload.adminUsername;
    } else {
      const bearer = extractAdminToken(req);
      const auth = verifyAdminToken(bearer);
      if (!auth.authorized || !auth.admin) {
        return NextResponse.json(
          { error: "Unauthorized. Valid signed token or Admin session required." },
          { status: 403 }
        );
      }
      adminUsername = auth.admin.username;
    }

    const customer = getServerCustomerById(customerId);
    if (!customer || !customer.panImageUrl) {
      return NextResponse.json(
        { error: "PAN document not found." },
        { status: 404 }
      );
    }

    // MANDATORY AUDIT LOG: LOG EVERY ADMIN VIEW OF A PAN IMAGE IN AUDIT_LOGS
    recordServerAuditLog({
      customerId,
      eventType: "ADMIN_PAN_VIEWED",
      description: `Admin [${adminUsername}] accessed customer verified PAN document (${maskPAN(customer.panNumber)}) via signed link.`,
      actor: "ADMIN",
      adminUsername,
      ipAddress: ip,
    });

    return NextResponse.json({
      success: true,
      customerId,
      customerName: customer.name,
      panNumberMasked: maskPAN(customer.panNumber),
      panImageUrl: customer.panImageUrl,
      accessedBy: adminUsername,
      accessedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to retrieve PAN document." },
      { status: 500 }
    );
  }
}
