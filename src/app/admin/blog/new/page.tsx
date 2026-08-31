import { Card } from "@/components/ui/card";
import { BlogPostForm } from "@/components/admin/simple-forms";
import { PageHeader } from "@/components/ui/page-header";
import { Newspaper } from "lucide-react";

export default function NewBlogPostPage() {
  return (
    <div className="grid gap-8">
      <PageHeader title="New blog post" description="Draft or publish a practical business systems article." />
      <Card>
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
            <Newspaper size={14} className="text-[color:var(--primary)]" />
          </div>
          <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">Post details</h2>
        </div>
        <BlogPostForm />
      </Card>
    </div>
  );
}
