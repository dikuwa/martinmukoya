import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { trackServerEvent } from "@/lib/analytics";

type Context = { params: Promise<{ id: string }> };

const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(500),
  body: z.string().min(1).max(10000),
  includePdf: z.boolean().optional().default(false),
  includeLink: z.boolean().optional().default(true),
  shortLink: z.string().optional().default(""),
});

export async function POST(request: Request, context: Context) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;
    const id = (await context.params).id;

    const doc = await db.businessDocument.findUnique({ where: { id } });
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    if (doc.status === "DRAFT") return NextResponse.json({ error: "Issue the document before emailing." }, { status: 409 });

    if (!process.env.RESEND_API_KEY) return NextResponse.json({ skipped: true, message: "Email service is not configured." });

    const body = await request.json();
    const parsed = emailSchema.parse(body);

    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM_EMAIL || "FlexTech Media <info@martinmukoya.com>";

    let html = parsed.body.replace(/\n/g, "<br>");
    if (parsed.includeLink && parsed.shortLink) {
      html += `<br><br><a href="${parsed.shortLink}">View document online</a>`;
    }

    await resend.emails.send({
      from,
      to: parsed.to,
      subject: parsed.subject,
      html,
      ...(parsed.includePdf ? {
        attachments: [{
          filename: `${(doc.documentNumber || "document").replace(/[^a-z0-9-]/gi, "_")}.pdf`,
          content: Buffer.from(doc.contentMarkdown).toString("base64"),
        }]
      } : {}),
    });

    await db.businessDocument.update({
      where: { id },
      data: {
        status: "SENT",
        auditLog: { create: { action: "EMAILED", detail: `Sent to ${parsed.to}`, userId: session.user.id } }
      }
    });

    void trackServerEvent({
      eventType: "business_document_emailed",
      source: "admin-business-documents",
      metadata: { documentId: id, to: parsed.to, userId: session.user.id },
    }).catch(() => undefined);

    return NextResponse.json({ sent: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("[business-document/email] Error:", error);
    return NextResponse.json({ error: "Email failed. Check email configuration." }, { status: 500 });
  }
}
