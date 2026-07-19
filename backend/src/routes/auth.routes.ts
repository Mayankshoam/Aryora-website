import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { prisma } from "../prisma/client";
import { AppError } from "../middleware/errorHandler";
import { requireAuth } from "../middleware/auth";
import {
  comparePassword,
  generateOtp,
  hashPassword,
  signAccessToken,
  signRefreshToken,
} from "../utils/auth";
import { validate } from "../middleware/validate";
import { captureLead } from "../services/leadService";
import { sendOtpEmail, sendWelcomeEmail } from "../services/emailService";

const router = Router();

router.post(
  "/register",
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required"),
    body("email").isEmail().withMessage("A valid email is required"),
    body("phone").isMobilePhone("en-IN").withMessage("A valid Indian mobile number is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  validate,
  async (req: Request, res: Response) => {
    const { fullName, email, phone, password, dateOfBirth, anniversary } = req.body;

    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
    if (existing) throw new AppError("An account with this email or phone already exists.", 409);

    const passwordHash = await hashPassword(password);
    const otpCode = generateOtp();

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        passwordHash,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        anniversary: anniversary ? new Date(anniversary) : undefined,
        otpCode,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendOtpEmail(user.email, otpCode);

    await captureLead({
      userId: user.id,
      fullName: user.fullName,
      mobileNumber: user.phone ?? undefined,
      emailId: user.email,
      dateOfBirth: user.dateOfBirth ?? undefined,
      anniversary: user.anniversary ?? undefined,
      leadSource: "REGISTER",
    });

    res.status(201).json({
      success: true,
      message: "Account created. An OTP has been sent to your email for verification.",
      userId: user.id,
    });
  }
);

router.post(
  "/verify-otp",
  [body("userId").notEmpty(), body("otp").isLength({ min: 6, max: 6 })],
  validate,
  async (req: Request, res: Response) => {
    const { userId, otp } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("Account not found.", 404);
    if (user.isVerified) return res.json({ success: true, message: "Already verified." });

    if (user.otpCode !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new AppError("Invalid or expired OTP.", 400);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true, otpCode: null, otpExpiresAt: null },
    });

    await sendWelcomeEmail(user.email, user.fullName);

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

    res.json({ success: true, message: "Email verified.", accessToken, refreshToken });
  }
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  validate,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("Invalid email or password.", 401);

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) throw new AppError("Invalid email or password.", 401);

    if (!user.isVerified) throw new AppError("Please verify your email before logging in.", 403);

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  }
);

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, fullName: true, email: true, phone: true, role: true, dateOfBirth: true, anniversary: true },
  });
  res.json({ success: true, user });
});

export default router;
