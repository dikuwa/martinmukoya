import { db } from "@/lib/db";
import { Prisma, type BusinessDocumentType } from "@/generated/prisma/client";

type Links = {
  documentType: BusinessDocumentType;
  siteId?: string | null;
  leadId?: string | null;
  projectId?: string | null;
  financialDocumentId?: string | null;
  templateId?: string | null;
};

export class InvalidDocumentLinks extends Error {}

// An omitted PATCH field retains its link. An explicit null removes it.
export async function resolveBusinessDocumentLinks(input: Partial<Links>, existing?: Links) {
  const links = { ...existing, ...input };
  const [site, lead, project, financial, template] = await Promise.all([
    links.siteId ? db.site.findFirst({ where: { OR: [{ id: links.siteId }, { slug: links.siteId }] }, select: { id: true } }) : null,
    links.leadId ? db.lead.findUnique({ where: { id: links.leadId }, select: { siteId: true } }) : null,
    links.projectId ? db.project.findUnique({ where: { id: links.projectId }, select: { sites: { select: { id: true } } } }) : null,
    links.financialDocumentId ? db.financialDocument.findUnique({ where: { id: links.financialDocumentId }, select: { siteId: true } }) : null,
    links.templateId ? db.businessDocumentTemplate.findUnique({ where: { id: links.templateId } }) : null,
  ]);
  if (links.siteId && !site) throw new InvalidDocumentLinks("The selected document identity no longer exists.");
  if (links.leadId && !lead) throw new InvalidDocumentLinks("The selected lead no longer exists.");
  if (links.projectId && !project) throw new InvalidDocumentLinks("The selected project no longer exists.");
  if (links.financialDocumentId && !financial) throw new InvalidDocumentLinks("The selected financial document no longer exists.");
  if (links.templateId && !template) throw new InvalidDocumentLinks("The selected template no longer exists.");
  if (template && template.documentCategory !== links.documentType) throw new InvalidDocumentLinks("The selected template is not compatible with this document type.");

  const projectSites = project?.sites.map(({ id }) => id) ?? [];
  let siteId = site?.id ?? lead?.siteId ?? financial?.siteId ?? (projectSites.length === 1 ? projectSites[0] : null);
  if ((lead?.siteId && lead.siteId !== siteId) || (financial && financial.siteId !== siteId) ||
      (existing && input.siteId === null && siteId)) {
    throw new InvalidDocumentLinks("The linked lead and financial document must match the document identity.");
  }
  const templateChanged = (existing?.templateId || null) !== (links.templateId || null);
  if (!siteId && !existing && input.siteId === undefined) {
    const business = await db.site.findUnique({ where: { slug: "flextech-media" }, select: { id: true } });
    siteId = business?.id ?? null;
  }
  if (projectSites.length && (!siteId || !projectSites.includes(siteId))) {
    throw new InvalidDocumentLinks("The selected project does not belong to the document identity.");
  }
  return {
    siteId,
    leadId: links.leadId || null,
    projectId: links.projectId || null,
    financialDocumentId: links.financialDocumentId || null,
    templateId: links.templateId || null,
    ...(templateChanged ? {
      templateVersion: template ? 1 : null,
      templateSnapshot: template ? {
        id: template.id, name: template.name, documentCategory: template.documentCategory,
        defaultTitle: template.defaultTitle, defaultSubject: template.defaultSubject,
        defaultBodyMarkdown: template.defaultBodyMarkdown, signatureRequired: template.signatureRequired,
        senderName: template.senderName, senderRole: template.senderRole, updatedAt: template.updatedAt.toISOString(),
      } : Prisma.DbNull,
    } : {}),
  };
}
