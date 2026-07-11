import { ok, serverError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { seedTemplates } from "@/lib/business-document-service";

export async function POST() {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;
    const result = await seedTemplates(session.user.id);
    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}
