import { Card } from "@/components/ui/card";
import { ProjectForm } from "@/components/admin/project-form";
import { PageHeader } from "@/components/ui/page-header";
import { FolderKanban } from "lucide-react";

export default function NewProjectPage() {
  return (
    <div className="grid gap-8">
      <PageHeader title="New project" description="Create a case study for the public portfolio." />
      <Card>
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
            <FolderKanban size={14} className="text-[color:var(--primary)]" />
          </div>
          <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">Project details</h2>
        </div>
        <ProjectForm />
      </Card>
    </div>
  );
}
