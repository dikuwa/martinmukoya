import { Prisma } from "@/generated/prisma/client";
import { cacheKey, created, getPagination, ok, paginated, parseJson, parseListQuery, serverError, sortOrder, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { getCachedOrFetch, invalidateTag, tags } from "@/lib/cache";
import { db } from "@/lib/db";
import { siteAssignment } from "@/lib/sites";
import { testimonialSchema } from "@/lib/validation/content";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const query = parseListQuery(request);
    if (query.includeUnpublished || query.published === false) {
      const { error } = await requireAdmin();
      if (error) return error;
    }

    const { skip, take } = getPagination(query);
    const where: Prisma.TestimonialWhereInput = {};

    if (!query.includeUnpublished) where.published = query.published ?? true;
    if (query.siteId) where.sites = { some: { id: query.siteId } };
    if (query.site && query.site !== "all") where.sites = { some: { slug: query.site } };
    if (typeof query.featured === "boolean") where.featured = query.featured;
    if (query.search) {
      where.OR = [
        { clientName: { contains: query.search, mode: "insensitive" } },
        { company: { contains: query.search, mode: "insensitive" } },
        { quote: { contains: query.search, mode: "insensitive" } }
      ];
    }

    const orderBy = sortOrder(query, ["createdAt", "updatedAt", "clientName", "sortOrder"], "sortOrder") as Prisma.TestimonialOrderByWithRelationInput;
    const data = await getCachedOrFetch(cacheKey(tags.testimonials, request), async () => {
      const [items, total] = await Promise.all([
        db.testimonial.findMany({ where, orderBy, skip, take, include: { sites: true } }),
        db.testimonial.count({ where })
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

    const data = await parseJson(request, testimonialSchema);
    const { siteIds, siteSlugs, ...testimonialData } = data;
    const testimonial = await db.testimonial.create({ data: { ...testimonialData, sites: siteAssignment(siteIds, siteSlugs) } });
    await invalidateTag(tags.testimonials);
    await invalidateTag(tags.dashboard);
    return created(testimonial);
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}
