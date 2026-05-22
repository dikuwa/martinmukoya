import { LeadStatus, Prisma, ServiceType } from "@/generated/prisma/client";
import { cacheKey, created, getPagination, ok, paginated, parseJson, parseListQuery, serverError, sortOrder, validationError } from "@/lib/api";
import { trackServerEvent } from "@/lib/analytics";
import { requireAdmin } from "@/lib/auth-guard";
import { getCachedOrFetch, invalidateTag, tags } from "@/lib/cache";
import { db } from "@/lib/db";
import { sendLeadNotification, sendVisitorConfirmation } from "@/lib/email";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getCurrentSite, getSiteBySlug } from "@/lib/sites";
import { leadSchema } from "@/lib/validation/content";
import { createNotification } from "@/lib/notifications";
import { z } from "zod";

const leadSubmissionSchema = leadSchema.extend({
  website: z.string().max(0).optional()
});

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const query = parseListQuery(request);
    const { skip, take } = getPagination(query);
    const where: Prisma.LeadWhereInput = {};

    if (query.status && query.status in LeadStatus) where.status = query.status as LeadStatus;
    if (query.siteId) where.siteId = query.siteId;
    if (query.site && query.site !== "all") where.site = { slug: query.site };
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
        db.lead.findMany({ where, orderBy, skip, take, include: { site: true } }),
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
    const ip = getClientIp(request);
    const limit = await rateLimit(`rate:leads:${ip}`, { limit: 5, windowSeconds: 60 * 60 });

    if (!limit.success) {
      return ok({ error: "Too many project requests. Please try again later." }, { status: 429 });
    }

    const { website, ...data } = await parseJson(request, leadSubmissionSchema);

    if (website) {
      return created({ accepted: true });
    }

    const site = data.siteId ? await db.site.findUnique({ where: { id: data.siteId } }) : data.siteSlug ? await getSiteBySlug(data.siteSlug) : await getCurrentSite();
    const { siteId: _siteId, siteSlug: _siteSlug, ...leadData } = data;
    void _siteId;
    void _siteSlug;
    const lead = await db.lead.create({ data: { ...leadData, siteId: site?.id } });
    await invalidateTag(tags.leads);
    await invalidateTag(tags.dashboard);

    // Create notification immediately so the bell icon shows it on next fetch
    await createNotification({
      siteId: site?.id ?? null,
      type: "lead",
      sourceId: lead.id,
      title: lead.name,
      detail: lead.projectGoal.slice(0, 120),
      href: `/admin/leads/${lead.id}`,
      createdAt: lead.createdAt
    });

    await Promise.allSettled([
      trackServerEvent({
        eventType: "form_submitted",
        page: "/start-project",
        siteId: site?.id,
        siteSlug: site?.slug,
        source: data.source,
        metadata: {
          form: "start_project",
          leadId: lead.id,
          serviceType: lead.serviceType,
          budgetRange: lead.budgetRange,
          timeline: lead.timeline
        }
      }),
      sendLeadNotification(lead),
      sendVisitorConfirmation({ name: lead.name, email: lead.email, kind: "lead" })
    ]);

    return created(lead);
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}
