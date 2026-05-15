import { FAQForm } from "@/components/admin/simple-forms";
import { PageHeader } from "@/components/ui/page-header";

export default function NewFAQPage() {
  return <div className="grid gap-8"><PageHeader title="New FAQ" description="Add a clear answer for visitors." /><FAQForm /></div>;
}
