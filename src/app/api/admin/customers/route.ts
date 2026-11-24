import { created, ok, parseJson, serverError, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { matchingCustomers } from "@/lib/customer-identity";
import { runPaymentTransaction } from "@/lib/payment-transaction";
import { customerSchema } from "@/lib/validation/customer";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin(); if (error) return error;
    const q = new URL(request.url).searchParams.get("q")?.trim() || "";
    return ok(await db.contact.findMany({
      where: q ? { OR: [
        { name: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
      ] } : {},
      orderBy: { updatedAt: "desc" }, take: 100,
    }));
  } catch (error) { return serverError(error); }
}

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAdmin(); if (error) return error;
    const input = await parseJson(request, customerSchema.and(z.object({
      bookingId: z.string().min(1).optional(),
      leadId: z.string().min(1).optional(),
    })));
    const { bookingId, leadId, ...details } = input;
    return await runPaymentTransaction(async tx => {
      const booking = bookingId
        ? await tx.booking.findUnique({ where: { id: bookingId } })
        : leadId ? await tx.booking.findUnique({ where: { leadId } }) : null;
      if (bookingId && !booking) {
        return ok({ error: "Booking not found." }, { status: 404 });
      }
      if (leadId && !await tx.lead.findUnique({ where: { id: leadId }, select: { id: true } })) {
        return ok({ error: "Lead not found." }, { status: 404 });
      }
      if (bookingId && leadId && booking?.leadId !== leadId) {
        return ok({ error: "Booking and lead do not match." }, { status: 400 });
      }
      if (booking?.contactId) {
        return ok({ error: "This booking is already linked to a customer.", existingId: booking.contactId }, { status: 409 });
      }
      const matches = await matchingCustomers(tx, details);
      if (matches.length) return ok({
        error: "A customer with these contact details exists.",
        existingId: matches.length === 1 ? matches[0].id : undefined,
      }, { status: 409 });
      const customer = await tx.contact.create({
        data: { ...details, email: details.email || null, createdById: session.user.id },
      });
      if (booking) {
        await tx.booking.update({
          where: { id: booking.id },
          data: { contactId: customer.id },
        });
      }
      return created({ ...customer, linkedBookingId: booking?.id ?? null });
    });
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}