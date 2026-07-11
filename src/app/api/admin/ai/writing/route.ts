import { NextResponse } from "next/server";
import { z } from "zod";
import { runDocumentsWritingAssistant } from "@/lib/ai/documents-service";
import { requireAdmin } from "@/lib/auth-guard";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { trackServerEvent } from "@/lib/analytics";

const requestSchema = z.object({
  surface: z.enum(["blog", "business-document", "template"]),
  action: z.enum(["generate", "improve", "rewrite", "professional", "persuasive", "friendly", "concise", "expand", "shorten", "grammar", "structure", "missing-sections", "missing-clauses", "summarise", "seo-title", "excerpt", "tags", "seo-description"]),
  title: z.string().max(300).optional(), subject: z.string().max(500).optional(),
  content: z.string().max(80_000).optional(), selectedText: z.string().max(20_000).optional(), notes: z.string().max(20_000).optional(),
  category: z.string().max(150).optional(), tags: z.array(z.string().max(100)).max(30).optional(), keywords: z.array(z.string().max(100)).max(30).optional(),
  audience: z.string().max(300).optional(), tone: z.string().max(100).optional(), style: z.string().max(100).optional(), length: z.string().max(100).optional(),
  documentType: z.string().max(150).optional(), templateName: z.string().max(200).optional(),
  context: z.record(z.string(), z.union([z.string().max(2_000), z.number(), z.boolean(), z.null()])).optional()
}).refine((value) => Boolean(value.title?.trim() || value.content?.trim() || value.selectedText?.trim() || value.notes?.trim()), {
  message: "Provide a title, notes, selected text, or existing content."
});

export async function POST(request: Request) {
  const { session, error } = await requireAdmin();
  if (error) return error;
  const limit = await rateLimit(`documents-ai:${session!.user.id}:${getClientIp(request)}`, { limit: 20, windowSeconds: 3600 });
  if (!limit.success) return NextResponse.json({ error: "Document AI usage limit reached. Try again later." }, { status: 429 });
  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid writing request." }, { status: 400 });
    const output = await runDocumentsWritingAssistant(parsed.data);
    void trackServerEvent({
      eventType: "documents_ai_used", source: "admin-writing-assistant",
      metadata: { surface: parsed.data.surface, action: parsed.data.action, userId: session!.user.id, inputCharacters: (parsed.data.content?.length || 0) + (parsed.data.notes?.length || 0), outputCharacters: output.length }
    }).catch(() => undefined);
    return NextResponse.json({ output, action: parsed.data.action });
  } catch (error) {
    console.error("[documents-ai] Writing request failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      status: typeof error === "object" && error && "status" in error ? error.status : undefined,
      code: typeof error === "object" && error && "code" in error ? error.code : undefined
    });
    return NextResponse.json({ error: "The document writing assistant is temporarily unavailable. Your content was not changed." }, { status: 503 });
  }
}
