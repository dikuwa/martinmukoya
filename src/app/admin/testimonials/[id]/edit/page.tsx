import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { TestimonialForm } from "@/components/admin/simple-forms";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditTestimonialPage({ params }: PageProps) {
  const { id } = await params;
  const testimonial = await db.testimonial.findUnique({ where: { id } });
  if (!testimonial) notFound();
  return <div className="grid gap-8"><PageHeader title={`Edit ${testimonial.clientName}`} description="Update social proof details." actions={<DeleteButton endpoint={`/api/testimonials/${testimonial.id}`} redirectTo="/admin/testimonials" />} /><TestimonialForm initialData={testimonial} /></div>;
}
