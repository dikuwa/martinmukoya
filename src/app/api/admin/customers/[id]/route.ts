import { ok, parseJson, serverError, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { matchingCustomers } from "@/lib/customer-identity";
import { runPaymentTransaction } from "@/lib/payment-transaction";
import { customerSchema } from "@/lib/validation/customer";
import { z } from "zod";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdmin(); if (error) return error;
    const input = await parseJson(request, customerSchema);
    const { id } = await context.params;
    return await runPaymentTransaction(async tx => {
      const matches = await matchingCustomers(tx, input, id);
      if (matches.length) return ok({ error: "Another customer uses these contact details." }, { status: 409 });
      const result = await tx.contact.updateMany({ where: { id }, data: { ...input, email: input.email || null } });
      if (!result.count) return ok({ error: "Customer not found." }, { status: 404 });
      return ok(await tx.contact.findUnique({ where: { id } }));
    });
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}