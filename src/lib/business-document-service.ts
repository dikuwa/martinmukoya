import "server-only";

import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { getIssuerSnapshot } from "@/lib/finance-service";
import { BusinessDocumentType, Prisma } from "@/generated/prisma/client";

export type BusinessDocInput = {
  documentType: BusinessDocumentType;
  title: string;
  subject?: string;
  siteId?: string;
  contactId?: string;
  leadId?: string;
  projectId?: string;
  serviceId?: string;
  templateId?: string;
  templateVersion?: number;
  templateSnapshot?: Prisma.InputJsonObject;
  companyName?: string;
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientWhatsApp?: string;
  issueDate?: string | null;
  expiryDate?: string | null;
  reviewDate?: string | null;
  contentMarkdown: string;
  internalNotes?: string;
  aiPromptContext?: string;
  aiTone?: string;
  aiStyle?: string;
  aiLength?: string;
  signatureRequired?: boolean;
  senderName?: string;
  senderRole?: string;
  userId?: string;
};

function shortCode(): string {
  return randomBytes(5).toString("base64url").slice(0, 7);
}

function docNumber(type: string): string {
  const prefix = type === "PROPOSAL" ? "PRO" : type === "SERVICE_AGREEMENT" ? "AGR" : type === "NDA" ? "NDA" : type === "BUSINESS_LETTER" ? "LET" : type === "AUDIT_REPORT" ? "AUD" : "DOC";
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  return `${prefix}-${stamp}-${randomBytes(2).toString("hex").toUpperCase()}`;
}

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "untitled";
}

export async function createBusinessDocument(input: BusinessDocInput) {
  const issuer = await getIssuerSnapshot();
  const slug = slugify(input.title) + "-" + shortCode().slice(0, 4);
  return db.businessDocument.create({
    data: {
      documentNumber: docNumber(input.documentType),
      documentType: input.documentType,
      title: input.title,
      slug,
      subject: input.subject,
      siteId: input.siteId,
      contactId: input.contactId,
      leadId: input.leadId,
      projectId: input.projectId,
      serviceId: input.serviceId,
      templateId: input.templateId,
      templateVersion: input.templateVersion,
      templateSnapshot: input.templateSnapshot,
      companyName: input.companyName,
      recipientName: input.recipientName,
      recipientEmail: input.recipientEmail,
      recipientPhone: input.recipientPhone,
      recipientWhatsApp: input.recipientWhatsApp,
      issueDate: input.issueDate ? new Date(input.issueDate) : null,
      expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
      reviewDate: input.reviewDate ? new Date(input.reviewDate) : null,
      contentMarkdown: input.contentMarkdown,
      internalNotes: input.internalNotes,
      aiPromptContext: input.aiPromptContext,
      aiTone: input.aiTone || "Professional",
      aiStyle: input.aiStyle || "Structured",
      aiLength: input.aiLength || "Medium",
      signatureRequired: input.signatureRequired ?? false,
      senderName: input.senderName || issuer.signerName,
      senderRole: input.senderRole || issuer.signerTitle,
      senderUserId: input.userId,
      createdById: input.userId,
      auditLog: {
        create: {
          action: "CREATED",
          userId: input.userId,
        }
      }
    },
    include: { auditLog: { orderBy: { createdAt: "desc" }, take: 5 } }
  });
}

export async function updateBusinessDocument(id: string, input: Partial<BusinessDocInput> & Record<string, unknown>) {
  const data: Prisma.BusinessDocumentUncheckedUpdateInput = {};
  for (const [key, value] of Object.entries(input)) {
    if (key === "userId" || key === "issueDate" || key === "expiryDate" || key === "reviewDate") continue;
    if (value === undefined) continue; // undefined = don't update
    (data as Record<string, unknown>)[key] = value;
  }
  if (input.issueDate !== undefined) data.issueDate = input.issueDate ? new Date(input.issueDate) : null;
  if (input.expiryDate !== undefined) data.expiryDate = input.expiryDate ? new Date(input.expiryDate) : null;
  if (input.reviewDate !== undefined) data.reviewDate = input.reviewDate ? new Date(input.reviewDate) : null;

  await db.businessDocumentAuditLog.create({
    data: { documentId: id, action: "EDITED", userId: input.userId }
  });
  return db.businessDocument.update({
    where: { id },
    data,
    include: { auditLog: { orderBy: { createdAt: "desc" }, take: 5 } }
  });
}

