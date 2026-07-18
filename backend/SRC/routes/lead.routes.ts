import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validate";
import { captureLead } from "../services/leadService";

const router = Router();

router.post(
  "/newsletter",
  [body("emailId").isEmail().withMessage("A valid email is required")],
  validate,
  async (req: Request, res: Response) => {
    await captureLead({ emailId: req.body.emailId, leadSource: "NEWSLETTER" });
    res.status(201).json({ success: true, message: "You're on the list — welcome to the Aryora Circle." });
  }
);

router.post(
  "/enquiry",
  [
    body("fullName").trim().notEmpty(),
    body("emailId").isEmail(),
    body("mobileNumber").isMobilePhone("en-IN"),
    body("customerNotes").trim().notEmpty().withMessage("Please tell us what you'd like to know"),
  ],
  validate,
  async (req: Request, res: Response) => {
    const { fullName, emailId, mobileNumber, customerNotes, productName, productCode } = req.body;
    await captureLead({
      fullName, emailId, mobileNumber, customerNotes, productName, productCode, leadSource: "ENQUIRY",
    });
    res.status(201).json({ success: true, message: "Thank you — our concierge team will reach out shortly." });
  }
);

router.post(
  "/appointment",
  [
    body("fullName").trim().notEmpty(),
    body("emailId").isEmail(),
    body("mobileNumber").isMobilePhone("en-IN"),
  ],
  validate,
  async (req: Request, res: Response) => {
    const { fullName, emailId, mobileNumber, customerNotes } = req.body;
    await captureLead({
      fullName, emailId, mobileNumber, customerNotes, leadSource: "APPOINTMENT",
    });
    res.status(201).json({ success: true, message: "Appointment request received — we'll confirm a time by phone or email." });
  }
);

export default router;
