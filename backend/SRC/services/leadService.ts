import { LeadSource } from "@prisma/client";
import { prisma } from "../prisma/client";
import { generateCustomerId } from "../utils/auth";
import { syncLeadToSheet } from "./sheetSyncService";

export interface CaptureLeadInput {
  userId?: string;
  fullName?: string;
  mobileNumber?: string;
  emailId?: string;
  dateOfBirth?: Date;
  anniversary?: Date;
  productName?: string;
  productCode?: string;
  quantity?: number;
  cartValue?: number;
  orderId?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  leadSource: LeadSource;
  customerNotes?: string;
}

/**
 * Validates and stores a lead in the database, then attempts an
 * immediate best-effort sync to the connected cloud spreadsheet.
 * If the live sync fails, the lead is left with status FAILED so the
 * retry worker (see retrySyncQueue) can pick it up later — the
 * customer-facing action (register / order / etc.) never blocks or
 * fails because of a spreadsheet outage.
 */
export async function captureLead(input: CaptureLeadInput) {
  if (!input.emailId && !input.mobileNumber && !input.userId) {
    throw new Error("A lead needs at least an email, phone, or linked user account.");
  }

  // Duplicate check: same email/phone within the same lead source in the last 5 minutes
  // avoids double rows from double-clicks or client retries, while still recording
  // genuinely repeated actions (e.g. two separate orders) as separate rows.
  const dupe = await prisma.lead.findFirst({
    where: {
      leadSource: input.leadSource,
      OR: [
        input.emailId ? { emailId: input.emailId } : undefined,
        input.mobileNumber ? { mobileNumber: input.mobileNumber } : undefined,
      ].filter(Boolean) as any,
      createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
    },
    orderBy: { createdAt: "desc" },
  });
  if (dupe && !input.orderId) return dupe;

  const count = await prisma.lead.count();
  const customerId = generateCustomerId(count + 1);

  const lead = await prisma.lead.create({
    data: {
      customerId,
      userId: input.userId,
      fullName: input.fullName,
      mobileNumber: input.mobileNumber,
      emailId: input.emailId,
      dateOfBirth: input.dateOfBirth,
      anniversary: input.anniversary,
      productName: input.productName,
      productCode: input.productCode,
      quantity: input.quantity,
      cartValue: input.cartValue,
      orderId: input.orderId,
      address: input.address,
      city: input.city,
      state: input.state,
      pinCode: input.pinCode,
      leadSource: input.leadSource,
      customerNotes: input.customerNotes,
    },
  });

  // Fire-and-forget: don't make the customer wait on a third-party API.
  syncLeadToSheet(lead.id).catch(() => {
    /* errors are recorded on the Lead row itself inside syncLeadToSheet */
  });

  return lead;
}

/** Called by a scheduled job (e.g. every 5 minutes) to retry failed syncs. */
export async function retrySyncQueue(maxAttempts = 5) {
  const pending = await prisma.lead.findMany({
    where: { status: { in: ["NEW", "FAILED"] }, syncAttempts: { lt: maxAttempts } },
    take: 50,
  });

  const results = await Promise.allSettled(pending.map((l: { id: string }) => syncLeadToSheet(l.id)));
  return {
    attempted: pending.length,
    succeeded: results.filter((r) => r.status === "fulfilled").length,
  };
}
