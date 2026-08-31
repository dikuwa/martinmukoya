import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { SiteSettingForm } from "@/components/admin/simple-forms";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { Settings2 } from "lucide-react";
import { Card } from "@/components/ui/card";

type PageProps = { params: Promise<{ key: string }> };

export default async function EditSettingPage({ params }: PageProps) {
  const { key } = await params;
  const setting = await db.siteSetting.findFirst({ where: { OR: [{ id: key }, { key }] }, include: { site: true } });
  if (!setting) notFound();
  return (
    <div className="grid gap-8">
      <PageHeader
        title={`Edit ${setting.key}`}
        description="Update this site setting as JSON."
        actions={<DeleteButton endpoint={`/api/site-settings/${setting.id}`} redirectTo="/admin/settings" />}
      />
      <Card padding="md" className="shadow-[var(--shadow-xs)]">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
            <Settings2 size={14} className="text-[color:var(--primary)]" />
          </div>
          <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">Setting details</h2>
        </div>
        <SiteSettingForm setting={setting} />
      </Card>
    </div>
  );
}
