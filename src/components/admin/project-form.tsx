"use client";

import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import type { Project } from "@/generated/prisma/client";
import { projectSchema } from "@/lib/validation/content";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

type ProjectFormValues = z.infer<typeof projectSchema>;
const siteOptions = [
  { label: "Martin Mukoya", value: "martin-mukoya" },
  { label: "FlexTech Media", value: "flextech-media" }
] as const;
const projectFormSchema = projectSchema.omit({ gallery: true, techStack: true, services: true }).extend({
  galleryInput: z.string().optional(),
  techStackInput: z.string().optional(),
  servicesInput: z.string().optional()
}).transform((values) => ({
  ...values,
  gallery: splitCsv(values.galleryInput ?? ""),
  techStack: splitCsv(values.techStackInput ?? ""),
  services: splitCsv(values.servicesInput ?? "")
}));

function csv(value?: string[]) {
  return value?.join(", ") ?? "";
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

export function ProjectForm({ initialData }: { initialData?: Partial<Project> & { sites?: Array<{ slug: string }> } }) {
  const router = useRouter();
  const [galleryUploadPreview, setGalleryUploadPreview] = useState("");
  const form = useForm<z.input<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      summary: initialData?.summary ?? "",
      description: initialData?.description ?? "",
      problem: initialData?.problem ?? "",
      solution: initialData?.solution ?? "",
      outcome: initialData?.outcome ?? "",
      clientType: initialData?.clientType ?? "",
      industry: initialData?.industry ?? "",
      coverImage: initialData?.coverImage ?? "",
      liveUrl: initialData?.liveUrl ?? "",
      githubUrl: initialData?.githubUrl ?? "",
      caseStudyContent: initialData?.caseStudyContent ?? "",
      featured: initialData?.featured ?? false,
      published: initialData?.published ?? true,
      sortOrder: initialData?.sortOrder ?? 0,
      siteSlugs: initialSiteSlugs(initialData),
      galleryInput: csv(initialData?.gallery),
      techStackInput: csv(initialData?.techStack),
      servicesInput: csv(initialData?.services)
    }
  });
  const title = useWatch({ control: form.control, name: "title" });
  const coverImage = useWatch({ control: form.control, name: "coverImage" });
  const galleryInput = useWatch({ control: form.control, name: "galleryInput" });

  function appendGalleryImage(value: string) {
    setGalleryUploadPreview(value);
    if (!value) return;

    const existing = splitCsv(galleryInput ?? "");
    if (existing.includes(value)) return;

    form.setValue("galleryInput", [...existing, value].join(", "), {
      shouldDirty: true,
      shouldValidate: true
    });
  }

  async function onSubmit(values: z.input<typeof projectFormSchema>) {
    const payload = projectFormSchema.parse(values) as ProjectFormValues;
    const response = await fetch(initialData?.id ? `/api/projects/${initialData.id}` : "/api/projects", {
      method: initialData?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      toast.error("Project could not be saved");
      return;
    }

    toast.success("Project saved");
    router.push("/admin/projects");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 rounded-[var(--radius)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-xs)]">
      <Field label="Title" error={form.formState.errors.title?.message}>
        <input {...form.register("title")} className={inputClass} />
      </Field>
      <div className="grid gap-2">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1">
            <Field label="Slug" error={form.formState.errors.slug?.message}>
              <input {...form.register("slug")} className={inputClass} placeholder="clinic-booking-system" />
            </Field>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => form.setValue("slug", slugify(title ?? ""), { shouldDirty: true, shouldValidate: true })}
            disabled={!title}
          >
            Generate
          </Button>
        </div>
        <p className="text-xs leading-5 text-[color:var(--text-muted)]">Used in the public case study URL. Keep it short, lowercase, and stable after publishing.</p>
      </div>
      <Field label="Summary" error={form.formState.errors.summary?.message}>
        <textarea {...form.register("summary")} className={textareaClass} />
      </Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Industry">
          <input {...form.register("industry")} className={inputClass} />
        </Field>
        <Field label="Client type">
          <input {...form.register("clientType")} className={inputClass} />
        </Field>
      </div>
      <Field label="Description" error={form.formState.errors.description?.message}>
        <textarea {...form.register("description")} className={textareaClass} />
      </Field>
      <Field label="Problem" error={form.formState.errors.problem?.message}>
        <textarea {...form.register("problem")} className={textareaClass} />
      </Field>
      <Field label="Solution" error={form.formState.errors.solution?.message}>
        <textarea {...form.register("solution")} className={textareaClass} />
      </Field>
      <Field label="Outcome">
        <textarea {...form.register("outcome")} className={textareaClass} />
      </Field>
      <Field label="Case study content" error={form.formState.errors.caseStudyContent?.message}>
        <textarea {...form.register("caseStudyContent")} className={textareaClass} />
      </Field>
      <section className="grid gap-4 rounded-[calc(var(--radius)*0.85)] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)]/40 p-4">
        <div>
          <h2 className="font-display text-lg font-black text-[color:var(--text-strong)]">Project media</h2>
          <p className="mt-1 text-xs leading-5 text-[color:var(--text-muted)]">
            Add a compact cover preview and optional gallery images for the public case study.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 md:items-start">
          <ImageUploadField
            label="Cover image"
            folder="projects"
            value={coverImage ?? ""}
            onChange={(value) => form.setValue("coverImage", value, { shouldDirty: true, shouldValidate: true })}
          />
          <ImageUploadField
            label="Add gallery image"
            folder="projects/gallery"
            value={galleryUploadPreview}
            onChange={appendGalleryImage}
            placeholder="Upload or paste a gallery image URL"
          />
          <div className="md:col-span-2">
            <Field label="Gallery images, comma-separated">
              <input {...form.register("galleryInput")} className={inputClass} />
            </Field>
          </div>
        </div>
      </section>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Tech stack, comma-separated">
          <input {...form.register("techStackInput")} className={inputClass} />
        </Field>
        <Field label="Services, comma-separated">
          <input {...form.register("servicesInput")} className={inputClass} />
        </Field>
        <Field label="Live URL">
          <input {...form.register("liveUrl")} className={inputClass} />
        </Field>
        <Field label="GitHub URL">
          <input {...form.register("githubUrl")} className={inputClass} />
        </Field>
      </div>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-bold text-[color:var(--text-strong)]">Show on sites</legend>
        <div className="flex flex-wrap gap-5">
          {siteOptions.map((site) => (
            <label key={site.value} className="flex items-center gap-2 text-sm font-bold text-[color:var(--text-strong)]">
              <input type="checkbox" value={site.value} {...form.register("siteSlugs")} className="h-4 w-4 rounded border-[color:var(--border-subtle)] bg-[color:var(--surface)] accent-[color:var(--primary)]" />
              {site.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-sm font-bold text-[color:var(--text-strong)]">
          <input type="checkbox" {...form.register("published")} className="h-4 w-4 rounded border-[color:var(--border-subtle)] bg-[color:var(--surface)] accent-[color:var(--primary)]" /> Published
        </label>
        <label className="flex items-center gap-2 text-sm font-bold text-[color:var(--text-strong)]">
          <input type="checkbox" {...form.register("featured")} className="h-4 w-4 rounded border-[color:var(--border-subtle)] bg-[color:var(--surface)] accent-[color:var(--primary)]" /> Featured
        </label>
        <Field label="Sort order">
          <input type="number" {...form.register("sortOrder", { valueAsNumber: true })} className={inputClass} />
        </Field>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save Project"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/projects")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

const inputClass = "h-11 rounded-[calc(var(--radius)*0.75)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-4 text-sm text-[color:var(--text-strong)] outline-none transition placeholder:text-[color:var(--text-faint)] hover:bg-[color:var(--surface-soft)] hover:border-[color:var(--primary)]/30 focus:border-[color:var(--primary)] focus:bg-[color:var(--surface-soft)] focus:shadow-[0_0_0_3px_rgba(107,38,217,0.1)]";
const textareaClass = "min-h-28 rounded-[calc(var(--radius)*0.75)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-4 py-3 text-sm text-[color:var(--text-strong)] outline-none transition placeholder:text-[color:var(--text-faint)] hover:bg-[color:var(--surface-soft)] hover:border-[color:var(--primary)]/30 focus:border-[color:var(--primary)] focus:bg-[color:var(--surface-soft)] focus:shadow-[0_0_0_3px_rgba(107,38,217,0.1)]";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[color:var(--text-strong)]">
      {label}
      {children}
      {error ? <span className="text-xs text-[color:var(--destructive)]">{error}</span> : null}
    </label>
  );
}
