import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { BlogPostForm } from "@/components/admin/simple-forms";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditBlogPostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await db.blogPost.findUnique({ where: { id }, include: { sites: true } });
  if (!post) notFound();
  return <div className="grid gap-8"><PageHeader title={`Edit ${post.title}`} description="Update content, SEO metadata, and publishing state." actions={<DeleteButton endpoint={`/api/blog-posts/${post.id}`} redirectTo="/admin/blog" />} /><BlogPostForm initialData={post} /></div>;
}
