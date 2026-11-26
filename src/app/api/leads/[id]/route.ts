import { notFound, ok, parseJson, serverError, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { invalidateTag, tags } from "@/lib/cache";
import { db } from "@/lib/db";
import { leadUpdateSchema } from "@/lib/validation/content";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await context.params;
    const lead = await db.lead.findUnique({ where: { id }, include: { chatSessions: true } });

    if (!lead) return notFound("Lead not found");
    return ok(lead);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await context.params;
    const { siteId: requestedSiteId, siteSlug, ...data } = await parseJson(request, leadUpdateSchema);
    const siteReference = requestedSiteId ?? siteSlug;
    if (siteReference === "") return ok({ error: "Select a valid site." }, { status: 400 });
    const existing = await db.lead.findUnique({ where: { id }, select: { siteId: true, linkedProjectId: true } });
    if (!existing) return notFound("Lead not found");
    let siteId = existing.siteId;
    if (siteReference) {
      const site = await db.site.findFirst({ where: { OR: [{ id: siteReference }, { slug: siteReference }] }, select: { id: true } });
      if (!site) return ok({ error: "The selected site does not exist." }, { status: 400 });
      siteId = site.id;
    }
    if (siteId !== existing.siteId) {
      const [booking, document, project] = await Promise.all([
        db.booking.findUnique({ where: { leadId: id }, select: { id: true } }),
        db.businessDocument.findFirst({ where: { leadId: id }, select: { id: true } }),
        existing.linkedProjectId ? db.project.findUnique({ where: { id: existing.linkedProjectId }, include: { sites: { select: { id: true } } } }) : null,
      ]);
      if (booking || document) return ok({ error: "The lead site is fixed after booking or document links exist." }, { status: 409 });
      if (project?.sites.length && !project.sites.some(item => item.id === siteId)) {
        return ok({ error: "The linked project does not belong to the selected site." }, { status: 409 });
      }
    }
    const updateData = { ...data, ...(siteReference ? { siteId } : {}) };
    const lead = await db.lead.update({ where: { id }, data: updateData });
    await invalidateTag(tags.leads);
    await invalidateTag(tags.dashboard);
    return ok(lead);
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
    await db.lead.delete({ where: { id } });
    await invalidateTag(tags.leads);
    await invalidateTag(tags.dashboard);
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
