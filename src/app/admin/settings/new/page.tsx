import { Card } from "@/components/ui/card";
import { SiteSettingCreateForm } from "@/components/admin/simple-forms";
import { PageHeader } from "@/components/ui/page-header";
import { Settings2 } from "lucide-react";

export default function NewSettingPage() {
  return (
    <div className="grid gap-8">
      <PageHeader title="New setting" description="Create a JSON-backed site setting." />
      <Card>
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
            <Settings2 size={14} className="text-[color:var(--primary)]" />
          </div>
          <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">Setting details</h2>
        </div>
        <SiteSettingCreateForm />
      </Card>
    </div>
  );
}
