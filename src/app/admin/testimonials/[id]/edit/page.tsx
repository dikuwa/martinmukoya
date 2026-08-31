import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { TestimonialForm } from "@/components/admin/simple-forms";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditTestimonialPage({ params }: PageProps) {
  const { id } = await params;
  const testimonial = await db.testimonial.findUnique({ where: { id }, include: { sites: true } });
  if (!testimonial) notFound();
  return (
    <div className="grid gap-8">
      <PageHeader
        title={`Edit ${testimonial.clientName}`}
        description="Update social proof details."
        actions={<DeleteButton endpoint={`/api/testimonials/${testimonial.id}`} redirectTo="/admin/testimonials" />}
      />
      <Card padding="md" className="shadow-[var(--shadow-xs)]">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
            <Star size={14} className="text-[color:var(--primary)]" />
          </div>
          <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">Testimonial details</h2>
        </div>
        <TestimonialForm initialData={testimonial} />
      </Card>
    </div>
  );
}
