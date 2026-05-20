import { Prisma } from "@/generated/prisma/client";
import { cacheKey, created, getPagination, ok, paginated, parseJson, parseListQuery, serverError, sortOrder, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { getCachedOrFetch, invalidateTag, tags } from "@/lib/cache";
import { db } from "@/lib/db";
import { siteAssignment } from "@/lib/sites";
import { blogPostSchema } from "@/lib/validation/content";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const query = parseListQuery(request);
    if (query.includeUnpublished || query.published === false) {
      const { error } = await requireAdmin();
      if (error) return error;
    }

    const { skip, take } = getPagination(query);
    const where: Prisma.BlogPostWhereInput = {};

    if (!query.includeUnpublished) where.published = query.published ?? true;
    if (query.siteId) where.sites = { some: { id: query.siteId } };
    if (query.site && query.site !== "all") where.sites = { some: { slug: query.site } };
    if (query.category) where.category = query.category;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { excerpt: { contains: query.search, mode: "insensitive" } },
        { category: { contains: query.search, mode: "insensitive" } },
        { tags: { has: query.search } }
      ];
    }

    const orderBy = sortOrder(query, ["createdAt", "updatedAt", "publishedAt", "title"], "publishedAt") as Prisma.BlogPostOrderByWithRelationInput;
    const data = await getCachedOrFetch(cacheKey(tags.blogPosts, request), async () => {
      const [items, total] = await Promise.all([
        db.blogPost.findMany({ where, orderBy, skip, take, include: { sites: true } }),
        db.blogPost.count({ where })
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

    const data = await parseJson(request, blogPostSchema);
    const { siteIds, siteSlugs, ...postData } = data;
    const post = await db.blogPost.create({ data: { ...postData, sites: siteAssignment(siteIds, siteSlugs) } });
    await invalidateTag(tags.blogPosts);
    await invalidateTag(tags.dashboard);
    return created(post);
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}
