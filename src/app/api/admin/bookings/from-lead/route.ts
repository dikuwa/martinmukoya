import { created, parseJson, serverError, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { ensureBookingFromLead } from "@/lib/finance-service";
import { z } from "zod";

const schema = z.object({ leadId: z.string().min(1) });
export async function POST(request: Request) {
  try { const { session, error } = await requireAdmin(); if (error) return error; const input = await parseJson(request, schema); return created(await ensureBookingFromLead(input.leadId, session.user.id)); }
  catch (error) { if (error instanceof z.ZodError) return validationError(error); return serverError(error); }
}

