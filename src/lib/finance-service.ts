import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { calculateDocumentTotals, type FinancialLineInput } from "@/lib/financial";

export type IssuerSnapshot = {
  name: string; logo: string; address: string; phone: string; email: string; registration: string;
  taxNumber: string; bankName: string; accountName: string; accountNumber: string; branch: string;
  swiftCode: string; companyDetails: string; paymentMethods: string[]; paymentInstructions: string;
  signerName: string; signerTitle: string; signatureMode: "text" | "image"; signatureImage: string; showSignature: boolean;
};

export const defaultIssuer: IssuerSnapshot = {
  name: "FlexTech Media", logo: "/assets/backgrounds/SVG/SVG/flex-dark.svg", address: "Windhoek, Namibia",
  phone: "+264 81 227 1574", email: "info@martinmukoya.com", registration: "CC/2024/00337", taxNumber: "",
  bankName: "Standard Bank", accountName: "FlexTech Media", accountNumber: "60005541734", branch: "082172",
  swiftCode: "SBNMNANX", companyDetails: "Reg. No. CC/2024/00337\nERF 234, Silver Avenue, Tamariskia, Swakopmund",
  paymentMethods: ["Bank transfer", "Blue Wallet", "Wallet", "EasyWallet", "Cheque"],
  paymentInstructions: "Payment by bank transfer. Use the document number as your reference.",
  signerName: "Martin Mukoya", signerTitle: "Managing Director", signatureMode: "text", signatureImage: "", showSignature: true,
};

export async function getIssuerSnapshot(): Promise<IssuerSnapshot> {
  const settings = await db.siteSetting.findMany({ where: { siteId: null, key: { startsWith: "finance." } } });
  const values = Object.fromEntries(settings.map((setting) => [setting.key.slice(8), setting.value]));
  let paymentMethods = defaultIssuer.paymentMethods;
  if (typeof values.paymentMethods === "string") {
    try { const parsed = JSON.parse(values.paymentMethods); if (Array.isArray(parsed)) paymentMethods = parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0); } catch {}
  }
  const showSignature = values.showSignature === undefined ? defaultIssuer.showSignature : values.showSignature === "true";
  return { ...defaultIssuer, ...values, paymentMethods, showSignature } as IssuerSnapshot;
}

function suffix(length: number) { return randomUUID().replace(/-/g, "").slice(0, length).toUpperCase(); }
function dateStamp(date = new Date()) { return date.toISOString().slice(0, 10).replace(/-/g, ""); }
export function bookingNumber() { return `BK-${dateStamp()}-${suffix(6)}`; }
export function paymentNumber() { return `PAY-${dateStamp()}-${suffix(6)}`; }
export function documentNumber(type: "QUOTE" | "INVOICE" | "RECEIPT") {
  const prefix = type === "QUOTE" ? "QUO" : type === "INVOICE" ? "INV" : "REC";
  return `${prefix}-${new Date().getFullYear()}-${suffix(8)}`;
}

export async function ensureBookingFromLead(leadId: string, userId?: string) {
  const existing = await db.booking.findUnique({ where: { leadId } });
  if (existing) return existing;
  const lead = await db.lead.findUnique({ where: { id: leadId } });
  if (!lead?.siteId) throw new Error("Lead must belong to a site before creating financial documents.");
  return db.booking.create({ data: {
    number: bookingNumber(), siteId: lead.siteId, leadId: lead.id, customerName: lead.name, customerEmail: lead.email,
    customerPhone: lead.phone, company: lead.company, projectDescription: lead.projectGoal || lead.message,
    budgetRange: lead.budgetRange, createdById: userId,
  } });
}

export async function createDraft(input: {
  bookingId: string; type: "QUOTE" | "INVOICE"; customerName: string; customerEmail?: string | null;
  customerPhone?: string | null; customerCompany?: string | null; customerAddress?: string | null;
  validUntil?: string | null; dueDate?: string | null; discountAmount?: string | number; additionalCharges?: string | number;
  taxRate?: string | number; notes?: string | null; paymentTerms?: string | null; lines: FinancialLineInput[]; userId?: string;
}) {
  const booking = await db.booking.findUnique({ where: { id: input.bookingId } });
  if (!booking) throw new Error("Booking not found.");
  const totals = calculateDocumentTotals(input);
  const issuer = await getIssuerSnapshot();
  return db.financialDocument.create({ data: {
    type: input.type, siteId: booking.siteId, bookingId: booking.id, customerName: input.customerName,
    customerEmail: input.customerEmail, customerPhone: input.customerPhone, customerCompany: input.customerCompany,
    customerAddress: input.customerAddress, issuerSnapshot: issuer, validUntil: input.validUntil ? new Date(input.validUntil) : null,
    dueDate: input.dueDate ? new Date(input.dueDate) : null, discountAmount: totals.discountAmount,
    additionalCharges: totals.additionalCharges, taxRate: totals.taxRate, subtotal: totals.subtotal,
    taxAmount: totals.taxAmount, total: totals.total, notes: input.notes, paymentTerms: input.paymentTerms,
    createdById: input.userId, lineItems: { create: totals.lines.map((line) => ({
      description: line.description, category: line.category, quantity: String(line.quantity), unitPrice: String(line.unitPrice),
      amount: line.amount, sortOrder: line.sortOrder,
    })) },
  }, include: { lineItems: { orderBy: { sortOrder: "asc" } }, booking: true } });
}

