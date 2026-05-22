import { db } from "@/lib/db";

type NotificationInput = {
  siteId: string | null;
  type: "lead" | "message" | "chat";
  sourceId: string;
  title: string;
  detail: string;
  href: string;
  createdAt: Date;
};

/**
 * Create a notification record if one doesn't already exist for the given
 * type + sourceId combination (prevents duplicates from race conditions
 * or the sync fallback).
 */
export async function createNotification(input: NotificationInput) {
  await db.notification
    .create({
      data: {
        siteId: input.siteId,
        type: input.type,
        sourceId: input.sourceId,
        title: input.title,
        detail: input.detail.slice(0, 120),
        href: input.href,
        createdAt: input.createdAt,
        read: false
      }
    })
    .catch(() => {
      // Ignore unique constraint violations (type + sourceId already exists)
    });
}
