import { notFound, ok, parseJson, serverError, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { invalidateTag, tags } from "@/lib/cache";
import { db } from "@/lib/db";
import { siteAssignment } from "@/lib/sites";
import { projectUpdateSchema } from "@/lib/validation/content";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const project = await db.project.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { sites: true }
    });

    if (!project) return notFound("Project not found");
    if (!project.published) {
      const { error } = await requireAdmin();
      if (error) return error;
    }

    return ok(project);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await context.params;
    const data = await parseJson(request, projectUpdateSchema);
    const { siteIds, siteSlugs, ...projectData } = data;
    const existing = await db.project.findFirst({ where: { OR: [{ id }, { slug: id }] } });

    if (!existing) return notFound("Project not found");

    const project = await db.project.update({
      where: { id: existing.id },
      data: { ...projectData, sites: siteAssignment(siteIds, siteSlugs, "set") }
    });
    await invalidateTag(tags.projects);
    await invalidateTag(tags.dashboard);
    return ok(project);
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await context.params;
    const existing = await db.project.findFirst({ where: { OR: [{ id }, { slug: id }] } });

    if (!existing) return notFound("Project not found");

    await db.project.delete({ where: { id: existing.id } });
    await invalidateTag(tags.projects);
    await invalidateTag(tags.dashboard);
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
