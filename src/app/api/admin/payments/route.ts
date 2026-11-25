import { created, parseJson, serverError, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { recordBookingDeposit, recordPayment } from "@/lib/finance-service";
import { PaymentIdempotencyConflict } from "@/lib/payment-idempotency";
import { PaymentBalanceConflict } from "@/lib/payment-transaction";
import { paymentCreateSchema } from "@/lib/validation/finance";
import { z } from "zod";
export async function POST(request: Request) {
  try {
    const { session, error } = await requireAdmin(); if (error) return error;
    const input = await parseJson(request, paymentCreateSchema);
    if (input.invoiceId && input.bookingId) {
      return Response.json({ error: "Select only one invoice or project for this payment." }, { status: 400 });
    }
    const headerKey = paymentCreateSchema.shape.idempotencyKey.parse(request.headers.get("idempotency-key") ?? undefined);
    if (headerKey && input.idempotencyKey && headerKey !== input.idempotencyKey) {
      return Response.json({ error: "The header and body idempotency keys must match." }, { status: 400 });
    }
    const idempotencyKey = input.idempotencyKey ?? headerKey;
    if (input.invoiceId) return created(await recordPayment({ ...input, idempotencyKey, invoiceId: input.invoiceId, userId: session.user.id }));
    if (input.bookingId) return created(await recordBookingDeposit({ ...input, idempotencyKey, bookingId: input.bookingId, userId: session.user.id }));
    return Response.json({ error: "Select an invoice or a project to record a payment against." }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    if (error instanceof PaymentBalanceConflict || error instanceof PaymentIdempotencyConflict) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    return serverError(error);
  }
}
