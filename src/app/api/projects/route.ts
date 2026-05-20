import { Prisma } from "@/generated/prisma/client";
import { cacheKey, created, getPagination, ok, paginated, parseJson, parseListQuery, serverError, sortOrder, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { getCachedOrFetch, invalidateTag, tags } from "@/lib/cache";
import { db } from "@/lib/db";
import { siteAssignment } from "@/lib/sites";
import { projectSchema } from "@/lib/validation/content";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const query = parseListQuery(request);
    if (query.includeUnpublished || query.published === false) {
      const { error } = await requireAdmin();
      if (error) return error;
    }

    const { skip, take } = getPagination(query);
    const where: Prisma.ProjectWhereInput = {};

    if (!query.includeUnpublished) where.published = query.published ?? true;
    if (query.siteId) where.sites = { some: { id: query.siteId } };
    if (query.site && query.site !== "all") where.sites = { some: { slug: query.site } };
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
        db.project.findMany({ where, orderBy, skip, take, include: { sites: true } }),
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
    const { error } = await requireAdmin();
    if (error) return error;

    const data = await parseJson(request, projectSchema);
    const { siteIds, siteSlugs, ...projectData } = data;
    const project = await db.project.create({ data: { ...projectData, sites: siteAssignment(siteIds, siteSlugs) } });
    await invalidateTag(tags.projects);
    await invalidateTag(tags.dashboard);
    return created(project);
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}
