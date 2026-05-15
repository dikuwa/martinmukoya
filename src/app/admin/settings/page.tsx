import { AdminFilters, AdminTable } from "@/components/admin/admin-table";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";

type PageProps = { searchParams: Promise<{ search?: string }> };

export default async function AdminSettingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const items = await db.siteSetting.findMany({
    where: params.search ? { key: { contains: params.search, mode: "insensitive" } } : {},
    orderBy: { key: "asc" }
  });

  return (
    <div className="grid gap-8">
      <PageHeader title="Settings" description="Manage availability, contact details, social links, and homepage copy." />
      <AdminFilters search={params.search} />
      <AdminTable items={items} empty="No settings found." editHref={(item) => `/admin/settings/${item.key}/edit`} columns={[
        { header: "Key", cell: (item) => <span className="font-bold text-[color:var(--text-strong)]">{item.key}</span> },
        { header: "Value", cell: (item) => <code className="line-clamp-2 whitespace-normal text-xs text-[color:var(--text-muted)]">{JSON.stringify(item.value)}</code> },
        { header: "Updated", cell: (item) => item.updatedAt.toLocaleDateString() }
      ]} />
    </div>
  );
}
