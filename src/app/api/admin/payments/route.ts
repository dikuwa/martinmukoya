import { created, parseJson, serverError, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { recordBookingDeposit, recordPayment } from "@/lib/finance-service";
import { PaymentBalanceConflict } from "@/lib/payment-transaction";
import { paymentCreateSchema } from "@/lib/validation/finance";
import { db } from "@/lib/db";
import { z } from "zod";
export async function POST(request: Request) {
  let idempotencyKey: string | undefined;
  try {
    const { session, error } = await requireAdmin(); if (error) return error;
    const input = await parseJson(request, paymentCreateSchema);
    idempotencyKey = input.idempotencyKey || request.headers.get("idempotency-key") || undefined;
    if (input.invoiceId) return created(await recordPayment({ ...input, idempotencyKey, invoiceId: input.invoiceId, userId: session.user.id }));
    if (input.bookingId) return created(await recordBookingDeposit({ ...input, idempotencyKey, bookingId: input.bookingId, userId: session.user.id }));
    return Response.json({ error: "Select an invoice or a project to record a payment against." }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    if (error instanceof PaymentBalanceConflict) return Response.json({ error: error.message }, { status: 409 });
    if (idempotencyKey && error instanceof Error && "code" in error && error.code === "P2002") {
      const existing = await db.payment.findUnique({ where: { idempotencyKey } });
      if (existing) return created(existing);
    }
    return serverError(error);
  }
}
