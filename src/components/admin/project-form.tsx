"use client";

import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { DashboardCheckbox } from "@/components/ui/dashboard-checkbox";
import { DashboardSelect } from "@/components/ui/dashboard-select";
import type { Project } from "@/generated/prisma/client";
import { projectSchema } from "@/lib/validation/content";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { projectIconOptions } from "@/lib/project-icons";

type ProjectFormValues = z.infer<typeof projectSchema>;
const siteOptions = [
  { label: "Martin Mukoya", value: "martin-mukoya" },
  { label: "FlexTech Media", value: "flextech-media" }
] as const;
const projectFormSchema = projectSchema.omit({ gallery: true, techStack: true, services: true, deliverables: true }).extend({
  galleryInput: z.string().optional(),
  techStackInput: z.string().optional(),
  servicesInput: z.string().optional(),
  deliverablesInput: z.string().optional()
}).transform((values) => ({
  ...values,
  gallery: splitCsv(values.galleryInput ?? ""),
  techStack: splitCsv(values.techStackInput ?? ""),
  services: splitCsv(values.servicesInput ?? ""),
  deliverables: splitCsv(values.deliverablesInput ?? "")
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

function jsonArray<T>(value: unknown): T[] { return Array.isArray(value) ? value as T[] : []; }

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
      eyebrow: initialData?.eyebrow ?? "",
      timeline: initialData?.timeline ?? "",
      role: initialData?.role ?? "",
      stackSummary: initialData?.stackSummary ?? "",
      benefits: jsonArray(initialData?.benefits),
      capabilities: jsonArray(initialData?.capabilities),
      coverImage: initialData?.coverImage ?? "",
      coverImageAlt: initialData?.coverImageAlt ?? "",
      galleryImages: jsonArray(initialData?.galleryImages),
      liveUrl: initialData?.liveUrl ?? "",
      githubUrl: initialData?.githubUrl ?? "",
      ctaEyebrow: initialData?.ctaEyebrow ?? "",
      ctaTitle: initialData?.ctaTitle ?? "",
      ctaDescription: initialData?.ctaDescription ?? "",
      ctaPrimaryLabel: initialData?.ctaPrimaryLabel ?? "",
      ctaPrimaryUrl: initialData?.ctaPrimaryUrl ?? "",
      ctaSecondaryLabel: initialData?.ctaSecondaryLabel ?? "",
      ctaSecondaryUrl: initialData?.ctaSecondaryUrl ?? "",
      caseStudyContent: initialData?.caseStudyContent ?? "",
      featured: initialData?.featured ?? false,
      published: initialData?.published ?? true,
      sortOrder: initialData?.sortOrder ?? 0,
      siteSlugs: initialSiteSlugs(initialData),
      galleryInput: csv(initialData?.gallery),
      techStackInput: csv(initialData?.techStack),
      servicesInput: csv(initialData?.services),
      deliverablesInput: csv(initialData?.deliverables)
    }
  });
  const benefits = useFieldArray({ control: form.control, name: "benefits" });
  const capabilities = useFieldArray({ control: form.control, name: "capabilities" });
  const galleryImages = useFieldArray({ control: form.control, name: "galleryImages" });
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
    galleryImages.append({ url: value, alt: "", caption: "", sortOrder: galleryImages.fields.length });
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 rounded-[var(--radius)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-4 shadow-[var(--shadow-xs)] sm:p-6">
      <FormSection title="Basic project details" description="Identity, ownership, visibility, and publication settings.">
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
      </FormSection>
      <FormSection title="Project overview" description="The compact facts shown immediately below the hero.">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Eyebrow label"><input {...form.register("eyebrow")} className={inputClass} placeholder="Featured project" /></Field>
          <Field label="Timeline"><input {...form.register("timeline")} className={inputClass} placeholder="4–6 weeks" /></Field>
          <Field label="Role"><input {...form.register("role")} className={inputClass} placeholder="Full-stack developer" /></Field>
          <Field label="Deliverables, comma-separated"><input {...form.register("deliverablesInput")} className={inputClass} placeholder="Web app, admin panel" /></Field>
        </div>
      <Field label="Description" error={form.formState.errors.description?.message}>
        <textarea {...form.register("description")} className={textareaClass} />
      </Field>
      </FormSection>
      <FormSection title="Case-study story" description="Problem, response, result, and the detailed narrative.">
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
      </FormSection>
      <RepeatableItems title="Benefits / impact cards" fields={benefits.fields} register={form.register} append={() => benefits.append({ title: "", description: "", iconKey: "auto", sortOrder: benefits.fields.length })} remove={benefits.remove} move={benefits.move} name="benefits" />
      <FormSection title="Features and stack" description="Technology labels and a short implementation summary.">
        <Field label="Stack summary"><textarea {...form.register("stackSummary")} className={textareaClass} /></Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Tech stack, comma-separated"><input {...form.register("techStackInput")} className={inputClass} /></Field>
          <Field label="Services, comma-separated"><input {...form.register("servicesInput")} className={inputClass} /></Field>
        </div>
      </FormSection>
      <RepeatableItems title="What was built" fields={capabilities.fields} register={form.register} append={() => capabilities.append({ title: "", description: "", iconKey: "auto", sortOrder: capabilities.fields.length })} remove={capabilities.remove} move={capabilities.move} name="capabilities" />
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
            cropAspect={false}
          />
          <Field label="Cover image alt text"><input {...form.register("coverImageAlt")} className={inputClass} placeholder="Describe the project preview" /></Field>
          <ImageUploadField
            label="Add gallery image"
            folder="projects/gallery"
            value={galleryUploadPreview}
            onChange={appendGalleryImage}
            placeholder="Upload or paste a gallery image URL"
            cropAspect={false}
          />
          <div className="md:col-span-2">
            <Field label="Gallery images, comma-separated">
              <input {...form.register("galleryInput")} className={inputClass} />
            </Field>
          </div>
          <div className="grid gap-3 md:col-span-2">
            {galleryImages.fields.map((field, index) => <div key={field.id} className="grid gap-3 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-3 md:grid-cols-[1.3fr_1fr_1fr_auto]">
              <Field label="Image URL"><input {...form.register(`galleryImages.${index}.url`)} className={inputClass} /></Field>
              <Field label="Alt text"><input {...form.register(`galleryImages.${index}.alt`)} className={inputClass} /></Field>
              <Field label="Caption"><input {...form.register(`galleryImages.${index}.caption`)} className={inputClass} /></Field>
              <ReorderButtons index={index} count={galleryImages.fields.length} move={galleryImages.move} remove={galleryImages.remove} />
              <input type="hidden" {...form.register(`galleryImages.${index}.sortOrder`, { valueAsNumber: true })} value={index} readOnly />
            </div>)}
          </div>
        </div>
      </section>
      <FormSection title="Project links" description="Public destinations are only rendered when valid URLs exist.">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Live URL">
          <input {...form.register("liveUrl")} className={inputClass} />
        </Field>
        <Field label="GitHub URL">
          <input {...form.register("githubUrl")} className={inputClass} />
        </Field>
      </div>
      </FormSection>
      <FormSection title="CTA overrides" description="Optional. Empty fields fall back to the active site's CTA settings.">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="CTA eyebrow"><input {...form.register("ctaEyebrow")} className={inputClass} /></Field>
          <Field label="CTA title"><input {...form.register("ctaTitle")} className={inputClass} /></Field>
          <Field label="CTA description"><textarea {...form.register("ctaDescription")} className={textareaClass} /></Field>
          <div className="grid gap-5"><Field label="Primary label"><input {...form.register("ctaPrimaryLabel")} className={inputClass} /></Field><Field label="Primary URL"><input {...form.register("ctaPrimaryUrl")} className={inputClass} /></Field></div>
          <Field label="Secondary label"><input {...form.register("ctaSecondaryLabel")} className={inputClass} /></Field>
          <Field label="Secondary URL"><input {...form.register("ctaSecondaryUrl")} className={inputClass} /></Field>
        </div>
      </FormSection>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-bold text-[color:var(--text-strong)]">Show on sites</legend>
        <div className="flex flex-wrap gap-5">
          {siteOptions.map((site) => (
            <DashboardCheckbox
              key={site.value}
              label={site.label}
              {...form.register("siteSlugs")}
              value={site.value}
            />
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap gap-5">
        <DashboardCheckbox
          label="Published"
          {...form.register("published")}
        />
        <DashboardCheckbox
          label="Featured"
          {...form.register("featured")}
        />
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

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="grid gap-5 rounded-[calc(var(--radius)*0.85)] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)]/28 p-4 sm:p-5"><div><h2 className="font-display text-lg font-black text-[color:var(--text-strong)]">{title}</h2><p className="mt-1 text-xs leading-5 text-[color:var(--text-muted)]">{description}</p></div>{children}</section>;
}

function RepeatableItems({ title, fields, register, append, remove, move, name }: { title: string; fields: Array<{ id: string }>; register: ReturnType<typeof useForm<z.input<typeof projectFormSchema>>>["register"]; append: () => void; remove: (index: number) => void; move: (from: number, to: number) => void; name: "benefits" | "capabilities" }) {
  return <FormSection title={title} description="Add 3-6 concise items. Auto icons use deterministic keyword matching."><div className="grid gap-3">{fields.map((field, index) => <div key={field.id} className="grid gap-3 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-3 md:grid-cols-[1fr_1.4fr_0.8fr_auto]"><Field label="Title"><input {...register(`${name}.${index}.title`)} className={inputClass} /></Field><Field label="Description"><input {...register(`${name}.${index}.description`)} className={inputClass} /></Field><Field label="Icon"><DashboardSelect {...register(`${name}.${index}.iconKey`)} options={projectIconOptions} className={inputClass} /></Field><ReorderButtons index={index} count={fields.length} move={move} remove={remove} /><input type="hidden" {...register(`${name}.${index}.sortOrder`, { valueAsNumber: true })} value={index} readOnly /></div>)}<Button type="button" variant="secondary" className="w-fit" onClick={append}><Plus size={16} /> Add item</Button></div></FormSection>;
}

function ReorderButtons({ index, count, move, remove }: { index: number; count: number; move: (from: number, to: number) => void; remove: (index: number) => void }) {
  return <div className="flex items-end gap-1"><Button type="button" size="icon" variant="ghost" aria-label="Move up" disabled={index === 0} onClick={() => move(index, index - 1)}><ArrowUp size={16} /></Button><Button type="button" size="icon" variant="ghost" aria-label="Move down" disabled={index === count - 1} onClick={() => move(index, index + 1)}><ArrowDown size={16} /></Button><Button type="button" size="icon" variant="ghost" aria-label="Remove item" onClick={() => remove(index)}><Trash2 size={16} /></Button></div>;
}

import { inputClass } from "@/components/ui/input";
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