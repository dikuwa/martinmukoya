import { created, serverError, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { invoiceReminderDetails } from "@/lib/reminder";
import { z } from "zod";

const schema = z.object({
  invoiceId: z.string().min(1),
  channel: z.enum(["WHATSAPP", "EMAIL", "COPY"]),
  message: z.string().trim().min(10).max(3000),
});
export async function POST(request: Request) {
  try {
    const { error } = await requireAdmin(); if (error) return error;
    const input = schema.parse(await request.json());
    const invoice = await db.financialDocument.findUnique({
      where: { id: input.invoiceId },
      include: { payments: { where: { reversedAt: null } }, booking: { include: { contact: true, lead: true } } },
    });
    if (!invoice || invoice.type !== "INVOICE" || !["ISSUED", "PARTIALLY_PAID"].includes(invoice.status))
      return Response.json({ error: "An outstanding issued invoice is required." }, { status: 400 });
    if (invoiceReminderDetails(invoice).balance <= 0)
      return Response.json({ error: "Invoice is already fully paid." }, { status: 400 });
    const destination = input.channel === "WHATSAPP"
      ? (invoice.booking.contact?.whatsAppNumber || invoice.booking.lead?.whatsAppNumber || invoice.customerPhone)
      : input.channel === "EMAIL" ? invoice.customerEmail : null;
    if (input.channel !== "COPY" && !destination)
      return Response.json({ error: "Customer contact detail is missing." }, { status: 400 });
    // This logs message preparation, not confirmed delivery.
    return created(await db.invoiceReminder.create({
      data: { invoiceId: invoice.id, channel: input.channel, destination, message: input.message },
    }));
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}