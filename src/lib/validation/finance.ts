import { z } from "zod";

const optionalText = z.string().trim().optional().nullable();
const optionalEmail = z.preprocess((value) => value === "" ? null : value, z.string().trim().email().optional().nullable());
const decimalValue = z.union([z.string(), z.number()]);
function hasDecimalPrecision(value: string | number, scale: number) {
  const text = String(value).trim();
  if (!/^-?\d+(\.\d+)?$/.test(text)) return false;
  return !(text.split(".")[1] || "").slice(scale).replace(/0/g, "");
}
const money = decimalValue.refine(value => hasDecimalPrecision(value, 2), {
  message: "Enter a valid amount with at most two decimal places.",
});
const quantity = decimalValue.refine(value => hasDecimalPrecision(value, 3), {
  message: "Enter a valid quantity with at most three decimal places.",
});
const optionalMoney = z.preprocess((value) => value === "" ? null : value, money.optional().nullable());

export const bookingCreateSchema = z.object({
  siteId: z.string().min(1), leadId: optionalText, contactId: optionalText,
  customerName: z.string().trim().min(2), customerEmail: optionalEmail,
  customerPhone: optionalText, company: optionalText, projectDescription: z.string().trim().min(3), budgetRange: optionalText,
  contractAmount: optionalMoney,
});

export const documentDraftSchema = z.object({
  bookingId: z.string().min(1), type: z.enum(["QUOTE", "INVOICE"]),
  customerName: z.string().trim().min(2), customerEmail: optionalEmail,
  customerPhone: optionalText, customerCompany: optionalText, customerAddress: optionalText,
  validUntil: optionalText, dueDate: optionalText, discountAmount: money.default(0), additionalCharges: money.default(0),
  taxRate: money.default(0), notes: optionalText, paymentTerms: optionalText,
  lines: z.array(z.object({ description: z.string().trim().min(1), category: optionalText, quantity, unitPrice: money })).min(1),
});

export const paymentCreateSchema = z.object({
  invoiceId: z.string().min(1).optional(), bookingId: z.string().min(1).optional(),
  amount: money, method: z.enum(["CASH", "BANK_TRANSFER", "CARD", "OTHER"]),
  paidAt: optionalText, reference: optionalText, notes: optionalText,
});
