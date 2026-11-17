import { randomBytes } from "node:crypto";

export function newShareToken() { return randomBytes(24).toString("base64url"); }

export function financialDocumentIsPublic(doc: { status: string; shareRevokedAt: Date | null; voidedAt: Date | null } | null | undefined) {
  return !!doc && !["DRAFT", "VOID"].includes(doc.status) && !doc.shareRevokedAt && !doc.voidedAt;
}

export function businessDocumentIsPublic(doc: { status: string; revokedAt: Date | null } | null | undefined) {
  return !!doc && !doc.revokedAt && !["DRAFT", "REVOKED", "SUPERSEDED", "EXPIRED", "ARCHIVED"].includes(doc.status);
}

export function sharedDocumentIsPublic(share: { shortCode: string; shareEnabled: boolean; expiresAt: Date | null; documentType: string; financialDocument?: Parameters<typeof financialDocumentIsPublic>[0]; businessDocument?: Parameters<typeof businessDocumentIsPublic>[0] } | null) {
  if (!share || share.shortCode.length < 22 || !share.shareEnabled || (share.expiresAt && share.expiresAt <= new Date())) return false;
  return share.documentType === "financial" ? financialDocumentIsPublic(share.financialDocument) : businessDocumentIsPublic(share.businessDocument);
}
