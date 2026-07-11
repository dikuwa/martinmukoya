import { PageHeader } from "@/components/ui/page-header";
import { TemplateForm } from "@/components/admin/template-form";

export default function NewTemplatePage() {
  return (
    <div className="grid gap-8">
      <PageHeader title="New template" description="Create a reusable document template." />
      <TemplateForm />
    </div>
  );
}