export async function issueDocument(id: string) {
  return db.$transaction(async (tx) => {
    const document = await tx.financialDocument.findUnique({ where: { id } });
    if (!document || document.status !== "DRAFT" || document.type === "RECEIPT") throw new Error("Only draft quotes and invoices can be issued.");
    return tx.financialDocument.update({ where: { id }, data: {
      number: documentNumber(document.type), status: "ISSUED", issuedAt: new Date(), shareToken: randomUUID(),
    }, include: { lineItems: { orderBy: { sortOrder: "asc" } }, booking: true } });
  });
}

export async function acceptFinancialDocument(id: string, input: { name: string }) {
  return db.$transaction(async (tx) => {
    const doc = await tx.financialDocument.findUnique({ where: { id } });
    if (!doc) throw new Error("Document not found.");
    if (doc.type !== "QUOTE") throw new Error("Only quotes can be accepted.");
    if (!["ISSUED"].includes(doc.status)) throw new Error("This quote is no longer available for acceptance.");
    return tx.financialDocument.update({
      where: { id },
      data: { status: "ACCEPTED", acceptedAt: new Date(), acceptedName: input.name },
    });
  });
}

export async function declineFinancialDocument(id: string) {
  return db.$transaction(async (tx) => {
    const doc = await tx.financialDocument.findUnique({ where: { id } });
    if (!doc) throw new Error("Document not found.");
    if (doc.type !== "QUOTE") throw new Error("Only quotes can be declined.");
    if (!["ISSUED"].includes(doc.status)) throw new Error("This quote is no longer available for response.");
    return tx.financialDocument.update({
      where: { id },
      data: { status: "DECLINED", declinedAt: new Date() },
    });
  });
}

export async function recordPayment(input: { invoiceId: string; amount: string | number; method: "CASH" | "BANK_TRANSFER" | "CARD" | "OTHER"; paidAt?: string | null; reference?: string | null; notes?: string | null; userId?: string }) {
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Payment amount must be greater than zero.");
  const issuer = await getIssuerSnapshot();
  return db.$transaction(async (tx) => {
    const invoice = await tx.financialDocument.findUnique({ where: { id: input.invoiceId }, include: { booking: true, payments: { where: { reversedAt: null } } } });
    if (!invoice || invoice.type !== "INVOICE" || !["ISSUED", "PARTIALLY_PAID"].includes(invoice.status)) throw new Error("Select an outstanding issued invoice.");
    const paid = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const balance = Number(invoice.total) - paid;
    if (amount > balance + 0.001) throw new Error("Payment cannot exceed the outstanding balance.");
    const receipt = await tx.financialDocument.create({ data: {
      number: documentNumber("RECEIPT"), type: "RECEIPT", status: "PAID", siteId: invoice.siteId, bookingId: invoice.bookingId,
      customerName: invoice.customerName, customerEmail: invoice.customerEmail, customerPhone: invoice.customerPhone,
      customerCompany: invoice.customerCompany, customerAddress: invoice.customerAddress, issuerSnapshot: issuer,
      subtotal: amount.toFixed(2), total: amount.toFixed(2), issuedAt: new Date(), shareToken: randomUUID(), createdById: input.userId,
      notes: input.notes, lineItems: { create: { description: `Payment received for ${invoice.number}`, category: "payment", quantity: 1, unitPrice: amount.toFixed(2), amount: amount.toFixed(2), sortOrder: 0 } },
    } });
    const payment = await tx.payment.create({ data: {
      number: paymentNumber(), siteId: invoice.siteId, bookingId: invoice.bookingId, invoiceId: invoice.id,
      receiptDocumentId: receipt.id, amount: amount.toFixed(2), method: input.method,
      paidAt: input.paidAt ? new Date(input.paidAt) : new Date(), reference: input.reference, notes: input.notes, recordedById: input.userId,
    }, include: { receiptDocument: true, invoice: true, booking: true } });
    const fullyPaid = Math.abs(balance - amount) < 0.001;
    const balanceNote = fullyPaid
      ? "Paid in full."
      : `Balance remaining: N$${(balance - amount).toFixed(2)}. Invoice status: Partially paid.`;
    const receiptNotes = [input.notes, balanceNote].filter(Boolean).join("\n\n");
    await tx.financialDocument.update({ where: { id: receipt.id }, data: { notes: receiptNotes || null } });
    await tx.financialDocument.update({ where: { id: invoice.id }, data: { status: fullyPaid ? "PAID" : "PARTIALLY_PAID" } });
    return payment;
  });
}
