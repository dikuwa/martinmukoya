import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { TemplateForm } from "@/components/admin/template-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditTemplatePage({ params }: Props) {
  const template = await db.businessDocumentTemplate.findUnique({ where: { id: (await params).id } });
  if (!template) notFound();

  return (
    <div className="grid gap-8">
      <PageHeader title={`Edit: ${template.name}`} description="Update template content and settings." />
      <TemplateForm initial={JSON.parse(JSON.stringify(template))} />
    </div>
  );
}
