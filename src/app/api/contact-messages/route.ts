import { ContactMessageStatus, Prisma } from "@/generated/prisma/client";
import { cacheKey, created, getPagination, ok, paginated, parseJson, parseListQuery, serverError, sortOrder, validationError } from "@/lib/api";
import { trackServerEvent } from "@/lib/analytics";
import { requireAdmin } from "@/lib/auth-guard";
import { getCachedOrFetch, invalidateTag, tags } from "@/lib/cache";
import { db } from "@/lib/db";
import { sendContactMessageNotification, sendVisitorConfirmation } from "@/lib/email";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getCurrentSite, getSiteBySlug } from "@/lib/sites";
import { contactMessageSchema } from "@/lib/validation/content";
import { z } from "zod";

const contactSubmissionSchema = contactMessageSchema.extend({
  website: z.string().max(0).optional()
});

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const query = parseListQuery(request);
    const { skip, take } = getPagination(query);
    const where: Prisma.ContactMessageWhereInput = {};

    if (query.status && query.status in ContactMessageStatus) where.status = query.status as ContactMessageStatus;
    if (query.siteId) where.siteId = query.siteId;
    if (query.site && query.site !== "all") where.site = { slug: query.site };
    if (query.category) where.inquiryType = query.category;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
        { inquiryType: { contains: query.search, mode: "insensitive" } },
        { message: { contains: query.search, mode: "insensitive" } }
      ];
    }

    const orderBy = sortOrder(query, ["createdAt", "updatedAt", "name", "status"], "createdAt") as Prisma.ContactMessageOrderByWithRelationInput;
    const data = await getCachedOrFetch(cacheKey(tags.contactMessages, request), async () => {
      const [items, total] = await Promise.all([
        db.contactMessage.findMany({ where, orderBy, skip, take, include: { site: true } }),
        db.contactMessage.count({ where })
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
    const limit = await rateLimit(`rate:contact:${ip}`, { limit: 5, windowSeconds: 60 * 60 });

    if (!limit.success) {
      return ok({ error: "Too many messages. Please try again later." }, { status: 429 });
    }

    const { website, ...data } = await parseJson(request, contactSubmissionSchema);

    if (website) {
      return created({ accepted: true });
    }

    const site = data.siteId ? await db.site.findUnique({ where: { id: data.siteId } }) : data.siteSlug ? await getSiteBySlug(data.siteSlug) : await getCurrentSite();
    const { siteId: _siteId, siteSlug: _siteSlug, ...messageData } = data;
    void _siteId;
    void _siteSlug;
    const message = await db.contactMessage.create({ data: { ...messageData, siteId: site?.id } });
    await invalidateTag(tags.contactMessages);
    await invalidateTag(tags.dashboard);
    await Promise.allSettled([
      trackServerEvent({
        eventType: "form_submitted",
        siteId: site?.id,
        siteSlug: site?.slug,
        page: data.sourcePage || "/contact",
        source: "contact_form",
        metadata: {
          form: "contact",
          messageId: message.id,
          inquiryType: message.inquiryType
        }
      }),
      sendContactMessageNotification(message),
      sendVisitorConfirmation({ name: message.name, email: message.email, kind: "contact" })
    ]);

    return created(message);
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}
