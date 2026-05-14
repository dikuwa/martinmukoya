import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default function AdminBlogPage() {
  return (
    <div className="grid gap-8">
      <PageHeader title="Blog" description="Manage SEO posts, drafts, tags, categories, and cover images." />
      <EmptyState title="Blog management is ready for the editor" description="Phase 4 will add searchable tables and the rich/MDX editor." />
    </div>
  );
}
