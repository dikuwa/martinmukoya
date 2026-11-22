import { computeOutstanding, sumActivePayments } from "@/lib/financial";

export function invoiceReminderDetails(invoice: {
  number: string | null;
  customerName: string;
  total: string | number | { toString(): string };
  dueDate?: Date | null;
  payments: { amount: string | number | { toString(): string }; reversedAt?: Date | null }[];
}) {
  const paid = sumActivePayments(invoice.payments);
  const balance = computeOutstanding(invoice.total, paid);
  const formatted = new Intl.NumberFormat("en-NA", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(balance);
  const due = invoice.dueDate ? ` Due date: ${invoice.dueDate.toLocaleDateString("en-GB")}.` : "";
  return {
    paid,
    balance,
    message: `Hello ${invoice.customerName}, this is a friendly payment reminder for invoice ${invoice.number || "your invoice"}. The outstanding balance is N$ ${formatted}.${due} Please arrange payment when possible. Thank you.`,
  };
}
export function reminderRecipients(invoice: {
  customerEmail: string | null;
  customerPhone: string | null;
  booking: {
    contact: { email: string | null; phone: string | null; whatsAppNumber: string | null; phoneIsWhatsApp: boolean } | null;
    lead: { email: string; phone: string | null; whatsAppNumber: string | null; phoneIsWhatsApp: boolean; emailValid: boolean; phoneValid: boolean } | null;
  };
}) {
  const { contact, lead } = invoice.booking;
  const phone = contact
    ? contact.whatsAppNumber || (contact.phoneIsWhatsApp ? contact.phone : null)
    : lead?.whatsAppNumber || (lead?.phoneIsWhatsApp && lead.phoneValid ? lead.phone : null) || (lead ? null : invoice.customerPhone);
  const digits = phone?.replace(/\D/g, "").replace(/^00/, "").replace(/^0(?=\d{9}$)/, "264");
  return {
    phone: digits && /^\d{7,15}$/.test(digits) ? digits : null,
    email: contact ? contact.email : (lead?.emailValid ? lead.email : invoice.customerEmail),
  };
}
