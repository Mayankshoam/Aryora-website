import { NextResponse } from "next/server";
import { isValidIndianMobile } from "@/lib/customerStore";

export async function POST(request: Request) {
  try {
    const { mobile } = await request.json();
    const clean = String(mobile || "").replace(/\D/g, "");

    if (!isValidIndianMobile(clean)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    // In current mode (without external OTP gateway required):
    // Mock OTP code generated for testing/seamless onboarding
    const mockOtp = "123456";

    return NextResponse.json({
      success: true,
      message: `OTP dispatched to +91 ${clean}. (Mock code for testing: ${mockOtp})`,
      mobile: clean,
      mockOtp: mockOtp,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process mobile login." },
      { status: 500 }
    );
  }
}

