import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { BusinessDocumentComposer } from "@/components/admin/business-document-composer";
import { getIssuerSnapshot } from "@/lib/finance-service";
import { requireAdmin } from "@/lib/auth-guard";

type Props = { params: Promise<{ id: string }> };

export default async function EditBusinessDocumentPage({ params }: Props) {
  const { session } = await requireAdmin();
  const id = (await params).id;
  const doc = await db.businessDocument.findUnique({
    where: { id },
    include: { template: true },
  });
  if (!doc || doc.status !== "DRAFT") notFound();

  const [templates, leads, projects, sites, issuer] = await Promise.all([
    db.businessDocumentTemplate.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    db.lead.findMany({ where: { status: { not: "ARCHIVED" } }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.project.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.site.findMany({ orderBy: { name: "asc" } }),
    getIssuerSnapshot(),
  ]);

  return (
    <div className="grid gap-8">
      <PageHeader title={`Edit: ${doc.title}`} description="You can edit draft documents. Save to keep your changes." />
      <BusinessDocumentComposer
        templates={templates}
        leads={leads}
        projects={projects}
        sites={sites}
        initial={JSON.parse(JSON.stringify(doc))}
        business={{ name: issuer.name, email: issuer.email, phone: issuer.phone, address: issuer.address }}
        currentUser={{ name: session?.user.name || issuer.signerName, roleTitle: issuer.signerTitle }}
        generatedIssueDate={new Date().toISOString().slice(0, 10)}
      />
    </div>
  );
}
