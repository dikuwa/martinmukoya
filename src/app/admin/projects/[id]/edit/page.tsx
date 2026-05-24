import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { ProjectForm } from "@/components/admin/project-form";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { FolderKanban } from "lucide-react";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;
  const project = await db.project.findUnique({ where: { id }, include: { sites: true } });
  if (!project) notFound();
  return (
    <div className="grid gap-8">
      <PageHeader
        title={`Edit ${project.title}`}
        description="Update the public case study details."
        actions={<DeleteButton endpoint={`/api/projects/${project.id}`} redirectTo="/admin/projects" />}
      />
      <div className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow-xs)]">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
            <FolderKanban size={14} className="text-[color:var(--primary)]" />
          </div>
          <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">Project details</h2>
        </div>
        <ProjectForm initialData={project} />
      </div>
    </div>
  );
}
