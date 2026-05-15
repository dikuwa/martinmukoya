import { ProjectForm } from "@/components/admin/project-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NewProjectPage() {
  return <div className="grid gap-8"><PageHeader title="New project" description="Create a case study for the public portfolio." /><ProjectForm /></div>;
}
