import { ManualLeadForm } from "@/components/admin/manual-lead-form";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";

export default async function NewLeadPage() {
  const [sites, projects] = await Promise.all([db.site.findMany({ orderBy: { name: "asc" } }), db.project.findMany({ orderBy: { title: "asc" } })]);
  return <div className="grid gap-8"><PageHeader title="Create lead" description="Add a referral, call, walk-in, or other lead directly to the shared pipeline."/><div className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6"><ManualLeadForm sites={sites.map(x => ({value:x.id,label:x.name}))} projects={projects.map(x => ({value:x.id,label:x.title}))}/></div></div>;
}
