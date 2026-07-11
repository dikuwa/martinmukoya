import { ok, serverError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { issueBusinessDocument } from "@/lib/business-document-service";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;
    const result = await issueBusinessDocument((await context.params).id, session.user.id);
    return ok(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to issue document";
    return Response.json({ error: message }, { status: 409 });
  }
}
