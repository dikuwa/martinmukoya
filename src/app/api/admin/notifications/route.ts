import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncNotifications } from "@/lib/notifications";
import { invalidateTag, tags } from "@/lib/cache";

export const dynamic = "force-dynamic";

/**
 * Full notification data endpoint — returns unread items, counts,
 * aggregated across ALL sites (the admin dashboard is a unified view).
 *
 * Supports ?site= query param for filtering:
 *   ?site=all             — both sites (default)
 *   ?site=martin-mukoya   — only Martin Mukoya
 *   ?site=flextech-media  — only FlexTech Media
 *
 * Also syncs any missed notifications from source records.
 */
export async function GET(request: Request) {
  try {
    // Sync missed notifications from any site
    await syncNotifications();

    // Resolve site filter
    const { searchParams } = new URL(request.url);
    const siteSlug = searchParams.get("site") ?? "all";

    // Fetch sites for ID→name/slug resolution
    const allSites = await db.site.findMany({
      select: { id: true, slug: true, name: true },
    });
    const siteMap = new Map(allSites.map((s) => [s.id, { slug: s.slug, name: s.name }]));

    // Build where clause based on site filter
    let siteFilter: { siteId?: string | null } | { siteId?: { in: string[] } } = {};
    if (siteSlug !== "all") {
      const site = allSites.find((s) => s.slug === siteSlug);
      if (site) {
        siteFilter = { siteId: site.id };
      } else {
        // Unknown site slug — return empty results
        siteFilter = { siteId: "__nonexistent__" };
      }
    }

    const where = { ...siteFilter, read: false };

    const [total, unreadNotifications, counts, totalRead] = await Promise.all([
      db.notification.count({ where }),
      db.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      db.notification.groupBy({
        by: ["type"],
        where,
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

    const items = unreadNotifications.map((n) => {
      const siteInfo = n.siteId ? siteMap.get(n.siteId) : null;
      return {
        id: n.id,
        type: n.type as "lead" | "message" | "chat",
        title: n.title,
        detail: n.detail,
        href: n.href,
        createdAt: n.createdAt.toISOString(),
        siteId: n.siteId,
        siteSlug: siteInfo?.slug ?? null,
        siteName: siteInfo?.name ?? null,
      };
    });

    return NextResponse.json({
      total,
      hasRead: totalRead > 0,
      totalRead,
      counts: countMap,
      items,
      sites: allSites.map((s) => ({ slug: s.slug, name: s.name })),
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
        sites: [],
      },
      { status: 500 }
    );
  }
}

/**
 * Mark all unread notifications as read across ALL sites.
 */
export async function PATCH() {
  try {
    const result = await db.notification.updateMany({
      where: { read: false },
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
 * Delete all read notifications (default) or all notifications (?all=true)
 * across ALL sites.
 *
 * Also acknowledges the source records so syncNotifications() won't
 * re-create the deleted notifications on the next GET.
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clearAll = searchParams.get("all") === "true";

    const where = clearAll ? {} : { read: true };

    // Fetch notifications to be deleted so we can acknowledge source records
    const toDelete = await db.notification.findMany({
      where,
      select: { type: true, sourceId: true },
    });

    if (toDelete.length > 0) {
      // Group by type to update source records in bulk
      const leadIds = toDelete.filter((n) => n.type === "lead").map((n) => n.sourceId);
      const msgIds = toDelete.filter((n) => n.type === "message").map((n) => n.sourceId);

      // Acknowledge source records so syncNotifications doesn't re-create them
      const updates: Promise<unknown>[] = [];
      if (leadIds.length > 0) {
        updates.push(
          db.lead.updateMany({
            where: { id: { in: leadIds }, status: "NEW" },
            data: { status: "REVIEWING" },
          })
        );
      }
      if (msgIds.length > 0) {
        updates.push(
          db.contactMessage.updateMany({
            where: { id: { in: msgIds }, status: "NEW" },
            data: { status: "READ" },
          })
        );
      }

      await Promise.all(updates);
    }

    // Now delete the notification records
    const result = await db.notification.deleteMany({ where });

    await invalidateTag(tags.notifications);

    return NextResponse.json({ deleted: result.count, acknowledged: toDelete.length });
  } catch (error) {
    console.error("[notifications] DELETE error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