export async function issueBusinessDocument(id: string, userId?: string) {
  const doc = await db.businessDocument.findUnique({ where: { id } });
  if (!doc || doc.status !== "DRAFT") throw new Error("Only draft documents can be issued.");
  const result = await db.businessDocument.update({
    where: { id },
    data: {
      status: "ISSUED",
      issueDate: new Date(),
      documentNumber: doc.documentNumber || docNumber(doc.documentType),
      auditLog: { create: { action: "ISSUED", userId } }
    }
  });
  // Create share link
  await createSharedDocumentLink(id, "business");
  return result;
}

export async function createSharedDocumentLink(documentId: string, docType: "business" | "financial") {
  const code = shortCode();
  const existing = await db.sharedDocument.findFirst({
    where: docType === "business" ? { businessDocumentId: documentId } : { financialDocumentId: documentId }
  });
  if (existing) return existing;

  return db.sharedDocument.create({
    data: {
      shortCode: code,
      documentType: docType,
      ...(docType === "business"
        ? { businessDocumentId: documentId }
        : { financialDocumentId: documentId })
    }
  });
}

export async function revokeShareLink(shortCode: string) {
  return db.sharedDocument.update({
    where: { shortCode },
    data: { shareEnabled: false, expiresAt: new Date() }
  });
}

export async function regenerateShareLink(oldCode: string) {
  const existing = await db.sharedDocument.findUnique({ where: { shortCode: oldCode } });
  if (!existing) throw new Error("Share link not found.");
  await db.sharedDocument.update({ where: { shortCode: oldCode }, data: { shareEnabled: false } });
  return db.sharedDocument.create({
    data: {
      shortCode: shortCode(),
      documentType: existing.documentType,
      financialDocumentId: existing.financialDocumentId,
      businessDocumentId: existing.businessDocumentId,
    }
  });
}

export async function trackSharedDocumentView(shortCode: string) {
  return db.sharedDocument.update({
    where: { shortCode },
    data: {
      viewCount: { increment: 1 },
      lastViewedAt: new Date(),
      ...(await db.sharedDocument.findUnique({ where: { shortCode } }))?.firstViewedAt ? {} : { firstViewedAt: new Date() }
    }
  });
}

export async function trackSharedDocumentDownload(shortCode: string) {
  return db.sharedDocument.update({
    where: { shortCode },
    data: { downloadCount: { increment: 1 } }
  });
}

export async function acceptBusinessDocument(id: string, input: { name: string; comment?: string; ip?: string; userAgent?: string }, userId?: string) {
  const doc = await db.businessDocument.update({
    where: { id },
    data: {
      status: "ACCEPTED",
      acceptedAt: new Date(),
      auditLog: { create: { action: "ACCEPTED", detail: `Accepted by ${input.name}`, userId } }
    }
  });
  await db.sharedDocument.updateMany({
    where: { businessDocumentId: id },
    data: { acceptedAt: new Date(), acceptedName: input.name, acceptedComment: input.comment, acceptedIp: input.ip, acceptedUserAgent: input.userAgent }
  });
  return doc;
}

export async function declineBusinessDocument(id: string, reason?: string, comment?: string, userId?: string) {
  return db.businessDocument.update({
    where: { id },
    data: {
      status: "DECLINED",
      declinedReason: reason,
      declinedComment: comment,
      declinedAt: new Date(),
      auditLog: { create: { action: "DECLINED", detail: reason || "Declined", userId } }
    }
  });
}

export async function reviseBusinessDocument(id: string, userId?: string) {
  const source = await db.businessDocument.findUnique({ where: { id }, include: { publicShare: true } });
  if (!source || source.status === "DRAFT") throw new Error("Only issued documents can be revised.");
  await db.businessDocument.update({ where: { id }, data: { status: "SUPERSEDED" } });
  return db.businessDocument.create({
    data: {
      documentType: source.documentType,
      title: `Revision of ${source.title}`,
      slug: slugify(`revision-${source.title}`) + "-" + shortCode().slice(0, 4),
      siteId: source.siteId,
      contactId: source.contactId,
      leadId: source.leadId,
      projectId: source.projectId,
      serviceId: source.serviceId,
      templateId: source.templateId,
      revisionOfId: source.id,
      companyName: source.companyName,
      recipientName: source.recipientName,
      recipientEmail: source.recipientEmail,
      recipientPhone: source.recipientPhone,
      recipientWhatsApp: source.recipientWhatsApp,
      contentMarkdown: source.contentMarkdown,
      aiTone: source.aiTone,
      aiStyle: source.aiStyle,
      aiLength: source.aiLength,
      signatureRequired: source.signatureRequired,
      senderName: source.senderName,
      senderRole: source.senderRole,
      createdById: userId,
      auditLog: { create: { action: "REVISED", userId } }
    }
  });
}

