import { Prisma } from "@/generated/prisma/client";
import { cacheKey, created, getPagination, ok, paginated, parseJson, parseListQuery, serverError, sortOrder, validationError } from "@/lib/api";
import { getCachedOrFetch, invalidateTag, tags } from "@/lib/cache";
import { db } from "@/lib/db";
import { faqSchema } from "@/lib/validation/content";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const query = parseListQuery(request);
    const { skip, take } = getPagination(query);
    const where: Prisma.FAQWhereInput = {};

    if (!query.includeUnpublished) where.published = query.published ?? true;
    if (query.category) where.category = query.category;
    if (query.search) {
      where.OR = [
        { question: { contains: query.search, mode: "insensitive" } },
        { answer: { contains: query.search, mode: "insensitive" } },
        { category: { contains: query.search, mode: "insensitive" } }
      ];
    }

    const orderBy = sortOrder(query, ["createdAt", "updatedAt", "question", "sortOrder"], "sortOrder") as Prisma.FAQOrderByWithRelationInput;
    const data = await getCachedOrFetch(cacheKey(tags.faqs, request), async () => {
      const [items, total] = await Promise.all([
        db.fAQ.findMany({ where, orderBy, skip, take }),
        db.fAQ.count({ where })
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
    const data = await parseJson(request, faqSchema);
    const faq = await db.fAQ.create({ data });
    await invalidateTag(tags.faqs);
    await invalidateTag(tags.dashboard);
    return created(faq);
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}
