import { notFound, ok, parseJson, serverError, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { bookingCreateSchema } from "@/lib/validation/finance";
import { runPaymentTransaction } from "@/lib/payment-transaction";
import { z } from "zod";

const schema = bookingCreateSchema.extend({ promoteToProject: z.boolean().optional() });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const input = await parseJson(request, schema);
    const { id } = await context.params;

    return await runPaymentTransaction(async tx => {
      const existing = await tx.booking.findUnique({ where: { id }, include: {
        lead: { select: { siteId: true } },
        _count: { select: { documents: true, payments: true } },
      } });
      if (!existing) return notFound("Booking not found.");
      if (input.leadId) {
        const lead = await tx.lead.findUnique({ where: { id: input.leadId }, select: { siteId: true } });
        if (!lead) return notFound("Lead not found.");
        if (lead.siteId !== input.siteId) return ok({ error: "The booking and lead must belong to the same site." }, { status: 409 });
      }
      if (existing.siteId !== input.siteId && (existing.lead || existing._count.documents || existing._count.payments)) {
        return ok({ error: "The site is fixed for projects linked to a lead or financial records." }, { status: 409 });
      }
      if (input.contactId && existing.contactId && input.contactId !== existing.contactId &&
          (existing._count.documents || existing._count.payments)) {
        return ok({ error: "This project already has a customer and financial history." }, { status: 409 });
      }
      if (input.contactId && !await tx.contact.findUnique({ where: { id: input.contactId }, select: { id: true } })) {
        return notFound("Customer not found.");
      }
      return ok(await tx.booking.update({ where: { id }, data: {
        siteId: input.siteId,
        contactId: input.contactId || undefined,
        kind: input.promoteToProject && existing.kind === "SERVICE" ? "PROJECT" : undefined,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        company: input.company,
        projectDescription: input.projectDescription,
        budgetRange: input.budgetRange,
        contractAmount: input.contractAmount != null && input.contractAmount !== "" ? String(input.contractAmount) : null,
        source: input.source || undefined,
      } }));
    });
  } catch (error) {
    return error instanceof z.ZodError ? validationError(error) : serverError(error);
  }
}
