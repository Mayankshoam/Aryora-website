import { NextResponse } from "next/server";
import { isValidIndianMobile } from "@/lib/customerStore";

export async function POST(request: Request) {
  try {
    const { mobile, name } = await request.json();
    const clean = String(mobile || "").replace(/\D/g, "");

    if (!isValidIndianMobile(clean)) {
      return NextResponse.json(
        { success: false, message: "Valid 10-digit Indian mobile number is required." },
        { status: 400 }
      );
    }

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const customerId = `CUST-${randomSuffix}`;

    return NextResponse.json({
      success: true,
      token: `ayor_jwt_${clean}_${Date.now()}`,
      customer: {
        customerId,
        mobile: clean,
        name: name || "Atelier Client",
        panVerified: false,
        nameLocked: false,
        hasWelcomeDiscount: true,
        welcomeCoupon: "AYOR10",
      },
      message: "Mobile verified successfully. Welcome privilege unlocked!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to verify mobile." },
      { status: 500 }
    );
  }
}
