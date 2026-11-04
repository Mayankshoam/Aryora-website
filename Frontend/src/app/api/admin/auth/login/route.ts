import { NextResponse } from "next/server";
import { authenticateAdminCredentials } from "@/lib/adminAuth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    // Rate limit: 5 attempts per 15 minutes per IP
    const rateCheck = checkRateLimit(`admin-login:${ip}`, {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Please try again in ${rateCheck.resetInSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and PIN / password are required." },
        { status: 400 }
      );
    }

    const authResult = authenticateAdminCredentials(username, password);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error || "Authentication failed." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      token: authResult.token,
      role: "admin",
      username: username.trim().toLowerCase(),
      expiresIn: 8 * 60 * 60,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error." },
      { status: 500 }
    );
  }
}
