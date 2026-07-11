import { z } from "zod";

const optionalText = z.string().trim().optional().nullable();
const money = z.union([z.string(), z.number()]);

export const bookingCreateSchema = z.object({
  siteId: z.string().min(1), leadId: optionalText,
  customerName: z.string().trim().min(2), customerEmail: z.string().trim().email().optional().nullable(),
  customerPhone: optionalText, company: optionalText, projectDescription: z.string().trim().min(3), budgetRange: optionalText,
});

export const documentDraftSchema = z.object({
  bookingId: z.string().min(1), type: z.enum(["QUOTE", "INVOICE"]),
  customerName: z.string().trim().min(2), customerEmail: z.string().trim().email().optional().nullable(),
  customerPhone: optionalText, customerCompany: optionalText, customerAddress: optionalText,
  validUntil: optionalText, dueDate: optionalText, discountAmount: money.default(0), additionalCharges: money.default(0),
  taxRate: money.default(0), notes: optionalText, paymentTerms: optionalText,
  lines: z.array(z.object({ description: z.string().trim().min(1), category: optionalText, quantity: money, unitPrice: money })).min(1),
});

export const paymentCreateSchema = z.object({
  invoiceId: z.string().min(1), amount: money, method: z.enum(["CASH", "BANK_TRANSFER", "CARD", "OTHER"]),
  paidAt: optionalText, reference: optionalText, notes: optionalText,
});

