import { Prisma } from "@/generated/prisma/client";
import { cacheKey, created, getPagination, ok, paginated, parseJson, parseListQuery, serverError, sortOrder, validationError } from "@/lib/api";
import { getCachedOrFetch, invalidateTag, tags } from "@/lib/cache";
import { db } from "@/lib/db";
import { projectSchema } from "@/lib/validation/content";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const query = parseListQuery(request);
    const { skip, take } = getPagination(query);
    const where: Prisma.ProjectWhereInput = {};

    if (!query.includeUnpublished) where.published = query.published ?? true;
    if (typeof query.featured === "boolean") where.featured = query.featured;
    if (query.serviceType) where.services = { has: query.serviceType };
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { summary: { contains: query.search, mode: "insensitive" } },
        { industry: { contains: query.search, mode: "insensitive" } }
      ];
    }

    const orderBy = sortOrder(query, ["createdAt", "updatedAt", "title", "sortOrder"], "sortOrder") as Prisma.ProjectOrderByWithRelationInput;
    const data = await getCachedOrFetch(cacheKey(tags.projects, request), async () => {
      const [items, total] = await Promise.all([
        db.project.findMany({ where, orderBy, skip, take }),
        db.project.count({ where })
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
    const data = await parseJson(request, projectSchema);
    const project = await db.project.create({ data });
    await invalidateTag(tags.projects);
    await invalidateTag(tags.dashboard);
    return created(project);
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}
