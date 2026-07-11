import { ok, serverError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { revokeShareLink, regenerateShareLink } from "@/lib/business-document-service";

type Context = { params: Promise<{ code: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const code = (await context.params).code;
    const body = await request.json().catch(() => ({}));

    if (body.action === "regenerate") {
      const result = await regenerateShareLink(code);
      return ok(result);
    }
    if (body.action === "revoke") {
      await revokeShareLink(code);
      return ok({ revoked: true });
    }
    if (body.action === "enable") {
      const { db } = await import("@/lib/db");
      const result = await db.sharedDocument.update({
        where: { shortCode: code },
        data: { shareEnabled: true, expiresAt: null },
      });
      return ok(result);
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return serverError(error);
  }
}
