import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}

export async function comparePassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function signAccessToken(payload: { userId: string; role: string }) {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  } as jwt.SignOptions);
}

export function signRefreshToken(payload: { userId: string; role: string }) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  } as jwt.SignOptions);
}

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateCustomerId(sequence: number) {
  return `ARY-${String(sequence).padStart(6, "0")}`;
}

export function generateOrderNumber() {
  const ts = Date.now().toString().slice(-8);
  const rand = Math.floor(100 + Math.random() * 900);
  return `AOD-${ts}${rand}`;
}
