import { db } from "@/lib/db";

export class AcceptanceConflict extends Error {
  constructor() { super("This document is no longer available for acceptance."); }
}

type Target = { kind: "financial" | "business"; id: string; shortCode: string }
  | { kind: "business"; id: string; userId: string };

export async function acceptDocument(target: Target, input: { name: string; comment?: string; ip?: string; userAgent?: string }) {
  return db.$transaction(async tx => {
    const acceptedAt = new Date();
    const publicLink = "shortCode" in target;
    const link = target.kind === "financial" ? { financialDocumentId: target.id } : { businessDocumentId: target.id };
    const claim = await tx.sharedDocument.updateMany({
      where: {
        ...link, documentType: target.kind, acceptedAt: null, declinedAt: null,
        ...(publicLink ? { shortCode: target.shortCode, shareEnabled: true, OR: [{ expiresAt: null }, { expiresAt: { gt: acceptedAt } }] } : {}),
      },
      data: { acceptedAt, acceptedName: input.name, acceptedComment: input.comment, acceptedIp: input.ip, acceptedUserAgent: input.userAgent },
    });
    // Admins can accept an unshared document. A public request must claim its exact link.
    if (!claim.count && (publicLink || await tx.sharedDocument.count({ where: link }))) throw new AcceptanceConflict();

    if (target.kind === "financial") {
      const [doc] = await tx.financialDocument.updateManyAndReturn({
        where: { id: target.id, type: "QUOTE", status: "ISSUED", acceptedAt: null, declinedAt: null, voidedAt: null, shareRevokedAt: null },
        data: { status: "ACCEPTED", acceptedAt, acceptedName: input.name },
      });
      if (!doc) throw new AcceptanceConflict();
      await tx.notification.create({ data: {
        siteId: doc.siteId, type: "quote_accepted", sourceId: doc.id, title: `Quote ${doc.number || "draft"} accepted`,
        detail: `Accepted by ${input.name}`, href: `/admin/documents/${doc.id}`,
      } });
      return doc;
    }

    const [doc] = await tx.businessDocument.updateManyAndReturn({
      where: { id: target.id, status: { in: ["READY", "ISSUED", "SENT", "VIEWED"] }, acceptedAt: null, declinedAt: null, revokedAt: null },
      data: { status: "ACCEPTED", acceptedAt },
    });
    if (!doc) throw new AcceptanceConflict();
    await tx.businessDocumentAuditLog.create({ data: {
      documentId: doc.id, action: "ACCEPTED", detail: `Accepted by ${input.name}`, userId: "userId" in target ? target.userId : undefined,
    } });
    return doc;
  });
}
