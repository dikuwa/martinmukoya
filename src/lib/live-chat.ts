import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { invalidateTag, tags } from "@/lib/cache";

export const CHAT_POLL_MS = 2500;

export function newVisitorToken() {
  return randomBytes(32).toString("hex");
}

export function operatorName(siteSlug?: string | null) {
  return siteSlug === "flextech-media" ? "FlexTech Team" : "Martin";
}

export function waitingMessage(siteSlug?: string | null) {
  return siteSlug === "flextech-media"
    ? "Your request has been sent. A member of the FlexTech Team will join this chat shortly."
    : "Your request has been sent. Martin will join this chat shortly.";
}

export async function requestHuman(sessionId: string, site: { id: string; slug: string; name: string } | null) {
  const session = await db.chatSession.update({
    where: { id: sessionId },
    data: { mode: "WAITING_FOR_HUMAN", handoverRequestedAt: new Date(), humanJoinedAt: null, assignedAdminId: null }
  });
  const content = waitingMessage(site?.slug);
  await db.chatMessage.create({ data: { sessionId, role: "SYSTEM", content } });
  await db.notification.upsert({
    where: { type_sourceId: { type: "chat", sourceId: session.id } },
    create: { siteId: site?.id ?? null, type: "chat", sourceId: session.id, title: `${site?.name ?? "Website"} live chat request`, detail: "A visitor is waiting to chat with a person.", href: `/admin/chat/${session.id}`, createdAt: new Date() },
    update: { read: false, readAt: null, title: `${site?.name ?? "Website"} live chat request`, detail: "A visitor is waiting to chat with a person.", createdAt: new Date() }
  });
  await Promise.all([invalidateTag(tags.chatSessions), invalidateTag(tags.dashboard)]);
  return { session, content };
}

export function publicChat(session: {
  id: string; mode: string; visitorToken: string; site: { slug: string } | null;
  messages: Array<{ id: string; role: string; content: string; senderName: string | null; createdAt: Date }>;
}) {
  return {
    sessionId: session.id,
    visitorToken: session.visitorToken,
    mode: session.mode,
    operatorName: operatorName(session.site?.slug),
    messages: session.messages
  };
}
