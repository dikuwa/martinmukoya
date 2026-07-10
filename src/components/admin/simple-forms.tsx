"use client";

import { BlogEditor } from "@/components/admin/blog-editor";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import type { BlogPost, ChatSession, ContactMessage, FAQ, Lead, SiteSetting, Testimonial } from "@/generated/prisma/client";
import { blogPostSchema, contactMessageUpdateSchema, faqSchema, leadUpdateSchema, siteSettingSchema, siteSettingUpdateSchema, testimonialSchema } from "@/lib/validation/content";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Children, isValidElement, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const leadStatuses = ["NEW", "REVIEWING", "CONTACTED", "QUALIFIED", "WON", "LOST", "ARCHIVED"] as const;
const messageStatuses = ["NEW", "READ", "REPLIED", "ARCHIVED"] as const;
const siteOptions = [
  { label: "Martin Mukoya", value: "martin-mukoya" },
  { label: "FlexTech Media", value: "flextech-media" }
] as const;
const formShellClass = "grid gap-6 rounded-[var(--radius)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-xs)]";
const inputClass = "h-11 rounded-[calc(var(--radius)*0.75)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-4 text-sm text-[color:var(--text-strong)] outline-none transition placeholder:text-[color:var(--text-faint)] hover:bg-[color:var(--surface-soft)] hover:border-[color:var(--primary)]/30 focus:border-[color:var(--primary)] focus:bg-[color:var(--surface-soft)] focus:shadow-[0_0_0_3px_rgba(107,38,217,0.1)]";
const selectClass = `${inputClass} bg-none appearance-none pr-10`;
const textareaClass = "min-h-28 rounded-[calc(var(--radius)*0.75)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-4 py-3 text-sm text-[color:var(--text-strong)] outline-none transition placeholder:text-[color:var(--text-faint)] hover:bg-[color:var(--surface-soft)] hover:border-[color:var(--primary)]/30 focus:border-[color:var(--primary)] focus:bg-[color:var(--surface-soft)] focus:shadow-[0_0_0_3px_rgba(107,38,217,0.1)]";
const monoTextareaClass = `${textareaClass} font-mono`;
const checkboxClass = "h-4 w-4 accent-[color:var(--primary)] rounded-[4px] border-[color:var(--border-subtle)] focus:ring-2 focus:ring-[color:var(--primary)]/30";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[color:var(--text-strong)]">
      {label}
      {children}
      {error ? <span className="text-xs text-[color:var(--destructive)]">{error}</span> : null}
    </label>
  );
}

/**
 * Fully custom select dropdown. Works with react-hook-form via a hidden input,
 * so you can use it the same way as `<AdminSelect {...register("field")}>`.
 *
 * Children should be `<option value="...">Label</option>` elements just like
 * a native select, but they are rendered as styled dropdown items.
 */
