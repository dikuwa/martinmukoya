import { notFound, ok, parseJson, serverError, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { invalidateTag, tags } from "@/lib/cache";
import { db } from "@/lib/db";
import { siteAssignment } from "@/lib/sites";
import { testimonialUpdateSchema } from "@/lib/validation/content";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const testimonial = await db.testimonial.findUnique({ where: { id }, include: { sites: true } });

    if (!testimonial) return notFound("Testimonial not found");
    if (!testimonial.published) {
      const { error } = await requireAdmin();
      if (error) return error;
    }

    return ok(testimonial);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await context.params;
    const data = await parseJson(request, testimonialUpdateSchema);
    const { siteIds, siteSlugs, ...testimonialData } = data;
    const testimonial = await db.testimonial.update({ where: { id }, data: { ...testimonialData, sites: siteAssignment(siteIds, siteSlugs, "set") } });
    await invalidateTag(tags.testimonials);
    await invalidateTag(tags.dashboard);
    return ok(testimonial);
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
    await db.testimonial.delete({ where: { id } });
    await invalidateTag(tags.testimonials);
    await invalidateTag(tags.dashboard);
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
