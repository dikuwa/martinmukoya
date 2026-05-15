import { BlogPostForm } from "@/components/admin/simple-forms";
import { PageHeader } from "@/components/ui/page-header";

export default function NewBlogPostPage() {
  return <div className="grid gap-8"><PageHeader title="New blog post" description="Draft or publish a practical business systems article." /><BlogPostForm /></div>;
}
