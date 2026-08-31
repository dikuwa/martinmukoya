import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { declineBusinessDocument } from "@/lib/business-document-service";
import { declineFinancialDocument } from "@/lib/finance-service";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

type Context = { params: Promise<{ code: string }> };

const declineSchema = z.object({
  reason: z.string().trim().min(1, "Reason is required"),
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
    const parsed = declineSchema.parse(body);

    // Financial document (QUOTE) decline
    if (share.financialDocument) {
      const doc = share.financialDocument;
      if (doc.type !== "QUOTE") {
        return NextResponse.json({ error: "Decline is only available for quotes." }, { status: 400 });
      }
      if (doc.status === "ACCEPTED" || doc.acceptedAt) {
        return NextResponse.json({ error: "Quote has already been accepted." }, { status: 409 });
      }
      if (doc.status === "DECLINED" || doc.declinedAt) {
        return NextResponse.json({ error: "Quote has already been declined." }, { status: 409 });
      }
      if (!["ISSUED"].includes(doc.status)) {
        return NextResponse.json({ error: "This quote is no longer available for response." }, { status: 409 });
      }

      await declineFinancialDocument(doc.id);

      // Update shared document tracking
      await db.sharedDocument.update({
        where: { id: share.id },
        data: {
          declinedAt: new Date(),
          declinedReason: parsed.reason,
        },
      });

      return NextResponse.json({ declined: true, message: "Quote declined. We'll review your feedback." });
    }

    // Business document decline
    if (!share.businessDocument) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    if (share.businessDocument.status === "ACCEPTED" || share.acceptedAt) {
      return NextResponse.json({ error: "Document has already been accepted." }, { status: 409 });
    }

    if (share.businessDocument.status === "DECLINED" || share.declinedAt) {
      return NextResponse.json({ error: "Document has already been declined." }, { status: 409 });
    }

    await declineBusinessDocument(share.businessDocument.id, parsed.reason, parsed.comment);

    return NextResponse.json({ declined: true, message: "Document declined. We'll review your feedback." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("[share/decline] Error:", error);
    return NextResponse.json({ error: "Submission failed." }, { status: 500 });
  }
}
