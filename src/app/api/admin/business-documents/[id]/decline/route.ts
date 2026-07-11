import { ok, serverError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { declineBusinessDocument } from "@/lib/business-document-service";
import { z } from "zod";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;
    const body = await request.json().catch(() => ({}));
    const { reason, comment } = z.object({
      reason: z.string().optional(),
      comment: z.string().optional(),
    }).parse(body);
    const result = await declineBusinessDocument((await context.params).id, reason, comment, session.user.id);
    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}
