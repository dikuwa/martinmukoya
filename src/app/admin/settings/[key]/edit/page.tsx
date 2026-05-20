import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { SiteSettingForm } from "@/components/admin/simple-forms";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";

type PageProps = { params: Promise<{ key: string }> };

export default async function EditSettingPage({ params }: PageProps) {
  const { key } = await params;
  const setting = await db.siteSetting.findFirst({ where: { OR: [{ id: key }, { key }] }, include: { site: true } });
  if (!setting) notFound();
  return <div className="grid gap-8"><PageHeader title={`Edit ${setting.key}`} description="Update this site setting as JSON." actions={<DeleteButton endpoint={`/api/site-settings/${setting.id}`} redirectTo="/admin/settings" />} /><SiteSettingForm setting={setting} /></div>;
}
