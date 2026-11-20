import { ok, parseJson, serverError, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { customerSchema } from "@/lib/validation/customer";
import { z } from "zod";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdmin(); if (error) return error;
    const input = await parseJson(request, customerSchema);
    return ok(await db.contact.update({
      where: { id: (await context.params).id },
      data: { ...input, email: input.email || null },
    }));
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}