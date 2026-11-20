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