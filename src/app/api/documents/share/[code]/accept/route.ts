import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { acceptBusinessDocument } from "@/lib/business-document-service";
import { acceptFinancialDocument } from "@/lib/finance-service";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

type Context = { params: Promise<{ code: string }> };

const acceptSchema = z.object({
  name: z.string().trim().min(1, "Full name is required"),
  comment: z.string().trim().max(1000).optional(),
});

export async function POST(request: Request, context: Context) {
  // Rate limit: 5 accept/decline actions per 5 minutes per IP
  const ip = getClientIp(request);
  const { success } = await rateLimit(`share:action:${ip}`, { limit: 5, windowSeconds: 300 });
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }
  try {
    const code = (await context.params).code;
    const share = await db.sharedDocument.findUnique({
      where: { shortCode: code },
      include: { businessDocument: true, financialDocument: true },
    });

    if (!share || !share.shareEnabled || (share.expiresAt && share.expiresAt < new Date())) {
      return NextResponse.json({ error: "Document not found or link has expired." }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = acceptSchema.parse(body);
    const userAgent = request.headers.get("user-agent") || undefined;

    // Financial document (QUOTE) acceptance
    if (share.financialDocument) {
      const doc = share.financialDocument;
      if (doc.type !== "QUOTE") {
        return NextResponse.json({ error: "Acceptance is only available for quotes." }, { status: 400 });
      }
      if (doc.status === "ACCEPTED" || doc.acceptedAt) {
        return NextResponse.json({ error: "Quote has already been accepted." }, { status: 409 });
      }
      if (doc.status === "DECLINED" || doc.declinedAt) {
        return NextResponse.json({ error: "Quote has already been declined." }, { status: 409 });
      }
      if (!["ISSUED"].includes(doc.status)) {
        return NextResponse.json({ error: "This quote is no longer available for acceptance." }, { status: 409 });
      }

      await acceptFinancialDocument(doc.id, { name: parsed.name });

      // Create notification for admin
      await db.notification.create({
        data: {
          siteId: doc.siteId,
          type: "quote_accepted",
          sourceId: doc.id,
          title: `Quote ${doc.number || "draft"} accepted`,
          detail: `Accepted by ${parsed.name}`,
          href: `/admin/documents/${doc.id}`,
        },
      }).catch(() => undefined);

      // Update shared document tracking
      await db.sharedDocument.update({
        where: { id: share.id },
        data: {
          acceptedAt: new Date(),
          acceptedName: parsed.name,
          acceptedComment: parsed.comment,
          acceptedIp: ip,
          acceptedUserAgent: userAgent,
        },
      });

      return NextResponse.json({ accepted: true, message: "Quote accepted. Thank you." });
    }

    // Business document acceptance
    if (!share.businessDocument) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    if (share.businessDocument.status === "ACCEPTED" || share.acceptedAt) {
      return NextResponse.json({ error: "Document has already been accepted." }, { status: 409 });
    }

    if (share.businessDocument.status === "DECLINED" || share.declinedAt) {
      return NextResponse.json({ error: "Document has already been declined." }, { status: 409 });
    }

    await acceptBusinessDocument(share.businessDocument.id, {
      name: parsed.name,
      comment: parsed.comment,
      ip,
      userAgent,
    });

    return NextResponse.json({ accepted: true, message: "Document accepted. Thank you." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("[share/accept] Error:", error);
    return NextResponse.json({ error: "Acceptance failed." }, { status: 500 });
  }
}
