import { LeadStatus, Prisma, ServiceType } from "@/generated/prisma/client";
import { cacheKey, created, getPagination, ok, paginated, parseJson, parseListQuery, serverError, sortOrder, validationError } from "@/lib/api";
import { getCachedOrFetch, invalidateTag, tags } from "@/lib/cache";
import { db } from "@/lib/db";
import { leadSchema } from "@/lib/validation/content";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const query = parseListQuery(request);
    const { skip, take } = getPagination(query);
    const where: Prisma.LeadWhereInput = {};

    if (query.status && query.status in LeadStatus) where.status = query.status as LeadStatus;
    if (query.serviceType && query.serviceType in ServiceType) where.serviceType = query.serviceType as ServiceType;
    if (query.source) where.source = query.source;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
        { company: { contains: query.search, mode: "insensitive" } },
        { projectGoal: { contains: query.search, mode: "insensitive" } },
        { message: { contains: query.search, mode: "insensitive" } }
      ];
    }

    const orderBy = sortOrder(query, ["createdAt", "updatedAt", "name", "status"], "createdAt") as Prisma.LeadOrderByWithRelationInput;
    const data = await getCachedOrFetch(cacheKey(tags.leads, request), async () => {
      const [items, total] = await Promise.all([
        db.lead.findMany({ where, orderBy, skip, take }),
        db.lead.count({ where })
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
    const data = await parseJson(request, leadSchema);
    const lead = await db.lead.create({ data });
    await invalidateTag(tags.leads);
    await invalidateTag(tags.dashboard);
    return created(lead);
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}
