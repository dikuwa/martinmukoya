"use client";

import { Button } from "@/components/ui/button";
import type { BlogPost, FAQ, Lead, SiteSetting, Testimonial } from "@/generated/prisma/client";
import { blogPostSchema, faqSchema, leadUpdateSchema, siteSettingUpdateSchema, testimonialSchema } from "@/lib/validation/content";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const leadStatuses = ["NEW", "REVIEWING", "CONTACTED", "QUALIFIED", "WON", "LOST", "ARCHIVED"] as const;
const inputClass = "h-11 rounded-[12px] border border-[color:var(--border-subtle)] bg-white/[0.04] px-4 text-sm text-[color:var(--text-strong)] outline-none transition focus:border-[color:var(--accent)]";
const textareaClass = "min-h-28 rounded-[12px] border border-[color:var(--border-subtle)] bg-white/[0.04] px-4 py-3 text-sm text-[color:var(--text-strong)] outline-none transition focus:border-[color:var(--accent)]";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[color:var(--text-strong)]">
      {label}
      {children}
      {error ? <span className="text-xs text-[color:var(--destructive)]">{error}</span> : null}
    </label>
  );
}

function splitCsv(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function BlogPostForm({ initialData }: { initialData?: Partial<BlogPost> }) {
  const router = useRouter();
  const formSchema = blogPostSchema.extend({ tagsInput: z.string().optional() }).transform((values) => ({
    ...values,
    tags: splitCsv(values.tagsInput ?? "")
  }));
  const form = useForm<z.input<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      excerpt: initialData?.excerpt ?? "",
      content: initialData?.content ?? "",
      coverImage: initialData?.coverImage ?? "",
      category: initialData?.category ?? "",
      seoTitle: initialData?.seoTitle ?? "",
      seoDescription: initialData?.seoDescription ?? "",
      published: initialData?.published ?? true,
      tagsInput: initialData?.tags?.join(", ") ?? ""
    }
  });

  async function onSubmit(values: z.input<typeof formSchema>) {
    const payload = formSchema.parse(values);
    const response = await fetch(initialData?.id ? `/api/blog-posts/${initialData.id}` : "/api/blog-posts", {
      method: initialData?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) return toast.error("Post could not be saved");
    toast.success("Post saved");
    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Title" error={form.formState.errors.title?.message}><input {...form.register("title")} className={inputClass} /></Field>
        <Field label="Slug" error={form.formState.errors.slug?.message}><input {...form.register("slug")} className={inputClass} /></Field>
      </div>
      <Field label="Excerpt" error={form.formState.errors.excerpt?.message}><textarea {...form.register("excerpt")} className={textareaClass} rows={3} /></Field>
      <Field label="Content (Markdown supported)" error={form.formState.errors.content?.message}>
        <textarea {...form.register("content")} className="min-h-96 rounded-[12px] border border-[color:var(--border-subtle)] bg-white/[0.04] px-4 py-3 font-mono text-sm text-[color:var(--text-strong)] outline-none transition focus:border-[color:var(--accent)]" placeholder="Write your post content here. Use Markdown for formatting, code blocks, etc." />
      </Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Category"><input {...form.register("category")} className={inputClass} /></Field>
        <Field label="Tags, comma-separated"><input {...form.register("tagsInput")} className={inputClass} /></Field>
        <Field label="Cover image URL"><input {...form.register("coverImage")} className={inputClass} placeholder="https://example.com/image.jpg" /></Field>
        <Field label="SEO title" error={form.formState.errors.seoTitle?.message}><input {...form.register("seoTitle")} className={inputClass} /></Field>
      </div>
      <Field label="SEO description" error={form.formState.errors.seoDescription?.message}><textarea {...form.register("seoDescription")} className={textareaClass} rows={2} /></Field>
      <label className="flex items-center gap-2 text-sm font-bold text-[color:var(--text-strong)]"><input type="checkbox" {...form.register("published")} /> Published</label>
      <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving..." : "Save Post"}</Button>
    </form>
  );
}

