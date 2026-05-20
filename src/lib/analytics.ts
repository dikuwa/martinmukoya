import { Prisma } from "@/generated/prisma/client";
import { invalidateTag, tags } from "@/lib/cache";
import { db } from "@/lib/db";
import { capturePostHogServerEvent } from "@/lib/posthog";
import { getCurrentSite, getSiteBySlug } from "@/lib/sites";

export async function trackServerEvent(input: {
  eventType: string;
  distinctId?: string;
  siteId?: string;
  siteSlug?: string;
  page?: string;
  referrer?: string;
  source?: string;
  device?: string;
  country?: string;
  metadata?: Record<string, unknown>;
}) {
  const site = input.siteId ? await db.site.findUnique({ where: { id: input.siteId } }) : input.siteSlug ? await getSiteBySlug(input.siteSlug) : await getCurrentSite();
  const event = await db.analyticsEvent.create({
    data: {
      siteId: site?.id,
      siteSlug: site?.slug,
      eventType: input.eventType,
      page: input.page,
      referrer: input.referrer,
      source: input.source,
      device: input.device,
      country: input.country,
      metadata: input.metadata as Prisma.InputJsonValue | undefined
    }
  });

  await invalidateTag(tags.analytics);
  await invalidateTag(tags.dashboard);
  await capturePostHogServerEvent({
    eventType: input.eventType,
    distinctId: input.distinctId ?? event.id,
    properties: {
      page: input.page,
      siteId: site?.id,
      siteSlug: site?.slug,
      referrer: input.referrer,
      source: input.source,
      device: input.device,
      country: input.country,
      ...input.metadata
    }
  });

  return event;
}
