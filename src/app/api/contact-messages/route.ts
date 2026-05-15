import { ContactMessageStatus, Prisma } from "@/generated/prisma/client";
import { cacheKey, created, getPagination, ok, paginated, parseJson, parseListQuery, serverError, sortOrder, validationError } from "@/lib/api";
import { getCachedOrFetch, invalidateTag, tags } from "@/lib/cache";
import { db } from "@/lib/db";
import { contactMessageSchema } from "@/lib/validation/content";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const query = parseListQuery(request);
    const { skip, take } = getPagination(query);
    const where: Prisma.ContactMessageWhereInput = {};

    if (query.status && query.status in ContactMessageStatus) where.status = query.status as ContactMessageStatus;
    if (query.category) where.inquiryType = query.category;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
        { inquiryType: { contains: query.search, mode: "insensitive" } },
        { message: { contains: query.search, mode: "insensitive" } }
      ];
    }

    const orderBy = sortOrder(query, ["createdAt", "updatedAt", "name", "status"], "createdAt") as Prisma.ContactMessageOrderByWithRelationInput;
    const data = await getCachedOrFetch(cacheKey(tags.contactMessages, request), async () => {
      const [items, total] = await Promise.all([
        db.contactMessage.findMany({ where, orderBy, skip, take }),
        db.contactMessage.count({ where })
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
    const data = await parseJson(request, contactMessageSchema);
    const message = await db.contactMessage.create({ data });
    await invalidateTag(tags.contactMessages);
    await invalidateTag(tags.dashboard);
    return created(message);
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}
