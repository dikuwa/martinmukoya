"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { Project } from "@/generated/prisma/client";
import { projectSchema } from "@/lib/validation/content";
import { Button } from "@/components/ui/button";

type ProjectFormValues = z.infer<typeof projectSchema>;
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

export function ProjectForm({ initialData }: { initialData?: Partial<Project> }) {
  const router = useRouter();
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
      galleryInput: csv(initialData?.gallery),
      techStackInput: csv(initialData?.techStack),
      servicesInput: csv(initialData?.services)
    }
  });

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
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5">
      <Field label="Title" error={form.formState.errors.title?.message}>
        <input {...form.register("title")} className={inputClass} />
      </Field>
      <Field label="Slug" error={form.formState.errors.slug?.message}>
        <input {...form.register("slug")} className={inputClass} />
      </Field>
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
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Cover image">
          <input {...form.register("coverImage")} className={inputClass} />
        </Field>
        <Field label="Gallery images, comma-separated">
          <input {...form.register("galleryInput")} className={inputClass} />
        </Field>
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
      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-sm font-bold text-[color:var(--text-strong)]">
          <input type="checkbox" {...form.register("published")} /> Published
        </label>
        <label className="flex items-center gap-2 text-sm font-bold text-[color:var(--text-strong)]">
          <input type="checkbox" {...form.register("featured")} /> Featured
        </label>
        <Field label="Sort order">
          <input type="number" {...form.register("sortOrder", { valueAsNumber: true })} className={inputClass} />
        </Field>
      </div>
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving..." : "Save Project"}
      </Button>
    </form>
  );
}

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
