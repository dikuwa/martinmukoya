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
    const input = await parseJson(request, customerSchema);
    return await runPaymentTransaction(async tx => {
      const matches = await matchingCustomers(tx, input);
      if (matches.length) return ok({
        error: "A customer with these contact details exists.",
        existingId: matches.length === 1 ? matches[0].id : undefined,
      }, { status: 409 });
      return created(await tx.contact.create({ data: { ...input, email: input.email || null, createdById: session.user.id } }));
    });
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}