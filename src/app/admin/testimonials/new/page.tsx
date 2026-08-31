import { Card } from "@/components/ui/card";
import { TestimonialForm } from "@/components/admin/simple-forms";
import { PageHeader } from "@/components/ui/page-header";
import { Star } from "lucide-react";

export default function NewTestimonialPage() {
  return (
    <div className="grid gap-8">
      <PageHeader title="New testimonial" description="Add a quote for public social proof." />
      <Card>
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
            <Star size={14} className="text-[color:var(--primary)]" />
          </div>
          <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">Testimonial details</h2>
        </div>
        <TestimonialForm />
      </Card>
    </div>
  );
}
