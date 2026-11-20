import { created, ok, parseJson, serverError, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
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
    const input = await parseJson(request, customerSchema);
    const filters = [
      ...(input.email ? [{ email: { equals: input.email, mode: "insensitive" as const } }] : []),
      ...(input.phone ? [{ phone: input.phone }] : []),
      ...(input.whatsAppNumber ? [{ whatsAppNumber: input.whatsAppNumber }] : []),
    ];
    const duplicate = await db.contact.findFirst({ where: { OR: filters } });
    if (duplicate) return ok({ error: "A customer with these contact details exists.", existingId: duplicate.id }, { status: 409 });
    return created(await db.contact.create({ data: { ...input, email: input.email || null, createdById: session.user.id } }));
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}