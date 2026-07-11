import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { BusinessDocumentComposer } from "@/components/admin/business-document-composer";

export default async function NewBusinessDocumentPage() {
  const [templates, leads, projects] = await Promise.all([
    db.businessDocumentTemplate.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    db.lead.findMany({ where: { status: { not: "ARCHIVED" } }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.project.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  return (
    <div className="grid gap-8">
      <PageHeader title="New business document" description="Create a proposal, contract, letter, report, or any official document." />
      <BusinessDocumentComposer templates={templates} leads={leads} projects={projects} />
    </div>
  );
}