export function TestimonialForm({ initialData }: { initialData?: Partial<Testimonial> }) {
  const router = useRouter();
  const form = useForm<z.input<typeof testimonialSchema>>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      clientName: initialData?.clientName ?? "",
      role: initialData?.role ?? "",
      company: initialData?.company ?? "",
      quote: initialData?.quote ?? "",
      image: initialData?.image ?? "",
      featured: initialData?.featured ?? false,
      published: initialData?.published ?? true,
      sortOrder: initialData?.sortOrder ?? 0
    }
  });

  async function onSubmit(values: z.input<typeof testimonialSchema>) {
    const payload = testimonialSchema.parse(values);
    const response = await fetch(initialData?.id ? `/api/testimonials/${initialData.id}` : "/api/testimonials", {
      method: initialData?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) return toast.error("Testimonial could not be saved");
    toast.success("Testimonial saved");
    router.push("/admin/testimonials");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Client name" error={form.formState.errors.clientName?.message}><input {...form.register("clientName")} className={inputClass} /></Field>
        <Field label="Role"><input {...form.register("role")} className={inputClass} /></Field>
        <Field label="Company"><input {...form.register("company")} className={inputClass} /></Field>
        <Field label="Image"><input {...form.register("image")} className={inputClass} /></Field>
      </div>
      <Field label="Quote" error={form.formState.errors.quote?.message}><textarea {...form.register("quote")} className={textareaClass} /></Field>
      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-sm font-bold text-[color:var(--text-strong)]"><input type="checkbox" {...form.register("published")} /> Published</label>
        <label className="flex items-center gap-2 text-sm font-bold text-[color:var(--text-strong)]"><input type="checkbox" {...form.register("featured")} /> Featured</label>
        <Field label="Sort order"><input type="number" {...form.register("sortOrder", { valueAsNumber: true })} className={inputClass} /></Field>
      </div>
      <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving..." : "Save Testimonial"}</Button>
    </form>
  );
}

export function FAQForm({ initialData }: { initialData?: Partial<FAQ> }) {
  const router = useRouter();
  const form = useForm<z.input<typeof faqSchema>>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: initialData?.question ?? "",
      answer: initialData?.answer ?? "",
      category: initialData?.category ?? "",
      published: initialData?.published ?? true,
      sortOrder: initialData?.sortOrder ?? 0
    }
  });

  async function onSubmit(values: z.input<typeof faqSchema>) {
    const payload = faqSchema.parse(values);
    const response = await fetch(initialData?.id ? `/api/faqs/${initialData.id}` : "/api/faqs", {
      method: initialData?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) return toast.error("FAQ could not be saved");
    toast.success("FAQ saved");
    router.push("/admin/faqs");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5">
      <Field label="Question" error={form.formState.errors.question?.message}><input {...form.register("question")} className={inputClass} /></Field>
      <Field label="Answer" error={form.formState.errors.answer?.message}><textarea {...form.register("answer")} className={textareaClass} /></Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Category"><input {...form.register("category")} className={inputClass} /></Field>
        <Field label="Sort order"><input type="number" {...form.register("sortOrder", { valueAsNumber: true })} className={inputClass} /></Field>
      </div>
      <label className="flex items-center gap-2 text-sm font-bold text-[color:var(--text-strong)]"><input type="checkbox" {...form.register("published")} /> Published</label>
      <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving..." : "Save FAQ"}</Button>
    </form>
  );
}

export function LeadStatusForm({ lead }: { lead: Lead }) {
  const router = useRouter();
  const form = useForm<z.input<typeof leadUpdateSchema>>({
    resolver: zodResolver(leadUpdateSchema),
    defaultValues: { status: lead.status, internalNotes: lead.internalNotes ?? "" }
  });

  async function onSubmit(values: z.input<typeof leadUpdateSchema>) {
    const payload = leadUpdateSchema.parse(values);
    const response = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) return toast.error("Lead could not be updated");
    toast.success("Lead updated");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5">
      <Field label="Status">
        <select {...form.register("status")} className={inputClass}>
          {leadStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </Field>
      <Field label="Internal notes"><textarea {...form.register("internalNotes")} className={textareaClass} /></Field>
      <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving..." : "Update Lead"}</Button>
    </form>
  );
}

export function SiteSettingForm({ setting }: { setting: SiteSetting }) {
  const router = useRouter();
  const form = useForm<{ value: string }>({
    resolver: zodResolver(z.object({ value: z.string().min(2) })),
    defaultValues: { value: JSON.stringify(setting.value, null, 2) }
  });

  async function onSubmit(values: { value: string }) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(values.value);
    } catch {
      toast.error("Setting value must be valid JSON");
      return;
    }

    const payload = siteSettingUpdateSchema.parse({ value: parsed });
    const response = await fetch(`/api/site-settings/${setting.key}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) return toast.error("Setting could not be saved");
    toast.success("Setting saved");
    router.push("/admin/settings");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5">
      <p className="font-display text-2xl font-black text-[color:var(--text-strong)]">{setting.key}</p>
      <Field label="JSON value" error={form.formState.errors.value?.message}>
        <textarea {...form.register("value")} className="min-h-80 rounded-[12px] border border-[color:var(--border-subtle)] bg-white/[0.04] px-4 py-3 font-mono text-sm text-[color:var(--text-strong)] outline-none transition focus:border-[color:var(--accent)]" />
      </Field>
      <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving..." : "Save Setting"}</Button>
    </form>
  );
}

export function MessageStatusPill({ status }: { status: string }) {
  return <span>{status}</span>;
}
