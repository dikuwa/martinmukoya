import { created, serverError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { reviseBusinessDocument } from "@/lib/business-document-service";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;
    const result = await reviseBusinessDocument((await context.params).id, session.user.id);
    return created(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to revise document";
    return Response.json({ error: message }, { status: 409 });
  }
}
