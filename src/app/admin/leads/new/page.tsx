import { ManualLeadForm } from "@/components/admin/manual-lead-form";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";

export default async function NewLeadPage() {
  const [sites, projects] = await Promise.all([db.site.findMany({ orderBy: { name: "asc" } }), db.project.findMany({ orderBy: { title: "asc" } })]);
  return <div className="grid gap-8"><PageHeader title="Create lead" description="Add a referral, call, walk-in, or other lead directly to the shared pipeline."/><Card padding="lg"><ManualLeadForm sites={sites.map(x => ({value:x.id,label:x.name}))} projects={projects.map(x => ({value:x.id,label:x.title}))}/></Card></div>;
}
