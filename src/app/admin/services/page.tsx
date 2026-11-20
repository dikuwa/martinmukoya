import Link from "next/link";
import { db } from "@/lib/db";
import { formatNad } from "@/lib/financial";
import { PageHeader } from "@/components/ui/page-header";
import { ServiceCatalogForm } from "@/components/admin/service-catalog-form";
export default async function ServicesPage() {
  const services = await db.serviceCatalogItem.findMany({ orderBy: { name: "asc" } });
  return <div className="grid gap-6">
    <PageHeader title="Services" description="Reusable prices for repairs, design and other one-off work."
      actions={<Link className="text-sm underline" href="/admin/customers">Select customer to create a job</Link>}/>
    <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
      <div className="divide-y divide-[color:var(--border-subtle)] rounded-md border border-[color:var(--border-subtle)] p-4">
        {services.map(service => <div key={service.id} className="flex justify-between gap-3 py-3">
          <div><h2 className="text-sm font-medium">{service.name}</h2>
            {service.description && <p className="text-xs text-[color:var(--text-muted)]">{service.description}</p>}
          </div><span className="shrink-0 text-sm font-medium">{formatNad(String(service.price))}</span>
        </div>)}
        {!services.length && <p className="text-sm text-[color:var(--text-muted)]">No saved services. Add one or use a custom job from a customer profile.</p>}
      </div>
      <ServiceCatalogForm/>
    </div>
  </div>;
}