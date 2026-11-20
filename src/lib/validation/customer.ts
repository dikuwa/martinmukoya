import { z } from "zod";

const optional = z.string().trim().max(500).optional().nullable();
const email = z.union([z.string().trim().email(), z.literal("")]).optional().nullable();

export const customerSchema = z.object({
  name: z.string().trim().min(2).max(160),
  company: optional,
  email,
  phone: optional,
  whatsAppNumber: optional,
  address: optional,
  town: optional,
  notes: z.string().trim().max(5000).optional().nullable(),
  status: z.enum(["LEAD", "PROSPECT", "CUSTOMER", "INACTIVE"]).default("CUSTOMER"),
}).refine(v => Boolean(v.email || v.phone || v.whatsAppNumber), {
  message: "Add an email, phone, or WhatsApp number.",
  path: ["email"],
});

export const quickJobSchema = z.object({
  customerId: z.string().min(1),
  siteId: z.string().min(1),
  description: z.string().trim().min(3).max(2000),
  amount: z.number().nonnegative().optional(),
});

export const serviceSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: optional,
  price: z.number().finite().nonnegative(),
});