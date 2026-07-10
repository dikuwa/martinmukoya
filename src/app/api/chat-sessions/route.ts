import { Prisma } from "@/generated/prisma/client";
import { cacheKey, getPagination, ok, paginated, parseListQuery, serverError, sortOrder, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { getCachedOrFetch, tags } from "@/lib/cache";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const query = parseListQuery(request);
    const { skip, take } = getPagination(query);
    const where: Prisma.ChatSessionWhereInput = {};

    if (query.siteId) where.siteId = query.siteId;
    if (query.site && query.site !== "all") where.site = { slug: query.site };
    if (["AI", "WAITING_FOR_HUMAN", "HUMAN"].includes(query.status ?? "")) where.mode = query.status as Prisma.EnumChatModeFilter;
    if (query.search) {
      where.OR = [
        { visitorId: { contains: query.search, mode: "insensitive" } },
        { summary: { contains: query.search, mode: "insensitive" } },
        { lead: { name: { contains: query.search, mode: "insensitive" } } },
        { lead: { email: { contains: query.search, mode: "insensitive" } } }
      ];
    }

    const orderBy = sortOrder(query, ["createdAt", "updatedAt"], "updatedAt") as Prisma.ChatSessionOrderByWithRelationInput;
    const data = await getCachedOrFetch(cacheKey(tags.chatSessions, request), async () => {
      const [items, total] = await Promise.all([
        db.chatSession.findMany({
          where,
          orderBy,
          skip,
          take,
          include: { site: true, lead: true, messages: { take: 1, orderBy: { createdAt: "desc" } } }
        }),
        db.chatSession.count({ where })
      ]);
      return paginated(items, total, query);
    });

    return ok(data);
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}
