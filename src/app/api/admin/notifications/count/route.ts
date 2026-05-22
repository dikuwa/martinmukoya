import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncNotifications } from "@/lib/notifications";

export const dynamic = "force-dynamic";

/**
 * Lightweight count endpoint — returns just the unread total and
 * per-type breakdown aggregated across ALL sites.
 *
 * The admin dashboard is a unified view across both Martin Mukoya
 * and FlexTech Media — so notifications span all sites.
 *
 * Runs syncNotifications() to back-fill any notifications that
 * were missed due to transient errors.
 *
 * Poll this frequently (every 5s) from the notification center for
 * real-time badge updates.
 */
export async function GET() {
  try {
    // Sync missed notifications from any site
    await syncNotifications();

    // Count ALL unread notifications regardless of site
    const [total, counts] = await Promise.all([
      db.notification.count({ where: { read: false } }),
      db.notification.groupBy({
        by: ["type"],
        where: { read: false },
        _count: true,
      }),
    ]);

    const countMap: Record<string, number> = { leads: 0, messages: 0, chats: 0 };
    for (const row of counts) {
      if (row.type === "lead") countMap.leads = row._count;
      else if (row.type === "message") countMap.messages = row._count;
      else if (row.type === "chat") countMap.chats = row._count;
    }

    return NextResponse.json({ total, counts: countMap });
  } catch (error) {
    console.error("[notifications/count] Error:", error);
    return NextResponse.json(
      { total: 0, counts: { leads: 0, messages: 0, chats: 0 } },
      { status: 500 }
    );
  }
}
