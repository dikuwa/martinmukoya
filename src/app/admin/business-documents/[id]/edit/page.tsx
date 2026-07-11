import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { BusinessDocumentComposer } from "@/components/admin/business-document-composer";

type Props = { params: Promise<{ id: string }> };

export default async function EditBusinessDocumentPage({ params }: Props) {
  const id = (await params).id;
  const doc = await db.businessDocument.findUnique({
    where: { id },
    include: { template: true },
  });
  if (!doc || doc.status !== "DRAFT") notFound();

  const [templates, leads, projects] = await Promise.all([
    db.businessDocumentTemplate.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    db.lead.findMany({ where: { status: { not: "ARCHIVED" } }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.project.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  return (
    <div className="grid gap-8">
      <PageHeader title={`Edit: ${doc.title}`} description="You can edit draft documents. Save to keep your changes." />
      <BusinessDocumentComposer
        templates={templates}
        leads={leads}
        projects={projects}
        initial={JSON.parse(JSON.stringify(doc))}
      />
    </div>
  );
}
