import { notFound, ok, parseJson, serverError, validationError } from "@/lib/api";
import { invalidateTag, tags } from "@/lib/cache";
import { db } from "@/lib/db";
import { blogPostUpdateSchema } from "@/lib/validation/content";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const post = await db.blogPost.findFirst({ where: { OR: [{ id }, { slug: id }] } });

    if (!post) return notFound("Blog post not found");
    return ok(post);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const data = await parseJson(request, blogPostUpdateSchema);
    const existing = await db.blogPost.findFirst({ where: { OR: [{ id }, { slug: id }] } });

    if (!existing) return notFound("Blog post not found");

    const post = await db.blogPost.update({ where: { id: existing.id }, data });
    await invalidateTag(tags.blogPosts);
    await invalidateTag(tags.dashboard);
    return ok(post);
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await db.blogPost.findFirst({ where: { OR: [{ id }, { slug: id }] } });

    if (!existing) return notFound("Blog post not found");

    await db.blogPost.delete({ where: { id: existing.id } });
    await invalidateTag(tags.blogPosts);
    await invalidateTag(tags.dashboard);
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
