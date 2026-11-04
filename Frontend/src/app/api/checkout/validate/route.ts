import { NextResponse } from "next/server";
import { BUSINESS_CONFIG } from "@/lib/config/business";

export async function POST(request: Request) {
  try {
    const { totalAmount, isPanVerified, customerId } = await request.json();
    const amount = Number(totalAmount || 0);

    // Rule 114B: Transactions exceeding Rs. 2,00,000 mandate verified PAN
    if (amount >= BUSINESS_CONFIG.panThresholdINR && !isPanVerified) {
      return NextResponse.json(
        {
          allowed: false,
          requiresPan: true,
          threshold: BUSINESS_CONFIG.panThresholdINR,
          message: `Orders of ₹${BUSINESS_CONFIG.panThresholdINR.toLocaleString(
            "en-IN"
          )} or above require a verified PAN Card as per Government of India regulations (Rule 114B). Please upload your PAN card in your Profile to complete this purchase.`,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      allowed: true,
      requiresPan: false,
      customerId,
      message: "Checkout regulatory validation passed.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { allowed: false, message: error.message || "Validation failed." },
      { status: 500 }
    );
  }
}
