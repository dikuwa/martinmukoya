import { PageHeader } from "@/components/ui/page-header";
import { DocumentSettingsForm } from "@/components/admin/document-settings-form";

export default function DocumentSettingsPage() {
  return (
    <div className="grid gap-8">
      <PageHeader
        title="Document settings"
        description="Default sender, templates, AI preferences, and acceptance settings for all documents."
      />
      <DocumentSettingsForm />
    </div>
  );
}
