import "server-only";
import { db } from "@/lib/db";

export const defaultDocumentSettings = {
  defaultSenderName: "Martin Mukoya",
  defaultSenderRole: "Managing Director",
  defaultSignature: "",
  backdropEnabled: true,
  defaultBusinessExpiryDays: 30,
  defaultProposalValidity: 30,
  defaultEmailSubject: "Document {{documentNumber}} from FlexTech Media",
  defaultEmailBody: "Hello {{recipientName}},\n\nPlease find the document below.\n\n{{shareLink}}\n\nRegards,\n{{senderName}}",
  defaultWhatsAppMsg: "Good afternoon {{recipientName}},\n\nPlease find your document below:\n{{shareLink}}\n\nRegards,\n{{senderName}}",
  aiDefaultTone: "Professional",
  aiDefaultStyle: "Structured",
  aiDefaultLength: "Medium",
  acceptanceEnabled: true
};

export async function getDocumentSettings(siteId: string | null) {
  const site = siteId ? await db.site.findUnique({ where: { id: siteId }, select: { slug: true } }) : null;
  const scoped = siteId ? await db.documentSettings.findUnique({ where: { siteId } }) : null;
  if (scoped) return scoped;
  const global = await db.documentSettings.findFirst({ where: { siteId: null }, orderBy: { updatedAt: "desc" } }) ?? defaultDocumentSettings;
  // Personal documents use the personal issuer's signer unless explicitly overridden.
  return site?.slug === "martin-mukoya" ? { ...global, defaultSenderName: "", defaultSenderRole: "" } : global;
}
