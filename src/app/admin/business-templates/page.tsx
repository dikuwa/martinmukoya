import { db } from "@/lib/db";
import { BusinessTemplatesClient } from "./business-templates-client";
import { requireAdmin } from "@/lib/auth-guard";
import { notFound } from "next/navigation";
import { BusinessDocumentType } from "@/generated/prisma/client";

type Props = { searchParams: Promise<{ search?: string; category?: string; status?: string }> };

export default async function BusinessTemplatesPage({ searchParams }: Props) {
  const { error } = await requireAdmin();
  if (error) notFound();
  const params = await searchParams;
  const search = params.search?.trim() || "";
  const category = Object.values(BusinessDocumentType).includes(params.category as BusinessDocumentType) ? params.category! : "";
  const status = params.status === "archived" ? false : params.status === "active" ? true : undefined;
  const templates = await db.businessDocumentTemplate.findMany({
    where: {
      ...(status === undefined ? {} : { active: status }),
      ...(category ? { documentCategory: category as BusinessDocumentType } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    },
    orderBy: [{ active: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      documentCategory: true,
      active: true,
      defaultTone: true,
      defaultStyle: true,
      defaultLength: true,
      defaultBodyMarkdown: true,
      updatedAt: true,
    },
  });

  return <BusinessTemplatesClient templates={JSON.parse(JSON.stringify(templates))} search={search} category={category} status={params.status || "all"} />;
}
