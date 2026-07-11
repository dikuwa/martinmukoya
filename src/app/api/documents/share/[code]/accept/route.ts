import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { acceptBusinessDocument } from "@/lib/business-document-service";
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
      include: { businessDocument: true },
    });

    if (!share || !share.shareEnabled || (share.expiresAt && share.expiresAt < new Date())) {
      return NextResponse.json({ error: "Document not found or link has expired." }, { status: 404 });
    }

    if (!share.businessDocument) {
      return NextResponse.json({ error: "Acceptance is only available for business documents." }, { status: 400 });
    }

    if (share.businessDocument.status === "ACCEPTED" || share.acceptedAt) {
      return NextResponse.json({ error: "Document has already been accepted." }, { status: 409 });
    }

    if (share.businessDocument.status === "DECLINED" || share.declinedAt) {
      return NextResponse.json({ error: "Document has already been declined." }, { status: 409 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = acceptSchema.parse(body);
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

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
