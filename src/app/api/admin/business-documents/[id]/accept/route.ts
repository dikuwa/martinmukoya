import { ok, serverError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { acceptDocument, AcceptanceConflict } from "@/lib/document-acceptance";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;
    const result = await acceptDocument({ kind: "business", id: (await context.params).id, userId: session.user.id }, { name: session.user.name || "Admin" });
    return ok(result);
  } catch (error) {
    if (error instanceof AcceptanceConflict) return Response.json({ error: error.message }, { status: 409 });
    return serverError(error);
  }
}
