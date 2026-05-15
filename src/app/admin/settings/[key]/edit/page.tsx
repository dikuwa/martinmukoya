import { notFound } from "next/navigation";
import { SiteSettingForm } from "@/components/admin/simple-forms";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";

type PageProps = { params: Promise<{ key: string }> };

export default async function EditSettingPage({ params }: PageProps) {
  const { key } = await params;
  const setting = await db.siteSetting.findUnique({ where: { key } });
  if (!setting) notFound();
  return <div className="grid gap-8"><PageHeader title={`Edit ${setting.key}`} description="Update this site setting as JSON." /><SiteSettingForm setting={setting} /></div>;
}
