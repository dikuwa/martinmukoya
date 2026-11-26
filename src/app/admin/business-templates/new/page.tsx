import { PageHeader } from "@/components/ui/page-header";
import { TemplateForm } from "@/components/admin/template-form";
import { requireAdmin } from "@/lib/auth-guard";
import { notFound } from "next/navigation";

export default async function NewTemplatePage() {
  const { error } = await requireAdmin();
  if (error) notFound();
  return (
    <div className="grid gap-8">
      <PageHeader title="New template" description="Create a reusable document template." />
      <TemplateForm />
    </div>
  );
}
