import { Prisma } from "@/generated/prisma/client";
import { cacheKey, created, getPagination, ok, paginated, parseJson, parseListQuery, serverError, sortOrder, validationError } from "@/lib/api";
import { getCachedOrFetch, invalidateTag, tags } from "@/lib/cache";
import { db } from "@/lib/db";
import { testimonialSchema } from "@/lib/validation/content";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const query = parseListQuery(request);
    const { skip, take } = getPagination(query);
    const where: Prisma.TestimonialWhereInput = {};

    if (!query.includeUnpublished) where.published = query.published ?? true;
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
        db.testimonial.findMany({ where, orderBy, skip, take }),
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
    const data = await parseJson(request, testimonialSchema);
    const testimonial = await db.testimonial.create({ data });
    await invalidateTag(tags.testimonials);
    await invalidateTag(tags.dashboard);
    return created(testimonial);
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}
