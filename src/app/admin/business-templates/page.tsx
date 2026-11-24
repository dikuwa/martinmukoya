import { db } from "@/lib/db";
import { BusinessTemplatesClient } from "./business-templates-client";
import { requireAdmin } from "@/lib/auth-guard";
import { notFound } from "next/navigation";

export default async function BusinessTemplatesPage() {
  const { error } = await requireAdmin();
  if (error) notFound();
  const templates = await db.businessDocumentTemplate.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      documentCategory: true,
      active: true,
      defaultTone: true,
      defaultStyle: true,
      defaultLength: true,
    },
  });

  return <BusinessTemplatesClient templates={templates} />;
}
