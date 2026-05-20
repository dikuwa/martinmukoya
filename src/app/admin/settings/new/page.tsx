import { SiteSettingCreateForm } from "@/components/admin/simple-forms";
import { PageHeader } from "@/components/ui/page-header";

export default function NewSettingPage() {
  return <div className="grid gap-8"><PageHeader title="New setting" description="Create a JSON-backed site setting." /><SiteSettingCreateForm /></div>;
}
