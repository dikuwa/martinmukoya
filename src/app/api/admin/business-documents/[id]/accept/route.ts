import { ok, serverError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { acceptBusinessDocument } from "@/lib/business-document-service";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;
    const result = await acceptBusinessDocument((await context.params).id, { name: session.user.name || "Admin" }, session.user.id);
    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}
