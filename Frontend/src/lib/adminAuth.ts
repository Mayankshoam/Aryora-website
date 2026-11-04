/**
 * Admin Authentication & Signed URL / Token Utilities
 * Enforces role checks ('admin' only) and signs short-lived PAN inspection tokens.
 */

import crypto from "crypto";

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || "ayor_master_secret_key_luxury_atelier_2026";
const ADMIN_VALID_PASSWORDS = ["ayor2026", "880882", process.env.ADMIN_PASSWORD].filter(Boolean) as string[];

export interface AdminPayload {
  role: "admin";
  username: string;
  iat: number;
  exp: number;
}

export interface PanSignedTokenPayload {
  customerId: string;
  adminUsername: string;
  type: "pan_view";
  exp: number; // Unix timestamp
}

/**
 * Creates an HMAC signature for a string payload
 */
function signPayload(payloadStr: string): string {
  return crypto.createHmac("sha256", ADMIN_SECRET).update(payloadStr).digest("hex");
}

/**
 * Authenticates admin credentials and issues a signed session token.
 */
export function authenticateAdminCredentials(
  identifier: string,
  secretKey: string
): { success: boolean; token?: string; error?: string } {
  const cleanId = identifier.trim().toLowerCase();
  const validUsers = ["admin", "admin@ayor.in", "master@ayorjewellery.com", "ayor"];

  if (!validUsers.includes(cleanId)) {
    return { success: false, error: "Invalid admin username or email address." };
  }

  if (!ADMIN_VALID_PASSWORDS.includes(secretKey)) {
    return { success: false, error: "Invalid Master Admin PIN / Password." };
  }

  const now = Math.floor(Date.now() / 1000);
  const payload: AdminPayload = {
    role: "admin",
    username: cleanId,
    iat: now,
    exp: now + 8 * 60 * 60, // 8 hour admin session
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signPayload(payloadB64);
  const token = `${payloadB64}.${signature}`;

  return { success: true, token };
}

/**
 * Verifies that a request carries an authentic Admin token with role === 'admin'.
 */
export function verifyAdminToken(tokenString?: string | null): {
  authorized: boolean;
  admin?: AdminPayload;
  error?: string;
} {
  if (!tokenString) {
    return { authorized: false, error: "Missing authorization token." };
  }

  const parts = tokenString.split(".");
  if (parts.length !== 2) {
    return { authorized: false, error: "Malformed authorization token." };
  }

  const [payloadB64, signature] = parts;
  const expectedSig = signPayload(payloadB64);

  if (signature !== expectedSig) {
    return { authorized: false, error: "Invalid signature. Access denied." };
  }

  try {
    const payload: AdminPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    );

    if (payload.role !== "admin") {
      return { authorized: false, error: "Insufficient permissions. Admin role required." };
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return { authorized: false, error: "Admin session has expired. Please re-authenticate." };
    }

    return { authorized: true, admin: payload };
  } catch {
    return { authorized: false, error: "Invalid token payload." };
  }
}

/**
 * Extracts the bearer token from a Request's Authorization header or query params.
 */
export function extractAdminToken(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }
  const url = new URL(req.url);
  const queryToken = url.searchParams.get("adminToken");
  if (queryToken) return queryToken;

  return null;
}

/**
 * Generates a short-lived (e.g. 60 seconds) cryptographically signed viewing URL
 * for inspecting customer PAN documents.
 */
export function generatePanSignedUrl(
  customerId: string,
  adminUsername: string,
  ttlSeconds: number = 60
): { signedUrl: string; token: string; expiresAt: number } {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload: PanSignedTokenPayload = {
    customerId,
    adminUsername,
    type: "pan_view",
    exp,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signPayload(payloadB64);
  const token = `${payloadB64}.${signature}`;
  const signedUrl = `/api/admin/customers/${encodeURIComponent(customerId)}/pan-image?token=${encodeURIComponent(token)}`;

  return { signedUrl, token, expiresAt: exp * 1000 };
}

/**
 * Validates a short-lived signed PAN viewing token.
 */
export function verifyPanSignedToken(
  tokenString: string
): { valid: boolean; payload?: PanSignedTokenPayload; error?: string } {
  const parts = tokenString.split(".");
  if (parts.length !== 2) {
    return { valid: false, error: "Invalid token structure." };
  }

  const [payloadB64, signature] = parts;
  const expectedSig = signPayload(payloadB64);

  if (signature !== expectedSig) {
    return { valid: false, error: "Invalid signature on PAN signed token." };
  }

  try {
    const payload: PanSignedTokenPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    );

    if (payload.type !== "pan_view") {
      return { valid: false, error: "Invalid token purpose." };
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return { valid: false, error: "This signed PAN inspection link has expired." };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, error: "Corrupted signed token payload." };
  }
}
