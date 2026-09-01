import { db } from "@/lib/db";
import { BusinessTemplatesClient } from "./business-templates-client";

export default async function BusinessTemplatesPage() {
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