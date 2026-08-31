import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { BlogPostForm } from "@/components/admin/simple-forms";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { Newspaper } from "lucide-react";
import { Card } from "@/components/ui/card";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditBlogPostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await db.blogPost.findUnique({ where: { id }, include: { sites: true } });
  if (!post) notFound();
  return (
    <div className="grid gap-8">
      <PageHeader
        title={`Edit ${post.title}`}
        description="Update content, SEO metadata, and publishing state."
        actions={<DeleteButton endpoint={`/api/blog-posts/${post.id}`} redirectTo="/admin/blog" />}
      />
      <Card padding="md" className="shadow-[var(--shadow-xs)]">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
            <Newspaper size={14} className="text-[color:var(--primary)]" />
          </div>
          <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">Post details</h2>
        </div>
        <BlogPostForm initialData={post} />
      </Card>
    </div>
  );
}
