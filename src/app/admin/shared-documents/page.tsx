import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { SharedDocumentActions } from "@/components/admin/shared-document-actions";
import type { Prisma } from "@/generated/prisma/client";

type Props = { searchParams: Promise<{ type?: string; status?: string }> };

export default async function SharedDocumentsPage({ searchParams }: Props) {
  const params = await searchParams;
  const type = params.type || "";
  const status = params.status || "";

  const where: Prisma.SharedDocumentWhereInput = {};
  if (type === "financial" || type === "business") where.documentType = type;
  if (status === "expired") where.expiresAt = { lte: new Date() };
  else if (status === "active") where.shareEnabled = true;
  else if (status === "revoked") where.shareEnabled = false;

  const shares = await db.sharedDocument.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      financialDocument: { select: { number: true, type: true, status: true, customerName: true } },
      businessDocument: { select: { documentNumber: true, documentType: true, status: true, title: true, recipientName: true } },
    },
  });

  const filterClass = "h-10 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-3 text-sm";

  return (
    <div className="grid gap-8">
      <PageHeader title="Shared documents" description="View all shared document links, track views and downloads, and manage sharing." />

      <form className="flex flex-wrap gap-2 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-4">
        <select name="type" defaultValue={type || ""} className={filterClass}>
          <option value="">All types</option>
          <option value="financial">Financial</option>
          <option value="business">Business</option>
        </select>
        <select name="status" defaultValue={status || ""} className={filterClass}>
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="revoked">Revoked</option>
        </select>
        <button className="rounded-xl bg-[color:var(--primary)] px-4 text-sm font-bold text-white">Filter</button>
        <Link href="/admin/shared-documents" className="grid place-items-center rounded-xl px-4 text-sm font-bold">Clear</Link>
      </form>

      <div className="overflow-hidden rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)]">
        <div className="grid gap-0.5">
          {shares.map((share) => {
            const isFinancial = share.documentType === "financial";
            const title = isFinancial
              ? `${share.financialDocument?.type || "Document"} ${share.financialDocument?.number || ""}`
              : share.businessDocument?.title || "Untitled";
            const recipient = isFinancial ? share.financialDocument?.customerName : share.businessDocument?.recipientName;
            const link = `${process.env.NEXT_PUBLIC_APP_URL || ""}/d/${share.shortCode}`;
            const isExpired = share.expiresAt && share.expiresAt < new Date();

            return (
              <div key={share.id} className="grid grid-cols-[1fr_auto] gap-3 border-b border-[color:var(--border-subtle)] px-5 py-4 last:border-0">
                <div className="grid gap-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[color:var(--text-strong)]">{title}</span>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold leading-4 ${
                      !share.shareEnabled ? "bg-red-50 text-red-600" :
                      isExpired ? "bg-gray-100 text-gray-600" :
                      "bg-green-50 text-green-600"
                    }`}>
                      {!share.shareEnabled ? "Revoked" : isExpired ? "Expired" : "Active"}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-[color:var(--text-faint)]">{share.documentType}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[color:var(--text-muted)]">
                    {recipient && <span>To: {recipient}</span>}
                    {share.viewCount > 0 && <span>{share.viewCount} views</span>}
                    {share.downloadCount > 0 && <span>{share.downloadCount} downloads</span>}
                    {share.firstViewedAt && <span>First: {new Date(share.firstViewedAt).toLocaleDateString("en-GB")}</span>}
                    {share.expiresAt && <span>Expires: {new Date(share.expiresAt).toLocaleDateString("en-GB")}</span>}
                    <span>Created: {new Date(share.createdAt).toLocaleDateString("en-GB")}</span>
                  </div>
                </div>
                <SharedDocumentActions
                  shortCode={share.shortCode}
                  link={link}
                  shareEnabled={share.shareEnabled}
                />
              </div>
            );
          })}
        </div>
        {!shares.length && (
          <p className="p-6 text-sm text-[color:var(--text-muted)]">No shared documents yet. Issue a document to generate a share link.</p>
        )}
      </div>
    </div>
  );
}
