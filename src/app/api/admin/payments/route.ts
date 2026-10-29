import { created, parseJson, serverError, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { recordBookingDeposit, recordPayment } from "@/lib/finance-service";
import { paymentCreateSchema } from "@/lib/validation/finance";
import { z } from "zod";
export async function POST(request: Request) {
  try {
    const { session, error } = await requireAdmin(); if (error) return error;
    const input = await parseJson(request, paymentCreateSchema);
    if (input.invoiceId) return created(await recordPayment({ ...input, invoiceId: input.invoiceId, userId: session.user.id }));
    if (input.bookingId) return created(await recordBookingDeposit({ ...input, bookingId: input.bookingId, userId: session.user.id }));
    return Response.json({ error: "Select an invoice or a project to record a payment against." }, { status: 400 });
  } catch (error) { if (error instanceof z.ZodError) return validationError(error); return serverError(error); }
}
