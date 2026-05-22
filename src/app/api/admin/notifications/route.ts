import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentSite } from "@/lib/sites";
import { invalidateTag, tags } from "@/lib/cache";

export const dynamic = "force-dynamic";

/**
 * Syncs new source records into the Notification table so we have a
 * persistent, actionable list of unread notifications.
 */
async function syncNotifications() {
  const site = await getCurrentSite();
  const siteFilter = site ? { siteId: site.id } : {};

  // ── 1. Gather all source IDs that already have notifications ──
  const existing = await db.notification.findMany({
    where: siteFilter,
    select: { type: true, sourceId: true }
  });

  const seen = new Set(existing.map((n) => `${n.type}:${n.sourceId}`));
  const hasNotification = (type: string, id: string) => seen.has(`${type}:${id}`);

  // ── 2. Find new leads (status NEW) ──
  const newLeads = await db.lead.findMany({
    where: { ...siteFilter, status: "NEW" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, projectGoal: true, createdAt: true }
  });

  // ── 3. Find new messages (status NEW) ──
  const newMessages = await db.contactMessage.findMany({
    where: { ...siteFilter, status: "NEW" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, inquiryType: true, message: true, createdAt: true }
  });

  // ── 4. Find new chat handovers ──
  const newChatHandovers = await db.chatSession.findMany({
    where: { ...siteFilter, handedToHuman: true },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      visitorId: true,
      summary: true,
      updatedAt: true,
      lead: { select: { name: true } }
    }
  });

  // ── 5. Bulk-create missing notifications ──
  const toCreate: Array<{
    siteId: string | null;
    type: string;
    sourceId: string;
    title: string;
    detail: string;
    href: string;
    createdAt: Date;
  }> = [];

  for (const lead of newLeads) {
    if (!hasNotification("lead", lead.id)) {
      toCreate.push({
        siteId: site?.id ?? null,
        type: "lead",
        sourceId: lead.id,
        title: lead.name,
        detail: lead.projectGoal.slice(0, 120),
        href: `/admin/leads/${lead.id}`,
        createdAt: lead.createdAt
      });
    }
  }

  for (const msg of newMessages) {
    if (!hasNotification("message", msg.id)) {
      toCreate.push({
        siteId: site?.id ?? null,
        type: "message",
        sourceId: msg.id,
        title: msg.name,
        detail: `${msg.inquiryType ?? "General"} — ${msg.message.slice(0, 100)}`,
        href: `/admin/messages/${msg.id}`,
        createdAt: msg.createdAt
      });
    }
  }

  for (const chat of newChatHandovers) {
    if (!hasNotification("chat", chat.id)) {
      toCreate.push({
        siteId: site?.id ?? null,
        type: "chat",
        sourceId: chat.id,
        title: chat.lead?.name ?? chat.visitorId ?? "Anonymous visitor",
        detail: chat.summary?.slice(0, 120) ?? "Handed over for follow-up",
        href: `/admin/chat/${chat.id}`,
        createdAt: chat.updatedAt
      });
    }
  }

  if (toCreate.length > 0) {
    await db.notification.createMany({ data: toCreate, skipDuplicates: true });
  }
}

export async function GET() {
  try {
    await syncNotifications();

    const site = await getCurrentSite();
    const siteFilter = site ? { siteId: site.id } : {};

    const [total, unreadNotifications, counts] = await Promise.all([
      db.notification.count({ where: { ...siteFilter, read: false } }),
      db.notification.findMany({
        where: { ...siteFilter, read: false },
        orderBy: { createdAt: "desc" },
        take: 50
      }),
      db.notification.groupBy({
        by: ["type"],
        where: { ...siteFilter, read: false },
        _count: true
      })
    ]);

    const countMap: Record<string, number> = { leads: 0, messages: 0, chats: 0 };
    for (const row of counts) {
      if (row.type === "lead") countMap.leads = row._count;
      else if (row.type === "message") countMap.messages = row._count;
      else if (row.type === "chat") countMap.chats = row._count;
    }

    const totalRead = await db.notification.count({ where: { ...siteFilter, read: true } });

    const items = unreadNotifications.map((n) => ({
      id: n.id,
      type: n.type as "lead" | "message" | "chat",
      title: n.title,
      detail: n.detail,
      href: n.href,
      createdAt: n.createdAt.toISOString()
    }));

    return NextResponse.json({
      total,
      hasRead: totalRead > 0,
      totalRead,
      counts: countMap,
      items
    });
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json(
      { total: 0, hasRead: false, totalRead: 0, counts: { leads: 0, messages: 0, chats: 0 }, items: [] },
      { status: 500 }
    );
  }
}

/**
 * Mark all unread notifications as read.
 */
export async function PATCH() {
  try {
    const site = await getCurrentSite();
    const siteFilter = site ? { siteId: site.id } : {};

    const result = await db.notification.updateMany({
      where: { ...siteFilter, read: false },
      data: { read: true, readAt: new Date() }
    });

    await invalidateTag(tags.notifications);

    return NextResponse.json({ updated: result.count });
  } catch (error) {
    console.error("Notifications mark-all-read error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * Delete all read notifications to free up space.
 */
export async function DELETE() {
  try {
    const site = await getCurrentSite();
    const siteFilter = site ? { siteId: site.id } : {};

    const result = await db.notification.deleteMany({
      where: { ...siteFilter, read: true }
    });

    await invalidateTag(tags.notifications);

    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    console.error("Notifications clear-read error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
