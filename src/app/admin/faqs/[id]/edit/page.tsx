import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { FAQForm } from "@/components/admin/simple-forms";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditFAQPage({ params }: PageProps) {
  const { id } = await params;
  const faq = await db.fAQ.findUnique({ where: { id }, include: { sites: true } });
  if (!faq) notFound();
  return <div className="grid gap-8"><PageHeader title="Edit FAQ" description={faq.question} actions={<DeleteButton endpoint={`/api/faqs/${faq.id}`} redirectTo="/admin/faqs" />} /><FAQForm initialData={faq} /></div>;
}
