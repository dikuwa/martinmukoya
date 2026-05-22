import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentSite } from "@/lib/sites";

export const dynamic = "force-dynamic";

/**
 * Lightweight count endpoint — no sync, just returns the unread total.
 * Poll this frequently (every 5s) from the notification center for
 * real-time badge updates without the overhead of full sync + item fetch.
 */
export async function GET() {
  try {
    const site = await getCurrentSite();
    const siteFilter = site ? { siteId: site.id } : {};

    const [total, counts] = await Promise.all([
      db.notification.count({ where: { ...siteFilter, read: false } }),
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

    return NextResponse.json({ total, counts: countMap });
  } catch (error) {
    console.error("Notifications count error:", error);
    return NextResponse.json({ total: 0, counts: { leads: 0, messages: 0, chats: 0 } }, { status: 500 });
  }
}
