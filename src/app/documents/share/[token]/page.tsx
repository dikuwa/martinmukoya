import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";

type Props = { params: Promise<{ token: string }> };

/**
 * Legacy share route — redirects old /documents/share/:token URLs
 * to the new /d/:code format.
 */
export default async function LegacySharedDocument({ params }: Props) {
  const token = (await params).token;

  // First, check if there's already a SharedDocument with this shortCode
  const existing = await db.sharedDocument.findUnique({ where: { shortCode: token } });
  if (existing) {
    redirect(`/d/${existing.shortCode}`);
  }

  // Check if there's a legacy financial document shareToken
  const legacyDoc = await db.financialDocument.findUnique({ where: { shareToken: token } });
  if (legacyDoc && legacyDoc.status !== "DRAFT" && !legacyDoc.shareRevokedAt) {
    // Create a SharedDocument entry for the legacy token
    const newShare = await db.sharedDocument.create({
      data: {
        shortCode: token.slice(0, 7).replace(/-/g, ""),
        documentType: "financial",
        financialDocumentId: legacyDoc.id,
      },
    });
    redirect(`/d/${newShare.shortCode}`);
  }

  notFound();
}
