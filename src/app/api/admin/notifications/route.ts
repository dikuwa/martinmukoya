import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentSite } from "@/lib/sites";
import { syncNotifications } from "@/lib/notifications";
import { invalidateTag, tags } from "@/lib/cache";

export const dynamic = "force-dynamic";

/**
 * Full notification data endpoint — returns unread items, counts,
 * and syncs any missed notifications from source records.
 */
export async function GET() {
  try {
    const site = await syncNotifications();
    const siteFilter = site ? { siteId: site.id } : {};

    const [total, unreadNotifications, counts, totalRead] = await Promise.all([
      db.notification.count({ where: { ...siteFilter, read: false } }),
      db.notification.findMany({
        where: { ...siteFilter, read: false },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      db.notification.groupBy({
        by: ["type"],
        where: { ...siteFilter, read: false },
        _count: true,
      }),
      db.notification.count({ where: { ...siteFilter, read: true } }),
    ]);

    const countMap: Record<string, number> = { leads: 0, messages: 0, chats: 0 };
    for (const row of counts) {
      if (row.type === "lead") countMap.leads = row._count;
      else if (row.type === "message") countMap.messages = row._count;
      else if (row.type === "chat") countMap.chats = row._count;
    }

    const items = unreadNotifications.map((n) => ({
      id: n.id,
      type: n.type as "lead" | "message" | "chat",
      title: n.title,
      detail: n.detail,
      href: n.href,
      createdAt: n.createdAt.toISOString(),
    }));

    return NextResponse.json({
      total,
      hasRead: totalRead > 0,
      totalRead,
      counts: countMap,
      items,
    });
  } catch (error) {
    console.error("[notifications] GET error:", error);
    return NextResponse.json(
      {
        total: 0,
        hasRead: false,
        totalRead: 0,
        counts: { leads: 0, messages: 0, chats: 0 },
        items: [],
      },
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
      data: { read: true, readAt: new Date() },
    });

    await invalidateTag(tags.notifications);

    return NextResponse.json({ updated: result.count });
  } catch (error) {
    console.error("[notifications] PATCH error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * Delete all read notifications (default) or all notifications (?all=true).
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clearAll = searchParams.get("all") === "true";

    const site = await getCurrentSite();
    const siteFilter = site ? { siteId: site.id } : {};

    const where = clearAll ? siteFilter : { ...siteFilter, read: true };

    const result = await db.notification.deleteMany({ where });

    await invalidateTag(tags.notifications);

    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    console.error("[notifications] DELETE error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
