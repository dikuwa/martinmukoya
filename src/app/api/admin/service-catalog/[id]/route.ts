import { notFound, ok, parseJson, serverError, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { serviceSchema } from "@/lib/validation/customer";
import { z } from "zod";

const updateSchema = z.union([serviceSchema.strict(), z.object({ active: z.boolean() }).strict()]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const input = await parseJson(request, updateSchema);
    const { id } = await context.params;
    const data = "active" in input ? input : { ...input, price: input.price.toFixed(2) };
    const result = await db.serviceCatalogItem.updateMany({ where: { id }, data });
    return result.count ? ok({ updated: true }) : notFound("Service not found.");
  } catch (error) {
    return error instanceof z.ZodError ? validationError(error) : serverError(error);
  }
}
