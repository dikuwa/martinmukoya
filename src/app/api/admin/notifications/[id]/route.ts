import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invalidateTag, tags } from "@/lib/cache";

export const dynamic = "force-dynamic";

/**
 * Mark a single notification as read.
 */
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const notification = await db.notification.findUnique({ where: { id } });

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    await db.notification.update({
      where: { id },
      data: { read: true, readAt: new Date() }
    });

    await invalidateTag(tags.notifications);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification mark-read error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * Delete a single notification.
 *
 * Also acknowledges the source record so syncNotifications() won't
 * re-create it on the next GET.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const notification = await db.notification.findUnique({ where: { id } });

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    // Acknowledge the source record so syncNotifications won't re-create it
    if (notification.type === "lead") {
      await db.lead.updateMany({
        where: { id: notification.sourceId, status: "NEW" },
        data: { status: "REVIEWING" },
      });
    } else if (notification.type === "message") {
      await db.contactMessage.updateMany({
        where: { id: notification.sourceId, status: "NEW" },
        data: { status: "READ" },
      });
    }

    await db.notification.delete({ where: { id } });

    await invalidateTag(tags.notifications);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification delete error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
