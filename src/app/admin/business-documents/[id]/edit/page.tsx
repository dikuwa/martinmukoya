import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { BusinessDocumentComposer } from "@/components/admin/business-document-composer";
import { getIssuerSnapshot } from "@/lib/finance-service";
import { requireAdmin } from "@/lib/auth-guard";

type Props = { params: Promise<{ id: string }> };

export default async function EditBusinessDocumentPage({ params }: Props) {
  const { session, error } = await requireAdmin();
  if (error) notFound();
  const id = (await params).id;
  const doc = await db.businessDocument.findUnique({
    where: { id },
    include: { template: true },
  });
  if (!doc || doc.status !== "DRAFT") notFound();

  const [templates, leads, projects, financialDocuments, sites, contacts, issuer] = await Promise.all([
    db.businessDocumentTemplate.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    db.lead.findMany({ where: { status: { not: "ARCHIVED" } }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.project.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.financialDocument.findMany({ where: { type: { in: ["QUOTE", "INVOICE"] }, status: { in: ["ISSUED", "ACCEPTED", "PARTIALLY_PAID"] } }, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, number: true, type: true, total: true, customerName: true, customerEmail: true, customerPhone: true, customerCompany: true, siteId: true } }),
    db.site.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } }),
    db.contact.findMany({ orderBy: { name: "asc" }, take: 200, select: { id: true, name: true, email: true, phone: true, company: true } }),
    getIssuerSnapshot(doc.siteId ?? null),
  ]);
  const identities = await Promise.all(sites.map(async (site) => {
    const siteIssuer = await getIssuerSnapshot(site.id);
    return {
      id: site.id,
      slug: site.slug,
      name: site.name,
      business: { name: siteIssuer.name, email: siteIssuer.email, phone: siteIssuer.phone, address: siteIssuer.address },
      currentUser: { name: session?.user.name || siteIssuer.signerName, roleTitle: siteIssuer.signerTitle },
    };
  }));

  return (
    <div className="grid gap-8">
      <PageHeader title={`Edit: ${doc.title}`} description="You can edit draft documents. Save to keep your changes." />
      <BusinessDocumentComposer
        templates={templates}
        leads={leads}
        projects={projects}
        financialDocuments={financialDocuments}
        sites={sites}
        contacts={contacts}
        initial={JSON.parse(JSON.stringify(doc))}
        business={{ name: issuer.name, email: issuer.email, phone: issuer.phone, address: issuer.address }}
        currentUser={{ name: session?.user.name || issuer.signerName, roleTitle: issuer.signerTitle }}
        identities={identities}
        generatedIssueDate={new Date().toISOString().slice(0, 10)}
      />
    </div>
  );
}
