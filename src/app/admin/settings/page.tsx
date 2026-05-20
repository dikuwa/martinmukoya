import { AdminFilters, AdminTable, SelectFilter } from "@/components/admin/admin-table";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { db } from "@/lib/db";
import Link from "next/link";
import { Suspense } from "react";

type PageProps = { searchParams: Promise<{ search?: string; site?: string }> };

async function SettingsTable({ searchParams }: PageProps) {
  const params = await searchParams;
  const sites = await db.site.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } });
  const items = await db.siteSetting.findMany({
    where: {
      ...(params.search ? { key: { contains: params.search, mode: "insensitive" as const } } : {}),
      ...(params.site && params.site !== "all" ? { site: { slug: params.site } } : {})
    },
    orderBy: { key: "asc" },
    include: { site: true }
  });

  return (
    <>
      <AdminFilters
        search={params.search}
        clearHref="/admin/settings"
        filters={<SelectFilter name="site" label="Site" value={params.site} options={[{ label: "All sites", value: "all" }, ...sites.map((site) => ({ label: site.name, value: site.slug }))]} />}
      />
      <AdminTable items={items} empty="No settings found." editHref={(item) => `/admin/settings/${item.id}/edit`} actionLabel="Edit" columns={[
        { header: "Key", cell: (item) => <span className="font-bold text-[color:var(--text-strong)]">{item.key}</span> },
        { header: "Site", cell: (item) => item.site?.name ?? "Global" },
        { header: "Value", cell: (item) => <code className="line-clamp-2 whitespace-normal text-xs text-[color:var(--text-muted)]">{JSON.stringify(item.value)}</code> },
        { header: "Updated", cell: (item) => item.updatedAt.toLocaleDateString() }
      ]} />
    </>
  );
}

export default function AdminSettingsPage(props: PageProps) {
  return (
    <div className="grid gap-8">
      <PageHeader title="Settings" description="Manage availability, contact details, social links, and homepage copy." actions={<Button asChild><Link href="/admin/settings/new">New Setting</Link></Button>} />
      <ErrorBoundary>
        <Suspense fallback={<SkeletonCard />}>
          <SettingsTable {...props} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
