import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { ProjectForm } from "@/components/admin/project-form";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;
  const project = await db.project.findUnique({ where: { id }, include: { sites: true } });
  if (!project) notFound();
  return (
    <div className="grid gap-8">
      <PageHeader title={`Edit ${project.title}`} description="Update the public case study details." actions={<DeleteButton endpoint={`/api/projects/${project.id}`} redirectTo="/admin/projects" />} />
      <ProjectForm initialData={project} />
    </div>
  );
}