export function getWhatsAppNumber(phone?: string, whatsApp?: string, phoneIsWhatsApp?: boolean): string | null {
  const number = (whatsApp || (phoneIsWhatsApp !== false && phone)) || null;
  if (!number) return null;
  // Clean the number: remove spaces, dashes, brackets, and leading +
  let cleaned = number.replace(/[\s\-\(\)]+/g, "").replace(/^\+/, "");
  // Namibian mobile numbers: 081xxxxxxx, 085xxxxxxx → +26481xxxxxxx
  if (/^(081|085|061)/.test(cleaned) && cleaned.length <= 10) {
    cleaned = "264" + cleaned.slice(1);
  }
  // Already international: starts with country code
  if (/^[1-9]\d{6,14}$/.test(cleaned)) {
    return cleaned;
  }
  return cleaned;
}

export function generateWhatsAppUrl(number: string, message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encoded}`;
}

function defaultWhatsAppMessage(doc: { documentNumber?: string | null; documentType: string; title: string; recipientName?: string | null }, shortLink: string): string {
  const typeLabels: Record<string, string> = {
    PROPOSAL: "project proposal",
    SERVICE_AGREEMENT: "service agreement",
    WEB_DESIGN_CONTRACT: "web design contract",
    NDA: "confidentiality agreement",
    BUSINESS_LETTER: "business letter",
    PAYMENT_REMINDER: "payment reminder",
    AUDIT_REPORT: "audit report",
    PROJECT_HANDOVER: "project handover document",
    SCOPE_OF_WORK: "scope of work document",
  };
  const label = typeLabels[doc.documentType] || "document";
  return `Good afternoon ${doc.recipientName || "client"},\n\nPlease find your ${label} below:\n${shortLink}\n\nRegards,\nMartin Mukoya`;
}

export function buildWhatsAppMessage(doc: { documentNumber?: string | null; documentType: string; title: string; recipientName?: string | null }, shortLink: string, template?: string | null): string {
  if (template) {
    return template
      .replace(/\{\{recipientName\}\}/g, doc.recipientName || "client")
      .replace(/\{\{documentNumber\}\}/g, doc.documentNumber || "")
      .replace(/\{\{documentType\}\}/g, doc.documentType)
      .replace(/\{\{title\}\}/g, doc.title)
      .replace(/\{\{shareLink\}\}/g, shortLink)
      .replace(/\{\{senderName\}\}/g, "Martin Mukoya");
  }
  return defaultWhatsAppMessage(doc, shortLink);
}

export async function seedTemplates(userId?: string) {
  const existing = await db.businessDocumentTemplate.count();
  if (existing > 0) return { skipped: true, count: existing };

  const templates = [
    { name: "Project proposal", documentCategory: "PROPOSAL" as const, defaultBodyMarkdown: "# Project Proposal\n\n## Introduction\n\nThank you for the opportunity to present this proposal.\n\n## Objectives\n\n- \n\n## Proposed Solution\n\n## Deliverables\n\n| Item | Description | Timeline |\n|------|-------------|----------|\n| 1 | | |\n\n## Investment\n\n## Next Steps\n\nPlease review this proposal and let us know if you have any questions.\n\n---\n\n**FlexTech Media**", signatureRequired: true },
    { name: "Service agreement", documentCategory: "SERVICE_AGREEMENT" as const, defaultBodyMarkdown: "# Service Agreement\n\nThis Service Agreement is entered into between:\n\n**FlexTech Media** (\"Provider\")\nand\n**[Client Name]** (\"Client\")\n\n## 1. Services\n\nThe Provider agrees to provide the following services:\n\n## 2. Payment Terms\n\n## 3. Timeline\n\n## 4. Revisions\n\n## 5. Intellectual Property\n\n## 6. Cancellation\n\n## 7. Acceptance\n\n---\n\n**FlexTech Media**", signatureRequired: true },
    { name: "Web design contract", documentCategory: "WEB_DESIGN_CONTRACT" as const, defaultBodyMarkdown: "# Web Design Contract\n\n## Parties\n\n## Scope of Work\n\n## Design Process\n\n## Timeline\n\n## Payment Schedule\n\n## Revisions\n\n## Intellectual Property\n\n## Termination\n\n## Signatures\n\n---\n\n**FlexTech Media**", signatureRequired: true },
    { name: "Website maintenance agreement", documentCategory: "MAINTENANCE_AGREEMENT" as const, defaultBodyMarkdown: "# Website Maintenance Agreement\n\n## Services Included\n\n- Monthly updates and security patches\n- Content updates (up to 2 hours/month)\n- Performance monitoring\n- Backup management\n\n## Exclusions\n\n## Term\n\n## Fees\n\n## Signatures\n\n---\n\n**FlexTech Media**", signatureRequired: true },
    { name: "Scope of work", documentCategory: "SCOPE_OF_WORK" as const, defaultBodyMarkdown: "# Scope of Work\n\n## Project Overview\n\n## In Scope\n\n## Out of Scope\n\n## Deliverables\n\n## Timeline\n\n## Assumptions\n\n---\n\n**FlexTech Media**" },
    { name: "Change request", documentCategory: "CHANGE_REQUEST" as const, defaultBodyMarkdown: "# Change Request\n\n## Project\n\n## Requested Change\n\n## Reason for Change\n\n## Impact Assessment\n\n- Timeline impact:\n- Cost impact:\n- Resource impact:\n\n## Approval\n\n---\n\n**FlexTech Media**" },
    { name: "Project handover", documentCategory: "PROJECT_HANDOVER" as const, defaultBodyMarkdown: "# Project Handover Document\n\n## Project Summary\n\n## Completed Deliverables\n\n## Access and Credentials\n\n## Handover Checklist\n\n- [ ] Source code transferred\n- [ ] Documentation provided\n- [ ] Admin access granted\n- [ ] Domain access transferred\n- [ ] Hosting credentials shared\n\n## Sign-Off\n\n---\n\n**FlexTech Media**", signatureRequired: true },
    { name: "Formal business letter", documentCategory: "BUSINESS_LETTER" as const, defaultBodyMarkdown: "# [Subject]\n\n**Date:** \n\n**To:**\n\n**From:**\n\nDear ,\n\n\n\nSincerely,\n\n---\n\n**FlexTech Media**" },
    { name: "Payment reminder", documentCategory: "PAYMENT_REMINDER" as const, defaultBodyMarkdown: "# Payment Reminder\n\n**Date:** \n\n**To:**\n\n**Reference:** \n\n## Outstanding Balance\n\n## Payment Details\n\n## Next Steps\n\nPlease arrange payment at your earliest convenience to avoid service interruption.\n\n---\n\n**FlexTech Media**" },
    { name: "Website audit report", documentCategory: "AUDIT_REPORT" as const, defaultBodyMarkdown: "# Website Audit Report\n\n## Executive Summary\n\n## Findings\n\n| Issue | Severity | Recommendation |\n|-------|----------|----------------|\n| | | |\n\n## Performance Analysis\n\n## SEO Assessment\n\n## Security Review\n\n## Recommended Next Steps\n\n---\n\n**FlexTech Media**" },
    { name: "NDA / Confidentiality agreement", documentCategory: "NDA" as const, defaultBodyMarkdown: "# Confidentiality Agreement (NDA)\n\n## Parties\n\n## Definition of Confidential Information\n\n## Obligations\n\n## Exclusions\n\n## Term\n\n## Governing Law\n\n## Signatures\n\n---\n\n**FlexTech Media**", signatureRequired: true },
    { name: "Custom blank document", documentCategory: "CUSTOM" as const, defaultBodyMarkdown: "# Title\n\n## Section\n\n\n\n---\n\n**FlexTech Media**" },
  ];

  for (const tpl of templates) {
    await db.businessDocumentTemplate.create({
      data: {
        ...tpl,
        defaultTone: "Professional",
        defaultStyle: "Structured",
        defaultLength: "Medium",
        sortOrder: templates.indexOf(tpl),
        active: true,
        createdById: userId,
      }
    });
  }
  return { skipped: false, count: templates.length };
}
