import { created, ok, parseJson, serverError, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { serviceSchema } from "@/lib/validation/customer";
import { z } from "zod";

export async function GET() {
  try {
    const { error } = await requireAdmin(); if (error) return error;
    return ok(await db.serviceCatalogItem.findMany({ where: { active: true }, orderBy: { name: "asc" } }));
  } catch (error) { return serverError(error); }
}
export async function POST(request: Request) {
  try {
    const { error } = await requireAdmin(); if (error) return error;
    const input = await parseJson(request, serviceSchema);
    return created(await db.serviceCatalogItem.create({ data: { ...input, price: input.price.toFixed(2) } }));
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}