function AdminSelect({ children, className = "", value, onChange, onBlur, name, disabled }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value?.toString() ?? "");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Parse children to get options list
  const options = useMemo(() => {
    const opts: Array<{ value: string; label: string }> = [];
    Children.forEach(children, (child) => {
      if (isValidElement<{ value?: string | number; children?: React.ReactNode }>(child) && child.props.value !== undefined) {
        opts.push({ value: String(child.props.value), label: String(child.props.children ?? "") });
      }
    });
    return opts;
  }, [children]);

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === selectedValue)?.label ?? "Select...",
    [options, selectedValue]
  );

  // Sync external value changes
  useEffect(() => {
    setSelectedValue(value?.toString() ?? "");
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function choose(nextValue: string) {
    setSelectedValue(nextValue);
    setOpen(false);
    // Synthesize a change event for react-hook-form
    const syntheticEvent = {
      target: { value: nextValue, name: name ?? "" }
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange?.(syntheticEvent);
    onBlur?.(syntheticEvent as unknown as React.FocusEvent<HTMLSelectElement>);
  }

  return (
    <div ref={wrapperRef} className="relative">
      {/* Hidden native select for form integration */}
      <select name={name} value={selectedValue} onChange={onChange} onBlur={onBlur} className="sr-only" tabIndex={-1} aria-hidden="true">
        {children}
      </select>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`${selectClass} flex w-full items-center justify-between gap-2 ${className || ""}`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-[color:var(--text-faint)] transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 grid w-full min-w-48 overflow-hidden rounded-[12px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-1 shadow-[var(--shadow-sm)]">
          {options.map((option) => {
            const active = option.value === selectedValue;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(option.value)}
                className="flex items-center gap-2 rounded-[9px] px-3 py-2.5 text-left text-sm font-semibold text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)] aria-selected:bg-[color:var(--surface-soft)] aria-selected:text-[color:var(--text-strong)]"
              >
                <span className="w-4 text-[color:var(--primary)] shrink-0">
                  {active ? "✓" : ""}
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminOption({ children, ...props }: React.OptionHTMLAttributes<HTMLOptionElement>) {
  // Now a simple pass-through, kept for backward compatibility with existing usage
  return <option {...props}>{children}</option>;
}

function splitCsv(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function initialSiteSlugs(initialData?: { sites?: Array<{ slug: string }> }) {
  const slugs = initialData?.sites?.map((site) => site.slug).filter(Boolean) ?? [];
  return slugs.length > 0 ? slugs : ["martin-mukoya"];
}

function SiteCheckboxes({ register }: { register: (name: "siteSlugs") => UseFormRegisterReturn<"siteSlugs"> }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-bold text-[color:var(--text-strong)]">Show on sites</legend>
      <div className="flex flex-wrap gap-5">
        {siteOptions.map((site) => (
          <label key={site.value} className="flex items-center gap-2 text-sm font-bold text-[color:var(--text-strong)]">
            <input type="checkbox" value={site.value} {...register("siteSlugs")} className={checkboxClass} />
            {site.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SettingsAssetUpload() {
  const [assetUrl, setAssetUrl] = useState("");

  return (
    <div className="rounded-[16px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-4">
      <ImageUploadField
        label="Upload setting asset"
        folder="settings"
        value={assetUrl}
        onChange={setAssetUrl}
        placeholder="Upload or paste an asset URL for the JSON value"
        cropAspect={false}
      />
      <p className="mt-2 text-xs leading-5 text-[color:var(--text-muted)]">
        Add the generated URL to the JSON value where the setting needs an image, logo, or background asset.
      </p>
    </div>
  );
}

export function BlogPostForm({ initialData }: { initialData?: Partial<BlogPost> & { sites?: Array<{ slug: string }> } }) {
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
      siteSlugs: initialSiteSlugs(initialData),
      tagsInput: initialData?.tags?.join(", ") ?? ""
    }
  });
  const title = useWatch({ control: form.control, name: "title" });
  const coverImage = useWatch({ control: form.control, name: "coverImage" });
  const content = useWatch({ control: form.control, name: "content" });

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
    <form onSubmit={form.handleSubmit(onSubmit)} className={formShellClass}>
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-start">
        <Field label="Title" error={form.formState.errors.title?.message}><input {...form.register("title")} className={inputClass} /></Field>
        <Field label="Slug" error={form.formState.errors.slug?.message}><input {...form.register("slug")} className={inputClass} placeholder="better-lead-capture" /></Field>
        <Button
          type="button"
          variant="secondary"
          className="md:mt-7"
          onClick={() => form.setValue("slug", slugify(title ?? ""), { shouldDirty: true, shouldValidate: true })}
          disabled={!title}
        >
          Generate
        </Button>
        <p className="text-xs leading-5 text-[color:var(--text-muted)] md:col-start-2">
          Used in the public blog URL. Keep it stable once the post is shared.
        </p>
      </div>
      <Field label="Excerpt" error={form.formState.errors.excerpt?.message}><textarea {...form.register("excerpt")} className={textareaClass} rows={3} /></Field>
      <Field label="Content (Markdown)" error={form.formState.errors.content?.message}>
        <BlogEditor
          value={content ?? ""}
          onChange={(value) => form.setValue("content", value, { shouldDirty: true })}
        />
      </Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Category"><input {...form.register("category")} className={inputClass} /></Field>
        <Field label="Tags, comma-separated"><input {...form.register("tagsInput")} className={inputClass} /></Field>
        <ImageUploadField
          label="Cover image"
          folder="blog"
          value={coverImage ?? ""}
          onChange={(value) => form.setValue("coverImage", value, { shouldDirty: true, shouldValidate: true })}
          placeholder="https://example.com/image.jpg"
          cropAspect={false}
        />
        <Field label="SEO title" error={form.formState.errors.seoTitle?.message}><input {...form.register("seoTitle")} className={inputClass} /></Field>
      </div>
      <Field label="SEO description" error={form.formState.errors.seoDescription?.message}><textarea {...form.register("seoDescription")} className={textareaClass} rows={2} /></Field>
      <SiteCheckboxes register={form.register} />
      <label className="flex items-center gap-2 text-sm font-bold text-[color:var(--text-strong)]"><input type="checkbox" {...form.register("published")} className={checkboxClass} /> Published</label>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving..." : "Save Post"}</Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/blog")}>Cancel</Button>
      </div>
    </form>
  );
}

export function TestimonialForm({ initialData }: { initialData?: Partial<Testimonial> & { sites?: Array<{ slug: string }> } }) {
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
      sortOrder: initialData?.sortOrder ?? 0,
      siteSlugs: initialSiteSlugs(initialData)
    }
  });
  const image = useWatch({ control: form.control, name: "image" });

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
    <form onSubmit={form.handleSubmit(onSubmit)} className={formShellClass}>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Client name" error={form.formState.errors.clientName?.message}><input {...form.register("clientName")} className={inputClass} /></Field>
        <Field label="Role"><input {...form.register("role")} className={inputClass} /></Field>
        <Field label="Company"><input {...form.register("company")} className={inputClass} /></Field>
        <ImageUploadField
          label="Image"
          folder="testimonials"
          value={image ?? ""}
          onChange={(value) => form.setValue("image", value, { shouldDirty: true, shouldValidate: true })}
          cropAspect={1}
          cropShape="round"
        />
      </div>
      <Field label="Quote" error={form.formState.errors.quote?.message}><textarea {...form.register("quote")} className={textareaClass} /></Field>
      <SiteCheckboxes register={form.register} />
      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-sm font-bold text-[color:var(--text-strong)]"><input type="checkbox" {...form.register("published")} className={checkboxClass} /> Published</label>
        <label className="flex items-center gap-2 text-sm font-bold text-[color:var(--text-strong)]"><input type="checkbox" {...form.register("featured")} className={checkboxClass} /> Featured</label>
        <Field label="Sort order"><input type="number" {...form.register("sortOrder", { valueAsNumber: true })} className={inputClass} /></Field>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving..." : "Save Testimonial"}</Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/testimonials")}>Cancel</Button>
      </div>
    </form>
  );
}

export function FAQForm({ initialData }: { initialData?: Partial<FAQ> & { sites?: Array<{ slug: string }> } }) {
  const router = useRouter();
  const form = useForm<z.input<typeof faqSchema>>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: initialData?.question ?? "",
      answer: initialData?.answer ?? "",
      category: initialData?.category ?? "",
      published: initialData?.published ?? true,
      sortOrder: initialData?.sortOrder ?? 0,
      siteSlugs: initialSiteSlugs(initialData)
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
    <form onSubmit={form.handleSubmit(onSubmit)} className={formShellClass}>
      <Field label="Question" error={form.formState.errors.question?.message}><input {...form.register("question")} className={inputClass} /></Field>
      <Field label="Answer" error={form.formState.errors.answer?.message}><textarea {...form.register("answer")} className={textareaClass} /></Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Category"><input {...form.register("category")} className={inputClass} /></Field>
        <Field label="Sort order"><input type="number" {...form.register("sortOrder", { valueAsNumber: true })} className={inputClass} /></Field>
      </div>
      <SiteCheckboxes register={form.register} />
      <label className="flex items-center gap-2 text-sm font-bold text-[color:var(--text-strong)]"><input type="checkbox" {...form.register("published")} className={checkboxClass} /> Published</label>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving..." : "Save FAQ"}</Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/faqs")}>Cancel</Button>
      </div>
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
    <form onSubmit={form.handleSubmit(onSubmit)} className={formShellClass}>
      <Field label="Status">
        <AdminSelect {...form.register("status")}>
          {leadStatuses.map((status) => <AdminOption key={status} value={status}>{status}</AdminOption>)}
        </AdminSelect>
      </Field>
      <Field label="Internal notes"><textarea {...form.register("internalNotes")} className={textareaClass} /></Field>
      <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving..." : "Update Lead"}</Button>
    </form>
  );
}

