import Link from "next/link";
import { db } from "@/lib/db";
import { formatNad } from "@/lib/financial";
import { PageHeader } from "@/components/ui/page-header";
import { ServiceCatalogForm } from "@/components/admin/service-catalog-form";
import { LiveSearchInput } from "@/components/admin/live-search-input";
type Props = { searchParams: Promise<{ search?: string }> };
export default async function ServicesPage({ searchParams }: Props) {
  const params = await searchParams;
  const services = await db.serviceCatalogItem.findMany({ where: params.search ? { OR: [{ name: { contains: params.search, mode: "insensitive" } }, { description: { contains: params.search, mode: "insensitive" } }] } : undefined, orderBy: { name: "asc" } });
  return <div className="grid gap-6">
    <PageHeader title="Services" description="Reusable prices for repairs, design and other one-off work."
      actions={<Link className="text-sm underline" href="/admin/customers">Select customer to create a job</Link>}/>
    <LiveSearchInput defaultValue={params.search} placeholder="Search services…" aria-label="Search services" className="h-10 w-full rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-3 text-sm" />
    <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
      <div className="divide-y divide-[color:var(--border-subtle)] rounded-md border border-[color:var(--border-subtle)] p-4">
        {services.map(service => <details key={service.id} className="min-w-0 py-3">
          <summary className="cursor-pointer break-words text-sm font-medium">
            {service.name} · {formatNad(String(service.price))}{service.active ? "" : " · Archived"}
          </summary>
          <div className="mt-3">
            <ServiceCatalogForm key={JSON.stringify([service.name, service.description, String(service.price), service.active])} service={{
              id: service.id, name: service.name, description: service.description,
              price: String(service.price), active: service.active,
            }}/>
          </div>
        </details>)}
        {!services.length && <p className="text-sm text-[color:var(--text-muted)]">No saved services. Add one or use a custom job from a customer profile.</p>}
      </div>
      <ServiceCatalogForm/>
    </div>
  </div>;
}
