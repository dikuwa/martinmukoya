import { created, parseJson, serverError, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { bookingNumber } from "@/lib/finance-service";
import { bookingCreateSchema } from "@/lib/validation/finance";
import { db } from "@/lib/db";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAdmin(); if (error) return error;
    const input = await parseJson(request, bookingCreateSchema);
    const site = await db.site.findUnique({ where: { id: input.siteId } }); if (!site) throw new Error("Site not found.");
    const booking = await db.booking.create({ data: { ...input, leadId: input.leadId || null, number: bookingNumber(), createdById: session.user.id } });
    return created(booking);
  } catch (error) { if (error instanceof z.ZodError) return validationError(error); return serverError(error); }
}

