import { FAQForm } from "@/components/admin/simple-forms";
import { PageHeader } from "@/components/ui/page-header";
import { FileQuestion } from "lucide-react";

export default function NewFAQPage() {
  return (
    <div className="grid gap-8">
      <PageHeader title="New FAQ" description="Add a clear answer for visitors." />
      <div className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow-xs)]">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
            <FileQuestion size={14} className="text-[color:var(--primary)]" />
          </div>
          <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">FAQ details</h2>
        </div>
        <FAQForm />
      </div>
    </div>
  );
}