export function ContactMessageStatusForm({ message }: { message: ContactMessage }) {
  const router = useRouter();
  const form = useForm<z.input<typeof contactMessageUpdateSchema>>({
    resolver: zodResolver(contactMessageUpdateSchema),
    defaultValues: { status: message.status, internalNotes: (message as ContactMessage & { internalNotes?: string | null }).internalNotes ?? "" }
  });

  async function onSubmit(values: z.input<typeof contactMessageUpdateSchema>) {
    const payload = contactMessageUpdateSchema.parse(values);
    const response = await fetch(`/api/contact-messages/${message.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) return toast.error("Message could not be updated");
    toast.success("Message updated");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={formShellClass}>
      <Field label="Status">
        <AdminSelect {...form.register("status")}>
          {messageStatuses.map((status) => <AdminOption key={status} value={status}>{status}</AdminOption>)}
        </AdminSelect>
      </Field>
      <Field label="Internal notes">
        <textarea {...form.register("internalNotes")} className={textareaClass} placeholder="Private follow-up notes, actions taken..." />
      </Field>
      <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving..." : "Update Message"}</Button>
    </form>
  );
}

export function ChatSessionStatusForm({ session }: { session: ChatSession }) {
  const router = useRouter();
  const form = useForm<{ summary?: string }>({
    resolver: zodResolver(z.object({ summary: z.string().trim().optional() })),
    defaultValues: { summary: session.summary ?? "" }
  });

  async function onSubmit(values: { summary?: string }) {
    const response = await fetch(`/api/chat-sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    if (!response.ok) return toast.error("Chat session could not be updated");
    toast.success("Chat session updated");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={formShellClass}>
      <Field label="Summary">
        <textarea {...form.register("summary")} className={textareaClass} placeholder="Short note for follow-up context" />
      </Field>
      <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving..." : "Update Session"}</Button>
    </form>
  );
}

export function SiteSettingForm({ setting }: { setting: SiteSetting & { site?: { name: string } | null } }) {
  const router = useRouter();
  const isAvailability = setting.key === "availability";
  const initialAvailability = typeof setting.value === "object" && setting.value !== null && !Array.isArray(setting.value)
    ? setting.value as { text?: unknown; active?: unknown }
    : null;
  const [availabilityActive, setAvailabilityActive] = useState(initialAvailability?.active !== false);
  const form = useForm<{ value: string }>({
    resolver: zodResolver(z.object({ value: z.string().min(2) })),
    defaultValues: {
      value: JSON.stringify(
        isAvailability && initialAvailability && typeof initialAvailability.text === "string"
          ? initialAvailability.text
          : setting.value,
        null,
        2
      )
    }
  });

  async function onSubmit(values: { value: string }) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(values.value);
    } catch {
      toast.error("Setting value must be valid JSON");
      return;
    }

    if (isAvailability && (typeof parsed !== "string" || !parsed.trim())) {
      toast.error("Availability JSON value must be a non-empty string");
      return;
    }

    const payload = siteSettingUpdateSchema.parse({
      value: isAvailability ? { text: parsed, active: availabilityActive } : parsed
    });
    const response = await fetch(`/api/site-settings/${setting.id}`, {
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
    <form onSubmit={form.handleSubmit(onSubmit)} className={formShellClass}>
      <p className="font-display text-2xl font-black text-[color:var(--text-strong)]">{setting.key}</p>
      <p className="text-sm font-semibold text-[color:var(--text-muted)]">Site: {setting.site?.name ?? "Global"}</p>
      {isAvailability ? (
        <div className="flex flex-col gap-4 rounded-[16px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="relative inline-flex h-3 w-3" aria-hidden="true">
              {availabilityActive ? <span className="absolute inset-0 animate-ping rounded-full bg-[#22C55E]/40" /> : null}
              <span className={`relative inline-block h-3 w-3 rounded-full ${availabilityActive ? "bg-[#22C55E]" : "bg-[color:var(--text-faint)]"}`} />
            </span>
            <div>
              <p className="text-sm font-bold text-[color:var(--text-strong)]">Availability indicator</p>
              <p className="text-xs leading-5 text-[color:var(--text-muted)]">
                {availabilityActive ? "Visible with an animated status ripple." : "Visible in grey without animation."}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={availabilityActive}
            onClick={() => setAvailabilityActive((active) => !active)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/40 ${availabilityActive ? "bg-[color:var(--primary)]" : "bg-[color:var(--text-faint)]/50"}`}
          >
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${availabilityActive ? "translate-x-6" : "translate-x-1"}`} />
            <span className="sr-only">Toggle availability animation</span>
          </button>
        </div>
      ) : <SettingsAssetUpload />}
      <Field label="JSON value" error={form.formState.errors.value?.message}>
        <textarea {...form.register("value")} className={`${monoTextareaClass} min-h-80`} />
      </Field>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving..." : "Save Setting"}</Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/settings")}>Cancel</Button>
      </div>
    </form>
  );
}

