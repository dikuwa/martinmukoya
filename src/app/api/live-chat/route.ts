import { z } from "zod";
import { db } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getSiteBySlug } from "@/lib/sites";
import { newVisitorToken, publicChat, requestHuman } from "@/lib/live-chat";

const querySchema = z.object({ sessionId: z.string(), token: z.string().min(20), siteSlug: z.string() });
const postSchema = z.object({ sessionId: z.string().optional(), token: z.string().min(20).optional(), siteSlug: z.string(), content: z.string().trim().min(1).max(5000), requestHuman: z.boolean().optional() });

async function findPublicSession(sessionId: string, token: string, siteSlug: string) {
  return db.chatSession.findFirst({
    where: { id: sessionId, visitorToken: token, site: { slug: siteSlug } },
    include: { site: true, messages: { orderBy: { createdAt: "asc" } } }
  });
}

export async function GET(request: Request) {
  const parsed = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return Response.json({ error: "Invalid chat credentials" }, { status: 400 });
  const session = await findPublicSession(parsed.data.sessionId, parsed.data.token, parsed.data.siteSlug);
  if (!session) return Response.json({ error: "Chat not found" }, { status: 404 });
  return Response.json(publicChat(session));
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = await rateLimit(`live-chat:${ip}`, { limit: 40, windowSeconds: 60 });
  if (!limit.success) return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  const parsed = postSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid message" }, { status: 400 });
  const site = await getSiteBySlug(parsed.data.siteSlug);
  if (!site) return Response.json({ error: "Site not found" }, { status: 404 });

  let session = parsed.data.sessionId && parsed.data.token
    ? await findPublicSession(parsed.data.sessionId, parsed.data.token, parsed.data.siteSlug)
    : null;
  if (parsed.data.sessionId && !session) return Response.json({ error: "Chat not found" }, { status: 404 });
  if (!session) {
    session = await db.chatSession.create({
      data: { siteId: site.id, visitorToken: newVisitorToken(), summary: parsed.data.content.slice(0, 180) },
      include: { site: true, messages: true }
    });
  }
  await db.chatMessage.create({ data: { sessionId: session.id, role: "VISITOR", content: parsed.data.content } });
  if (parsed.data.requestHuman && session.mode === "AI") await requestHuman(session.id, site);
  const updated = await db.chatSession.findUniqueOrThrow({ where: { id: session.id }, include: { site: true, messages: { orderBy: { createdAt: "asc" } } } });
  return Response.json(publicChat(updated), { status: 201 });
}
