import { z } from "zod";
import { parsePaymentAmount } from "../financial";

const optionalText = z.string().trim().optional().nullable();
const optionalEmail = z.preprocess((value) => value === "" ? null : value, z.string().trim().email().optional().nullable());
const money = z.union([z.string(), z.number()]);
const optionalMoney = z.preprocess((value) => value === "" ? null : value, money.optional().nullable());
const paymentAmount = money.refine((value) => {
  try { parsePaymentAmount(value); return true; } catch { return false; }
}, "Payment must be a positive amount with at most two decimal places.");

export const bookingCreateSchema = z.object({
  siteId: z.string().min(1), leadId: optionalText, contactId: optionalText,
  customerName: z.string().trim().min(2), customerEmail: optionalEmail,
  customerPhone: optionalText, company: optionalText, projectDescription: z.string().trim().min(3), budgetRange: optionalText,
  contractAmount: optionalMoney,
  source: z.string().trim().min(1).max(60).optional(),
});

export const documentDraftSchema = z.object({
  bookingId: z.string().min(1), type: z.enum(["QUOTE", "INVOICE"]),
  customerName: z.string().trim().min(2), customerEmail: optionalEmail,
  customerPhone: optionalText, customerCompany: optionalText, customerAddress: optionalText,
  validUntil: optionalText, dueDate: optionalText, discountAmount: money.default(0), additionalCharges: money.default(0),
  taxRate: money.default(0), notes: optionalText, paymentTerms: optionalText,
  lines: z.array(z.object({ description: z.string().trim().min(1), category: optionalText, quantity: money, unitPrice: money })).min(1),
});

export const paymentCreateSchema = z.object({
  invoiceId: z.string().min(1).optional(), bookingId: z.string().min(1).optional(),
  amount: paymentAmount, method: z.enum(["CASH", "BANK_TRANSFER", "CARD", "OTHER"]),
  paidAt: optionalText, reference: optionalText, notes: optionalText,
});
