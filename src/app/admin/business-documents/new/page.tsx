import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { BusinessDocumentComposer } from "@/components/admin/business-document-composer";
import { getIssuerSnapshot } from "@/lib/finance-service";
import { requireAdmin } from "@/lib/auth-guard";

export default async function NewBusinessDocumentPage() {
  const { session } = await requireAdmin();
  const [templates, leads, projects, financialDocuments, sites, issuer] = await Promise.all([
    db.businessDocumentTemplate.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    db.lead.findMany({ where: { status: { not: "ARCHIVED" } }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.project.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.financialDocument.findMany({ where: { type: { in: ["QUOTE", "INVOICE"] }, status: { in: ["ISSUED", "ACCEPTED", "PARTIALLY_PAID"] } }, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, number: true, type: true, total: true, customerName: true } }),
    db.site.findMany({ orderBy: { name: "asc" } }),
    getIssuerSnapshot(),
  ]);

  return (
    <div className="grid gap-8">
      <PageHeader title="New business document" description="Create a proposal, contract, letter, report, or any official document." />
      <BusinessDocumentComposer templates={templates} leads={leads} projects={projects} financialDocuments={financialDocuments} sites={sites}
        business={{ name: issuer.name, email: issuer.email, phone: issuer.phone, address: issuer.address }}
        currentUser={{ name: session?.user.name || issuer.signerName, roleTitle: issuer.signerTitle }}
        generatedIssueDate={new Date().toISOString().slice(0, 10)} />
    </div>
  );
}
