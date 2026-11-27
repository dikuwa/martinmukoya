import { created, serverError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;
    const source = await db.businessDocumentTemplate.findUnique({ where: { id: (await context.params).id } });
    if (!source) return Response.json({ error: "Template not found" }, { status: 404 });
    const duplicate = await db.businessDocumentTemplate.create({
      data: {
        name: `Copy of ${source.name} · ${Date.now().toString(36)}`,
        documentCategory: source.documentCategory,
        documentType: source.documentType,
        defaultTitle: source.defaultTitle,
        defaultSubject: source.defaultSubject,
        defaultBodyMarkdown: source.defaultBodyMarkdown,
        aiInstructions: source.aiInstructions,
        defaultTone: source.defaultTone,
        defaultStyle: source.defaultStyle,
        defaultLength: source.defaultLength,
        signatureRequired: source.signatureRequired,
        senderName: source.senderName,
        senderRole: source.senderRole,
        active: true,
        sortOrder: source.sortOrder,
        createdById: session.user.id,
      },
    });
    return created(duplicate);
  } catch (error) {
    return serverError(error);
  }
}
