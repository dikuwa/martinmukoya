import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { DeleteButton } from "@/components/admin/delete-button";
import { FAQForm } from "@/components/admin/simple-forms";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { FileQuestion } from "lucide-react";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditFAQPage({ params }: PageProps) {
  const { id } = await params;
  const faq = await db.fAQ.findUnique({ where: { id }, include: { sites: true } });
  if (!faq) notFound();
  return (
    <div className="grid gap-8">
      <PageHeader
        title="Edit FAQ"
        description={faq.question}
        actions={<DeleteButton endpoint={`/api/faqs/${faq.id}`} redirectTo="/admin/faqs" />}
      />
      <Card>
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
            <FileQuestion size={14} className="text-[color:var(--primary)]" />
          </div>
          <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">FAQ details</h2>
        </div>
        <FAQForm initialData={faq} />
      </Card>
    </div>
  );
}
