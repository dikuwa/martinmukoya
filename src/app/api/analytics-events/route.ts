import { Prisma } from "@/generated/prisma/client";
import { cacheKey, created, getPagination, ok, paginated, parseJson, parseListQuery, serverError, sortOrder, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { getCachedOrFetch, invalidateTag, tags } from "@/lib/cache";
import { db } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getCurrentSite, getSiteBySlug } from "@/lib/sites";
import { analyticsEventSchema } from "@/lib/validation/content";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const query = parseListQuery(request);
    const { skip, take } = getPagination(query);
    const where: Prisma.AnalyticsEventWhereInput = {};

    if (query.status) where.eventType = query.status;
    if (query.source) where.source = query.source;
    if (query.siteId) where.siteId = query.siteId;
    if (query.site && query.site !== "all") where.siteSlug = query.site;
    if (query.search) {
      where.OR = [
        { eventType: { contains: query.search, mode: "insensitive" } },
        { page: { contains: query.search, mode: "insensitive" } },
        { source: { contains: query.search, mode: "insensitive" } },
        { device: { contains: query.search, mode: "insensitive" } }
      ];
    }

    const orderBy = sortOrder(query, ["createdAt", "eventType", "page", "source"], "createdAt") as Prisma.AnalyticsEventOrderByWithRelationInput;
    const data = await getCachedOrFetch(cacheKey(tags.analytics, request), async () => {
      const [items, total] = await Promise.all([
        db.analyticsEvent.findMany({ where, orderBy, skip, take }),
        db.analyticsEvent.count({ where })
      ]);
      return paginated(items, total, query);
    });

    return ok(data);
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = await rateLimit(`rate:analytics:${ip}`, { limit: 120, windowSeconds: 60 * 60 });
    if (!limit.success) {
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const data = await parseJson(request, analyticsEventSchema);
    const site = data.siteId
      ? await db.site.findUnique({ where: { id: data.siteId } })
      : data.siteSlug
      ? await getSiteBySlug(data.siteSlug)
      : await getCurrentSite();
    const event = await db.analyticsEvent.create({
      data: {
        eventType: data.eventType,
        siteId: site?.id,
        siteSlug: site?.slug,
        page: data.page,
        referrer: data.referrer,
        source: data.source,
        device: data.device,
        country: data.country,
        metadata: data.metadata as Prisma.InputJsonValue | undefined
      }
    });
    await invalidateTag(tags.analytics);
    await invalidateTag(tags.dashboard);
    return created(event);
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}
