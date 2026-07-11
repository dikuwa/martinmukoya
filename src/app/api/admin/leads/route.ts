import { Prisma } from "@/generated/prisma/client";
import { created, ok, parseJson, serverError, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { invalidateTag, tags } from "@/lib/cache";
import { db } from "@/lib/db";
import { manualLeadSchema } from "@/lib/validation/content";
import { z } from "zod";

function digits(value?: string) {
  return value?.replace(/\D/g, "") || "";
}

export async function POST(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const input = await parseJson(request, manualLeadSchema);
    const email = (input.email || "").toLowerCase();
    const phone = digits(input.phone);
    const whatsApp = digits(input.whatsAppNumber);
    const duplicateFilters: Prisma.LeadWhereInput[] = [];
    if (email) duplicateFilters.push({ email: { equals: email, mode: "insensitive" } });
    if (phone) duplicateFilters.push({ phone: { contains: phone.slice(-7) } });
    if (whatsApp) duplicateFilters.push({ whatsAppNumber: { contains: whatsApp.slice(-7) } });
    const duplicates = duplicateFilters.length
      ? await db.lead.findMany({ where: { OR: duplicateFilters }, take: 5, orderBy: { createdAt: "desc" } })
      : [];
    if (duplicates.length && !input.createAnyway) {
      return ok({ error: "A lead with similar contact information already exists.", code: "DUPLICATE_LEAD", duplicates }, { status: 409 });
    }
    const lead = await db.lead.create({
      data: {
        name: input.name,
        company: input.company || null,
        email,
        phone: input.phone || null,
        whatsAppNumber: input.whatsAppNumber || null,
        preferredContact: input.preferredContact,
        source: input.source,
        serviceType: input.serviceType,
        projectGoal: input.projectGoal,
        message: input.message || input.projectGoal,
        internalNotes: input.internalNotes || null,
        status: input.status,
        siteId: input.siteId,
        linkedProjectId: input.linkedProjectId || null,
        followUpAt: input.followUpAt ? new Date(input.followUpAt) : null,
        emailValid: Boolean(email),
        phoneValid: Boolean(input.phone || input.whatsAppNumber)
      }
    });
    await Promise.all([invalidateTag(tags.leads), invalidateTag(tags.dashboard)]);
    return created(lead);
  } catch (error) {
    if (error instanceof z.ZodError) return validationError(error);
    return serverError(error);
  }
}
