import { Prisma } from "@/generated/prisma/client";
import { invalidateTag, tags } from "@/lib/cache";
import { db } from "@/lib/db";

export async function trackServerEvent(input: {
  eventType: string;
  page?: string;
  referrer?: string;
  source?: string;
  device?: string;
  country?: string;
  metadata?: Record<string, unknown>;
}) {
  const event = await db.analyticsEvent.create({
    data: {
      ...input,
      metadata: input.metadata as Prisma.InputJsonValue | undefined
    }
  });

  await invalidateTag(tags.analytics);
  await invalidateTag(tags.dashboard);

  return event;
}
