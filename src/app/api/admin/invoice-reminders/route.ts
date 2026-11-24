import { created, ok, serverError, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { runPaymentTransaction } from "@/lib/payment-transaction";
import { sharedDocumentIsPublic } from "@/lib/shared-document-access";
import { invoiceReminderDetails, reminderRecipients } from "@/lib/reminder";
import { z } from "zod";

const schema = z.object({
  invoiceId: z.string().min(1),
  channel: z.enum(["WHATSAPP", "EMAIL", "COPY"]),
  includeLink: z.boolean().optional(),
});
export async function POST(request: Request) {
  try {
    const { error } = await requireAdmin(); if (error) return error;
    const input = schema.parse(await request.json());
    return await runPaymentTransaction(async tx => {
      const invoice = await tx.financialDocument.findUnique({
        where: { id: input.invoiceId },
        include: { payments: { where: { reversedAt: null } }, sharedDocument: true, booking: { include: { contact: true, lead: true } } },
      });
      if (!invoice || invoice.type !== "INVOICE" || !["ISSUED", "PARTIALLY_PAID"].includes(invoice.status))
        return ok({ error: "An outstanding issued invoice is required." }, { status: 400 });
      const reminder = invoiceReminderDetails(invoice);
      if (reminder.balance <= 0) return ok({ error: "Invoice is already fully paid." }, { status: 400 });

      const { phone, email } = reminderRecipients(invoice);
      const destination = input.channel === "WHATSAPP" ? phone : input.channel === "EMAIL" ? email : null;
      if (input.channel !== "COPY" && !destination)
        return ok({ error: "Customer contact detail is missing." }, { status: 400 });

      let message = reminder.message;
      const share = invoice.sharedDocument;
      if (input.includeLink) {
        if (!share || !sharedDocumentIsPublic({ ...share, financialDocument: invoice })) {
          return ok({ error: "The invoice link is no longer active." }, { status: 409 });
        }
        const link = new URL(`/d/${share.shortCode}`, request.url);
        message += `\nInvoice: ${link.href}`;
      }
      const data = { invoiceId: invoice.id, channel: input.channel, destination, message };
      const recent = await tx.invoiceReminder.findFirst({
        where: { ...data, createdAt: { gte: new Date(Date.now() - 60_000) } },
        orderBy: { createdAt: "desc" },
      });
      return recent ? ok(recent) : created(await tx.invoiceReminder.create({ data }));
    });
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}