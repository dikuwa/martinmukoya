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

export async function getDocumentSettings() {
  const settings = await db.documentSettings.findFirst({ orderBy: { updatedAt: "desc" } });
  return settings ?? defaultDocumentSettings;
}
