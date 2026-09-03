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
import { ArrowDown, ArrowUp, Plus, Trash2, Hash, Save, X } from "lucide-react";
import { projectIconOptions } from "@/lib/project-icons";

type ProjectFormValues = z.infer<typeof projectSchema>;
const siteOptions = [
  { label: "Martin Mukoya", value: "martin-mukoya" },
  { label: "FlexTech Media", value: "flextech-media" }
] as const;
const projectFormSchemaBase = projectSchema.omit({ gallery: true, techStack: true, services: true, deliverables: true, coverThumbnails: true }).extend({
  galleryInput: z.string().optional(),
  techStackInput: z.string().optional(),
  servicesInput: z.string().optional(),
  deliverablesInput: z.string().optional(),
  coverThumbnailsInput: z.string().optional(),
  coverThumbnailUploadPreview: z.string().optional(),
});

const projectFormSchema = projectFormSchemaBase.transform((values) => ({
  ...values,
  gallery: splitCsv(values.galleryInput ?? ""),
  techStack: splitCsv(values.techStackInput ?? ""),
  services: splitCsv(values.servicesInput ?? ""),
  deliverables: splitCsv(values.deliverablesInput ?? ""),
  coverThumbnails: splitCsv(values.coverThumbnailsInput ?? "").map((url, index) => ({
    url,
    alt: "",
    sortOrder: index
  }))
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

function ReorderButtons({ index, count, move, remove }: { index: number; count: number; move: (from: number, to: number) => void; remove: (index: number) => void }) {
  return <div className="flex items-end gap-1"><Button type="button" size="icon" variant="ghost" aria-label="Move up" disabled={index === 0} onClick={() => move(index, index - 1)}><ArrowUp size={16} /></Button><Button type="button" size="icon" variant="ghost" aria-label="Move down" disabled={index === count - 1} onClick={() => move(index, index + 1)}><ArrowDown size={16} /></Button><Button type="button" size="icon" variant="ghost" aria-label="Remove item" onClick={() => remove(index)}><Trash2 size={16} /></Button></div>;
}

const SECTIONS = [
  { id: "basic-details", title: "Basic project details", description: "Identity, ownership, visibility, and publication settings." },
  { id: "overview", title: "Project overview", description: "The compact facts shown immediately below the hero." },
  { id: "case-study", title: "Case-study story", description: "Problem, response, result, and the detailed narrative." },
  { id: "benefits", title: "Benefits / impact cards" },
  { id: "features", title: "Features and stack", description: "Technology labels and a short implementation summary." },
  { id: "capabilities", title: "What was built" },
  { id: "media", title: "Project media", description: "Add a compact cover preview and optional gallery images for the public case study." },
  { id: "links", title: "Project links", description: "Public destinations are only rendered when valid URLs exist." },
  { id: "cta", title: "CTA overrides", description: "Optional. Empty fields fall back to the active site's CTA settings." },
  { id: "publishing", title: "Publishing", description: "Control where and how this project appears." },
] as const;

type SectionId = typeof SECTIONS[number]["id"];

function ProjectForm({ initialData }: { initialData?: Partial<Project> & { sites?: Array<{ slug: string }> } }) {
  const router = useRouter();
  const [galleryUploadPreview, setGalleryUploadPreview] = useState("");
  const [coverThumbnailUploadPreview, setCoverThumbnailUploadPreview] = useState("");
  const [activeSection, setActiveSection] = useState<SectionId>("basic-details");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
  const form = useForm<z.input<typeof projectFormSchemaBase>>({
    resolver: zodResolver(projectFormSchemaBase),
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
      deliverablesInput: csv(initialData?.deliverables),
      coverThumbnailsInput: csv((initialData?.coverThumbnails as string[]) ?? []),
      coverThumbnailUploadPreview: ""
    }
  });
  
  const benefits = useFieldArray({ control: form.control, name: "benefits" });
  const capabilities = useFieldArray({ control: form.control, name: "capabilities" });
  const galleryImages = useFieldArray({ control: form.control, name: "galleryImages" });
  const title = useWatch({ control: form.control, name: "title" });
  const coverImage = useWatch({ control: form.control, name: "coverImage" });
  const galleryInput = useWatch({ control: form.control, name: "galleryInput" });
  const coverThumbnailsInput = useWatch({ control: form.control, name: "coverThumbnailsInput" });
  const published = useWatch({ control: form.control, name: "published" });
  const featured = useWatch({ control: form.control, name: "featured" });
  const siteSlugs = useWatch({ control: form.control, name: "siteSlugs" });

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

  function appendCoverThumbnail(value: string) {
    setCoverThumbnailUploadPreview(value);
    if (!value) return;

    const existing = splitCsv(coverThumbnailsInput ?? "");
    if (existing.includes(value)) return;

    form.setValue("coverThumbnailsInput", [...existing, value].join(", "), {
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

  function scrollToSection(sectionId: SectionId) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setActiveSection(sectionId);
    setMobileNavOpen(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Sticky left sidebar navigation */}
      <aside className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-5rem)] overflow-y-auto">
        <nav className="grid gap-1 p-3 rounded-[var(--radius)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)]" aria-label="Project form sections">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)] ${
                activeSection === section.id
                  ? "bg-[rgba(107,38,217,0.1)] text-[color:var(--primary)]"
                  : "text-[color:var(--text-muted)]"
              }`}
              aria-current={activeSection === section.id ? "page" : undefined}
            >
              <Hash size={14} aria-hidden="true" />
              <span className="truncate">{section.title}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main form content */}
      <main className="min-w-0">
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6" id="form-content">
          <FormSection id="basic-details" title="Basic project details" description="Identity, ownership, visibility, and publication settings.">
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
          
          <FormSection id="overview" title="Project overview" description="The compact facts shown immediately below the hero.">
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
          
          <FormSection id="case-study" title="Case-study story" description="Problem, response, result, and the detailed narrative.">
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
          
          <RepeatableItemsWithPreview
            title="Benefits / impact cards"
            fields={benefits.fields}
            register={form.register}
            append={() => benefits.append({ title: "", description: "", iconKey: "auto", sortOrder: benefits.fields.length })}
            remove={benefits.remove}
            move={benefits.move}
            name="benefits"
          />
          
          <FormSection id="features" title="Features and stack" description="Technology labels and a short implementation summary.">
            <Field label="Stack summary"><textarea {...form.register("stackSummary")} className={textareaClass} /></Field>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Tech stack, comma-separated"><input {...form.register("techStackInput")} className={inputClass} /></Field>
              <Field label="Services, comma-separated"><input {...form.register("servicesInput")} className={inputClass} /></Field>
            </div>
          </FormSection>
          
          <RepeatableItemsWithPreview
            title="What was built"
            fields={capabilities.fields}
            register={form.register}
            append={() => capabilities.append({ title: "", description: "", iconKey: "auto", sortOrder: capabilities.fields.length })}
            remove={capabilities.remove}
            move={capabilities.move}
            name="capabilities"
          />
          
          <FormSection id="media" title="Project media" description="Add a compact cover preview, hero thumbnails, and optional gallery images for the public case study.">
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
                label="Add hero thumbnail"
                folder="projects/cover-thumbnails"
                value={coverThumbnailUploadPreview ?? ""}
                onChange={(value) => form.setValue("coverThumbnailUploadPreview", value, { shouldDirty: true, shouldValidate: true })}
                placeholder="Upload or paste a thumbnail image URL"
                cropAspect={false}
              />
              <Field label="Hero thumbnails, comma-separated">
                <input {...form.register("coverThumbnailsInput")} className={inputClass} />
              </Field>
              <div className="grid gap-3 md:col-span-2">
                <p className="text-sm text-[color:var(--text-muted)]">Enter thumbnail URLs as comma-separated values. Each thumbnail will be displayed as a clickable thumbnail below the hero image.</p>
              </div>
              <ImageUploadField
                label="Add gallery image"
                folder="projects/gallery"
                value={galleryUploadPreview}
                onChange={appendGalleryImage}
                placeholder="Upload or paste a gallery image URL"
                cropAspect={false}
              />
              <Field label="Gallery images, comma-separated">
                <input {...form.register("galleryInput")} className={inputClass} />
              </Field>
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
          </FormSection>
          
          <FormSection id="links" title="Project links" description="Public destinations are only rendered when valid URLs exist.">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Live URL">
                <input {...form.register("liveUrl")} className={inputClass} />
              </Field>
              <Field label="GitHub URL">
                <input {...form.register("githubUrl")} className={inputClass} />
              </Field>
            </div>
          </FormSection>
          
          <FormSection id="cta" title="CTA overrides" description="Optional. Empty fields fall back to the active site's CTA settings.">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="CTA eyebrow"><input {...form.register("ctaEyebrow")} className={inputClass} /></Field>
              <Field label="CTA title"><input {...form.register("ctaTitle")} className={inputClass} /></Field>
              <Field label="CTA description"><textarea {...form.register("ctaDescription")} className={textareaClass} /></Field>
              <div className="grid gap-5"><Field label="Primary label"><input {...form.register("ctaPrimaryLabel")} className={inputClass} /></Field><Field label="Primary URL"><input {...form.register("ctaPrimaryUrl")} className={inputClass} /></Field></div>
              <Field label="Secondary label"><input {...form.register("ctaSecondaryLabel")} className={inputClass} /></Field>
              <Field label="Secondary URL"><input {...form.register("ctaSecondaryUrl")} className={inputClass} /></Field>
            </div>
          </FormSection>

          {/* Persistent footer bar with publish controls */}
          <footer className="lg:sticky lg:bottom-4 lg:self-end border-t border-[color:var(--border-subtle)] bg-[color:var(--background)] p-4 rounded-[calc(var(--radius)*0.85)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            <FormSection id="publishing" title="Publishing" description="Control where and how this project appears.">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-3">
                  <div className="text-sm font-bold text-[color:var(--text-strong)]">Show on sites</div>
                  <div className="flex flex-wrap gap-4">
                    {siteOptions.map((site) => (
                      <DashboardCheckbox
                        key={site.value}
                        label={site.label}
                        {...form.register("siteSlugs")}
                        value={site.value}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid gap-3">
                  <div className="text-sm font-bold text-[color:var(--text-strong)]">Visibility</div>
                  <div className="flex flex-wrap gap-4">
                    <DashboardCheckbox label="Published" {...form.register("published")} />
                    <DashboardCheckbox label="Featured" {...form.register("featured")} />
                  </div>
                </div>
              </div>
              <Field label="Sort order">
                <input type="number" {...form.register("sortOrder", { valueAsNumber: true })} className={`${inputClass} mt-6 max-w-[200px]`} />
              </Field>
            </FormSection>
            
            <div className="flex flex-wrap gap-3 justify-end md:justify-start">
              <Button type="button" variant="secondary" onClick={() => router.push("/admin/projects")}>
                <X size={16} /> Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className="flex items-center gap-2">
                <Save size={16} />
                {form.formState.isSubmitting ? "Saving..." : "Save Project"}
              </Button>
            </div>
          </footer>
        </form>
      </main>
    </div>
  );
}

function FormSection({ id, title, description, children }: { id: SectionId; title: string; description: string; children: React.ReactNode }) {
  return <section id={id} className="grid gap-5 rounded-[calc(var(--radius)*0.85)] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)]/28 p-4 sm:p-5"><div><h2 className="font-display text-lg font-black text-[color:var(--text-strong)]">{title}</h2><p className="mt-1 text-xs leading-5 text-[color:var(--text-muted)]">{description}</p></div>{children}</section>;
}

function RepeatableItemsWithPreview({ title, fields, register, append, remove, move, name }: { title: string; fields: Array<{ id: string; title?: string; description?: string }>; register: ReturnType<typeof useForm<z.input<typeof projectFormSchema>>>["register"]; append: () => void; remove: (index: number) => void; move: (from: number, to: number) => void; name: "benefits" | "capabilities" }) {
  return (
    <FormSection id={name === "benefits" ? "benefits" : "capabilities"} title={title} description="Add 3-6 concise items. Auto icons use deterministic keyword matching.">
      <div className="grid gap-3">
        {fields.length > 0 && (
          <div className="rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-3 mb-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[color:var(--text-strong)]">
                {fields.length} item{fields.length !== 1 ? "s" : ""} defined
              </span>
              <button
                type="button"
                className="text-xs font-semibold text-[color:var(--primary)] hover:underline"
                onClick={() => {
                  const el = document.getElementById(name === "benefits" ? "benefits" : "capabilities");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Jump to list →
              </button>
            </div>
            <div className="grid gap-1 text-sm text-[color:var(--text-muted)]">
              {fields.slice(0, 3).map((field, i) => (
                <div key={field.id} className="flex items-center gap-2 px-2 py-1.5 rounded-[6px] hover:bg-[color:var(--surface-soft)]">
                  <span className="text-[color:var(--primary)] font-bold">#{i + 1}</span>
                  <span className="truncate font-medium">{field.title || "Untitled"}</span>
                  {field.description && (
                    <span className="text-[color:var(--text-faint)] truncate">- {field.description.slice(0, 60)}</span>
                  )}
                </div>
              ))}
            </div>
            {fields.length > 3 && (
              <div className="mt-1 text-xs text-[color:var(--text-faint)]">
                …and {fields.length - 3} more
              </div>
            )}
          </div>
        )}
        {fields.map((field, index) => (
          <div key={field.id} className="grid gap-3 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-3 md:grid-cols-[1fr_1.4fr_0.8fr_auto]">
            <Field label="Title"><input {...register(`${name}.${index}.title`)} className={inputClass} /></Field>
            <Field label="Description"><input {...register(`${name}.${index}.description`)} className={inputClass} /></Field>
            <Field label="Icon"><DashboardSelect {...register(`${name}.${index}.iconKey`)} options={projectIconOptions} className={inputClass} /></Field>
            <ReorderButtons index={index} count={fields.length} move={move} remove={remove} />
            <input type="hidden" {...register(`${name}.${index}.sortOrder`, { valueAsNumber: true })} value={index} readOnly />
          </div>
        ))}
        <Button type="button" variant="secondary" className="w-fit" onClick={append}>
          <Plus size={16} /> Add item
        </Button>
      </div>
    </FormSection>
  );
}

export { ProjectForm };