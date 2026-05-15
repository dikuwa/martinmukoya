import { TestimonialForm } from "@/components/admin/simple-forms";
import { PageHeader } from "@/components/ui/page-header";

export default function NewTestimonialPage() {
  return <div className="grid gap-8"><PageHeader title="New testimonial" description="Add a quote for public social proof." /><TestimonialForm /></div>;
}