export function SiteSettingCreateForm() {
  const router = useRouter();
  const form = useForm<{ key: string; siteSlug: string; value: string }>({
    resolver: zodResolver(z.object({ key: z.string().trim().min(2), siteSlug: z.string().trim().min(1), value: z.string().min(2) })),
    defaultValues: { key: "", siteSlug: "martin-mukoya", value: "{\n  \n}" }
  });

  async function onSubmit(values: { key: string; siteSlug: string; value: string }) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(values.value);
    } catch {
      toast.error("Setting value must be valid JSON");
      return;
    }

    const payload = siteSettingSchema.parse({ key: values.key, siteSlug: values.siteSlug, value: parsed });
    const response = await fetch("/api/site-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) return toast.error("Setting could not be created");
    toast.success("Setting created");
    router.push("/admin/settings");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={formShellClass}>
      <Field label="Setting key" error={form.formState.errors.key?.message}>
        <input {...form.register("key")} className={inputClass} placeholder="homepage.hero" />
      </Field>
      <Field label="Site" error={form.formState.errors.siteSlug?.message}>
        <AdminSelect {...form.register("siteSlug")}>
          {siteOptions.map((site) => (
            <AdminOption key={site.value} value={site.value}>{site.label}</AdminOption>
          ))}
        </AdminSelect>
      </Field>
      <SettingsAssetUpload />
      <Field label="JSON value" error={form.formState.errors.value?.message}>
        <textarea {...form.register("value")} className={`${monoTextareaClass} min-h-80`} />
      </Field>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Creating..." : "Create Setting"}</Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/settings")}>Cancel</Button>
      </div>
    </form>
  );
}

export function MessageStatusPill({ status }: { status: string }) {
  return <span>{status}</span>;
}
