import { created, parseJson, serverError, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { createDraft } from "@/lib/finance-service";
import { documentDraftSchema } from "@/lib/validation/finance";
import { z } from "zod";

export async function POST(request: Request) {
  try { const { session, error } = await requireAdmin(); if (error) return error; const input = await parseJson(request, documentDraftSchema); return created(await createDraft({ ...input, userId: session.user.id })); }
  catch (error) { if (error instanceof z.ZodError) return validationError(error); return serverError(error); }
}

