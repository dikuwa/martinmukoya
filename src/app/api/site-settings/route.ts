import { Prisma } from "@/generated/prisma/client";
import { cacheKey, created, getPagination, ok, paginated, parseJson, parseListQuery, serverError, sortOrder, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { getCachedOrFetch, invalidateTag, tags } from "@/lib/cache";
import { db } from "@/lib/db";
import { getCurrentSite, getSiteBySlug } from "@/lib/sites";
import { siteSettingSchema } from "@/lib/validation/content";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const query = parseListQuery(request);
    const { skip, take } = getPagination(query);
    const where: Prisma.SiteSettingWhereInput = {};

    if (query.siteId) where.siteId = query.siteId;
    if (query.site && query.site !== "all") where.site = { slug: query.site };
    if (query.search) {
      where.key = { contains: query.search, mode: "insensitive" };
    }

    const orderBy = sortOrder(query, ["key", "updatedAt"], "key") as Prisma.SiteSettingOrderByWithRelationInput;
    const data = await getCachedOrFetch(cacheKey(tags.settings, request), async () => {
      const [items, total] = await Promise.all([
        db.siteSetting.findMany({ where, orderBy, skip, take, include: { site: true } }),
        db.siteSetting.count({ where })
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
    const { error } = await requireAdmin();
    if (error) return error;

    const data = await parseJson(request, siteSettingSchema);
    const site = data.siteId ? await db.site.findUnique({ where: { id: data.siteId } }) : data.siteSlug ? await getSiteBySlug(data.siteSlug) : await getCurrentSite();
    if (!site) return validationError(new z.ZodError([{ code: "custom", path: ["siteSlug"], message: "Site is required" }]));
    const setting = await db.siteSetting.upsert({
      where: { siteId_key: { siteId: site.id, key: data.key } },
      update: { value: data.value as Prisma.InputJsonValue },
      create: { siteId: site.id, key: data.key, value: data.value as Prisma.InputJsonValue }
    });
    await invalidateTag(tags.settings);
    await invalidateTag(tags.dashboard);
    return created(setting);
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}
