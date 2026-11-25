import { sharedDocumentIsPublic } from "@/lib/shared-document-access";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { acceptDocument, AcceptanceConflict } from "@/lib/document-acceptance";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

type Context = { params: Promise<{ code: string }> };

const acceptSchema = z.object({
  name: z.string().trim().min(1, "Full name is required"),
  comment: z.string().trim().max(1000).optional(),
});

export async function POST(request: Request, context: Context) {
  // Rate limit: 5 accept/decline actions per 5 minutes per IP
  const ip = getClientIp(request);
  const { success, unavailable } = await rateLimit(`share:action:${ip}`, { limit: 5, windowSeconds: 300 });
  if (unavailable) return NextResponse.json({ error: "Service temporarily unavailable." }, { status: 503 });
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }
  try {
    const code = (await context.params).code;
    const share = await db.sharedDocument.findUnique({
      where: { shortCode: code },
      include: { businessDocument: true, financialDocument: true },
    });

    if (!share || !sharedDocumentIsPublic(share)) {
      return NextResponse.json({ error: "Document not found or link has expired." }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = acceptSchema.parse(body);
    const userAgent = request.headers.get("user-agent") || undefined;

    const financial = share.documentType === "financial";
    if (financial && share.financialDocument?.type !== "QUOTE") {
      return NextResponse.json({ error: "Acceptance is only available for quotes." }, { status: 400 });
    }
    const documentId = financial ? share.financialDocumentId : share.businessDocumentId;
    if (!documentId) return NextResponse.json({ error: "Document not found." }, { status: 404 });
    const target = financial
      ? { kind: "financial" as const, id: documentId, shortCode: code }
      : { kind: "business" as const, id: documentId, shortCode: code };
    await acceptDocument(target, { ...parsed, ip, userAgent });
    return NextResponse.json({ accepted: true, message: financial ? "Quote accepted. Thank you." : "Document accepted. Thank you." });
  } catch (error) {
    if (error instanceof AcceptanceConflict) return NextResponse.json({ error: error.message }, { status: 409 });
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("[share/accept] Error:", error);
    return NextResponse.json({ error: "Acceptance failed." }, { status: 500 });
  }
}
