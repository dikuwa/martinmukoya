import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { operatorName } from "@/lib/live-chat";
import { invalidateTag, tags } from "@/lib/cache";

type Context = { params: Promise<{ id: string }> };
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("join") }),
  z.object({ action: z.literal("return-to-ai") }),
  z.object({ action: z.literal("message"), content: z.string().trim().min(1).max(5000) })
]);

export async function GET(_request: Request, context: Context) {
  const { error } = await requireAdmin(); if (error) return error;
  const { id } = await context.params;
  const session = await db.chatSession.findUnique({ where: { id }, include: { site: true, assignedAdmin: true, messages: { orderBy: { createdAt: "asc" } } } });
  return session ? Response.json(session) : Response.json({ error: "Chat not found" }, { status: 404 });
}

export async function POST(request: Request, context: Context) {
  const { session: authSession, error } = await requireAdmin(); if (error) return error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid action" }, { status: 400 });
  const { id } = await context.params;
  const chat = await db.chatSession.findUnique({ where: { id }, include: { site: true } });
  if (!chat) return Response.json({ error: "Chat not found" }, { status: 404 });
  const adminId = authSession!.user.id;
  if (parsed.data.action === "join") {
    await db.$transaction([
      db.chatSession.update({ where: { id }, data: { mode: "HUMAN", assignedAdminId: adminId, humanJoinedAt: new Date() } }),
      db.chatMessage.create({ data: { sessionId: id, role: "SYSTEM", content: `${operatorName(chat.site?.slug)} has joined the chat.` } })
    ]);
  } else if (parsed.data.action === "return-to-ai") {
    await db.$transaction([
      db.chatSession.update({ where: { id }, data: { mode: "AI", assignedAdminId: null, humanJoinedAt: null } }),
      db.chatMessage.create({ data: { sessionId: id, role: "SYSTEM", content: "The AI assistant is active again." } })
    ]);
  } else {
    if (chat.mode !== "HUMAN") return Response.json({ error: "Join the chat before replying" }, { status: 409 });
    await db.chatMessage.create({ data: { sessionId: id, role: "HUMAN", content: parsed.data.content, senderId: adminId, senderName: operatorName(chat.site?.slug) } });
  }
  await Promise.all([invalidateTag(tags.chatSessions), invalidateTag(tags.dashboard)]);
  return GET(request, context);
}
