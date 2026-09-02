import { ok, serverError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { issueBusinessDocument } from "@/lib/business-document-service";
import { findUnresolvedPlaceholders } from "@/lib/business-document-templates";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;
    const id = (await context.params).id;

    const doc = await db.businessDocument.findUnique({ where: { id } });
    if (!doc) return Response.json({ error: "Document not found" }, { status: 404 });

    const unresolved = findUnresolvedPlaceholders(doc.contentMarkdown);
    if (unresolved.length > 0) {
      return Response.json({ error: `This document still has unresolved placeholders: ${unresolved.join(", ")} — set values or edit the content before sending` }, { status: 409 });
    }

    const result = await issueBusinessDocument(id, session.user.id);
    return ok(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to issue document";
    return Response.json({ error: message }, { status: 409 });
  }
}
