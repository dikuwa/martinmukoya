/* Replaced with enhanced multi-step wizard implementation */
"use client";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics-client";
import type { PublicSiteConfig } from "@/lib/public-site-config";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Bot, CalendarCheck, Check, MessageCircle, MonitorCog, Rocket, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { z } from "zod";

const budgets = ["Under N$15,000", "N$15,000 – N$50,000", "N$50,000 – N$100,000", "N$100,000+"] as const;
const timelines = ["ASAP within 1 month", "1-3 months", "3-6 months", "6+ months"] as const;

const wizardSchema = z
  .object({
    selectedServices: z.array(z.string()).min(1, "Choose at least one service."),
    otherDetails: z.string().optional(),
    budgetRange: z.string().optional(),
    timeline: z.enum(timelines).optional(),
    timelineFlexible: z.boolean().default(false),
    company: z.string().optional(),
    name: z.string().min(2, "Enter your name."),
    email: z.string().email("Enter a valid email."),
    phone: z.string().optional(),
    preferredContact: z.enum(["EMAIL", "PHONE", "WHATSAPP"]),
    message: z.string().min(20, "Share a little more about the project."),
    website: z.string().max(0).optional()
  })
  .superRefine((data, ctx) => {
    if (data.selectedServices.includes("other") && !data.otherDetails?.trim()) {
      ctx.addIssue({
        path: ["otherDetails"],
        code: z.ZodIssueCode.custom,
        message: "Describe the service you need when selecting Other."
      });
    }
    if (!data.timeline && !data.timelineFlexible) {
      ctx.addIssue({
        path: ["timeline"],
        code: z.ZodIssueCode.custom,
        message: "Choose a timeline or mark the timeline as flexible."
      });
    }
  });

type WizardInput = z.input<typeof wizardSchema>;

const serviceIcons = {
  "web-applications": MonitorCog,
  "booking-systems": CalendarCheck,
  ecommerce: ShoppingBag,
  "ai-automations": Bot,
  other: Rocket
};

export function StartProjectWizard({ site }: { site: PublicSiteConfig }) {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const cardRef = useRef<HTMLFormElement | null>(null);
  const formStarted = useRef(false);
  const previousStepRef = useRef(step);
  const submitLead = useMutation({
    mutationFn: async (values: WizardInput) => {
      const parsed = wizardSchema.parse(values);
      const selectedServiceItems = site.services.filter((service) => parsed.selectedServices.includes(service.id));
      const selectedServiceTitles = [
        ...selectedServiceItems.map((service) => service.title),
        ...(parsed.selectedServices.includes("other") ? [`Other: ${parsed.otherDetails}`] : [])
      ];
      const primaryService = parsed.selectedServices[0];
      const serviceType = mapServiceType(primaryService);
      const timeline = parsed.timelineFlexible ? `${parsed.timeline || "Not specified"} (flexible)` : parsed.timeline;

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parsed.name,
          email: parsed.email,
          phone: parsed.phone,
          company: parsed.company,
          serviceType,
          budgetRange: parsed.budgetRange,
          timeline,
          siteSlug: site.slug,
          source: "start-project",
          preferredContact: parsed.preferredContact,
          website: parsed.website,
          projectGoal: `Project services requested: ${selectedServiceTitles.join(", ")}.`,
          message: [
            parsed.message,
            "",
            `Selected services: ${selectedServiceTitles.join(", ")}`,
            `Budget: ${parsed.budgetRange || "Not specified"}`,
            `Timeline: ${timeline || "Not specified"}`,
            `Preferred contact: ${parsed.preferredContact}`
          ].join("\n")
        })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Could not submit the project request.");
      }

      return {
        response: await response.json(),
        parsed,
        serviceType,
        timeline
      };
    }
  });
  const form = useForm<WizardInput>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      selectedServices: [],
      otherDetails: "",
      budgetRange: "",
      timeline: undefined,
      timelineFlexible: false,
      company: "",
      name: "",
      email: "",
      phone: "",
      preferredContact: "EMAIL",
      message: "",
      website: ""
    }
  });

  const selectedServices = useWatch({ control: form.control, name: "selectedServices" });
  const selectedBudget = useWatch({ control: form.control, name: "budgetRange" });
  const selectedTimeline = useWatch({ control: form.control, name: "timeline" });
  const timelineFlexible = useWatch({ control: form.control, name: "timelineFlexible" });
  const otherSelected = selectedServices.includes("other");

  useEffect(() => {
    const serviceId = searchParams.get("service");
    if (!serviceId || formStarted.current) return;
    if (!site.services.some((service) => service.id === serviceId)) return;

    form.setValue("selectedServices", [serviceId], {
      shouldDirty: false,
      shouldValidate: true
    });
  }, [form, searchParams, site.services]);

  useEffect(() => {
    if (previousStepRef.current === step) return;
    previousStepRef.current = step;

    window.requestAnimationFrame(() => {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [step]);

  async function nextStep() {
    if (step === 1) {
      const valid = await form.trigger(["selectedServices", "otherDetails"]);
      if (!valid) return;
    }
    trackEvent({
      eventType: "step_completed",
      siteSlug: site.slug,
      page: "/start-project",
      source: "start_project_form",
      metadata: { form: "start_project", step }
    });
    setStep((current) => Math.min(current + 1, 3));
  }

  function back() {
    setStep((current) => Math.max(current - 1, 1));
  }

  function toggleService(id: string) {
    if (!formStarted.current) {
      formStarted.current = true;
      trackEvent({
        eventType: "form_started",
        siteSlug: site.slug,
        page: "/start-project",
        source: "start_project_form",
        metadata: { form: "start_project" }
      });
    }

    const current = form.getValues("selectedServices");
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    form.setValue("selectedServices", next, { shouldDirty: true, shouldValidate: true });
  }

  function chooseBudget(value: string) {
    const current = form.getValues("budgetRange");
    form.setValue("budgetRange", current === value ? "" : value, { shouldDirty: true, shouldValidate: true });
  }

  function chooseTimeline(value: (typeof timelines)[number]) {
    const current = form.getValues("timeline");
    form.setValue("timeline", current === value ? undefined : value, { shouldDirty: true, shouldValidate: true });
  }

  async function onSubmit(values: WizardInput) {
    try {
      const result = await submitLead.mutateAsync(values);

      trackEvent({
        eventType: "form_submitted",
        siteSlug: site.slug,
        page: "/start-project",
        source: "start_project_form",
        metadata: {
          form: "start_project",
          serviceType: result.serviceType,
          selectedServices: result.parsed.selectedServices,
          budgetRange: result.parsed.budgetRange,
          timeline: result.timeline
        }
      });

      toast.success(
        <div>
          <div className="font-semibold">Project request sent</div>
          <div className="text-sm opacity-85 mt-0.5">{result.parsed.name}, {site.slug === "flextech-media" ? "FlexTech will review this and follow up with a practical next step." : "I’ll review this and follow up with a practical next step."}</div>
        </div>
      );
      setSubmitted(true);
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Request not sent — Please try again in a moment.");
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto grid w-full max-w-5xl gap-6 overflow-hidden rounded-[32px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6 sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--accent)]">Request received</p>
          <h2 className="text-balance mt-3 font-display text-[clamp(2rem,calc(1.45rem+2vw),3.2rem)] font-black leading-tight text-[color:var(--text-strong)]">
            Thanks. Your brief is in good shape.
          </h2>
          <p className="mt-4 text-[clamp(1rem,calc(0.95rem+0.35vw),1.12rem)] leading-8 text-[color:var(--text-muted)]">
            {site.slug === "flextech-media"
              ? "FlexTech will review the services, budget, timeline, and notes you shared, then come back with the clearest next step. If timing is urgent, WhatsApp is the quickest way to add context."
              : "I’ll review the services, budget, timeline, and notes you shared, then come back with the clearest next step. If timing is urgent, WhatsApp is the quickest way to add context."}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <a href={site.contact.whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent({ eventType: "whatsapp_click", siteSlug: site.slug, page: "/start-project", source: "start_project_success" })}>
              {site.finalCta.secondary} <MessageCircle size={18} />
            </a>
          </Button>
          <Button type="button" variant="secondary" size="lg" onClick={() => setSubmitted(false)}>
            Start another request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={cardRef}
      onSubmit={form.handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-5xl scroll-mt-28 overflow-hidden rounded-[32px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)]"
    >
      <div className="p-5 sm:p-6 lg:p-8">
        <input {...form.register("website")} className="hidden" tabIndex={-1} autoComplete="off" />
        {step === 1 ? (
          <div>
            <WizardTitle center title="Choose your services" description="Select one or more services and add custom details as needed." />
            <StepProgress step={step} />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[...site.services, { id: "other", title: "Other", summary: "Describe a custom service or integration." }].map((service) => {
                const Icon = serviceIcons[service.id as keyof typeof serviceIcons] ?? MonitorCog;
                const selected = selectedServices.includes(service.id);

                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleService(service.id)}
                    aria-pressed={selected}
                    className={cn(
                      "group relative flex min-h-[170px] flex-col rounded-[22px] border p-6 text-left transition duration-200",
                      selected
                        ? "border-[color:var(--primary)] bg-[color:var(--primary)]/10"
                        : "border border-[color:var(--border-subtle)] bg-[color:var(--surface)] hover:border-[color:var(--border-subtle)] hover:bg-[color:var(--surface-soft)]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] text-[color:var(--primary)]">
                          <Icon size={20} />
                        </span>
                        <div>
                          <h3 className="text-balance font-display text-[clamp(1.2rem,calc(1.02rem+0.8vw),1.5rem)] font-black text-[color:var(--text-strong)]">
                            {service.id === "ai-automations" ? "AI Automations" : service.title}
                          </h3>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "grid h-10 w-10 place-items-center rounded-full border text-[color:var(--text-muted)] transition",
                          selected
                            ? "border-[color:var(--primary)] bg-[color:var(--primary)]/15 text-[color:var(--primary)]"
                            : "border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)]"
                        )}
                      >
                        {selected ? <Check size={18} /> : null}
                      </span>
                    </div>
                    <p className="mt-5 text-sm leading-6 text-[color:var(--text-muted)]">{service.summary}</p>
                  </button>
                );
              })}
            </div>
            {otherSelected ? (
              <div className="mt-6">
                <label className="mb-3 block text-sm font-semibold text-[color:var(--text-strong)]">Other service details</label>
                <textarea
                  className="min-h-32 w-full rounded-[16px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-5 py-4 text-[color:var(--text-strong)] outline-none transition placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--primary)]"
                  placeholder="Describe the custom work or integration you need..."
                  {...form.register("otherDetails")}
                />
                <FieldError message={form.formState.errors.otherDetails?.message} />
              </div>
            ) : null}
            <FieldError message={form.formState.errors.selectedServices?.message} />
            <div className="mt-8 flex justify-end">
              <Button type="button" variant="secondary" size="lg" onClick={nextStep}>
                Next <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div>
            <WizardTitle center title="Select a budget range" description="Optional, but helpful. Choose a Namibian dollar range or leave it open for a flexible proposal." />
            <StepProgress step={step} />
            <div className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {budgets.map((budget) => (
                <button
                  key={budget}
                  type="button"
                  onClick={() => chooseBudget(budget)}
                  aria-pressed={selectedBudget === budget}
                  className={cn(
                    "relative min-h-[76px] rounded-[16px] border px-4 py-4 text-left font-display text-[clamp(1.02rem,calc(0.98rem+0.35vw),1.18rem)] font-black transition duration-200",
                    selectedBudget === budget
                      ? "border-2 border-[color:var(--primary)] bg-[color:var(--primary)]/10 text-[color:var(--text-strong)]"
                      : "border border-[color:var(--border-subtle)] bg-[color:var(--surface)] text-[color:var(--text-strong)] hover:border-[color:var(--primary)] hover:bg-[color:var(--surface-soft)]"
                  )}
                >
                  {selectedBudget === budget && (
                    <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full border border-[color:var(--primary)] bg-[color:var(--primary)] text-white">
                      <Check size={14} />
                    </span>
                  )}
                  {budget}
                </button>
              ))}
            </div>
            <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-[color:var(--text-muted)]">
              Budget is optional. Tap a selected range again to clear it, or continue without choosing one.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="secondary" size="lg" onClick={back}>
                <ArrowLeft size={16} /> Back
              </Button>
              <Button type="button" variant="secondary" size="lg" onClick={nextStep}>
                Next <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <WizardTitle center title="Choose a timeline" description="Pick a launch window and whether the schedule can be flexible." />
            <StepProgress step={step} />
            <div className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {timelines.map((timeline) => (
                <button
                  key={timeline}
                  type="button"
                  onClick={() => chooseTimeline(timeline)}
                  aria-pressed={selectedTimeline === timeline}
                  className={cn(
                    "relative min-h-[76px] rounded-[16px] border px-4 py-4 text-left font-display text-[clamp(1rem,calc(0.96rem+0.35vw),1.15rem)] font-black transition duration-200",
                    selectedTimeline === timeline
                      ? "border-2 border-[color:var(--primary)] bg-[color:var(--primary)]/10 text-[color:var(--text-strong)]"
                      : "border border-[color:var(--border-subtle)] bg-[color:var(--surface)] text-[color:var(--text-strong)] hover:border-[color:var(--primary)] hover:bg-[color:var(--surface-soft)]"
                  )}
                >
                  {selectedTimeline === timeline && (
                    <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full border border-[color:var(--primary)] bg-[color:var(--primary)] text-white">
                      <Check size={14} />
                    </span>
                  )}
                  {timeline}
                </button>
              ))}
            </div>
            <label
              className={cn(
                "mt-6 inline-flex cursor-pointer items-center gap-3 rounded-full border px-4 py-3 text-sm font-semibold transition",
                timelineFlexible
                  ? "border-[color:var(--primary)] bg-[color:var(--primary)]/10 text-[color:var(--text-strong)]"
                  : "border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] text-[color:var(--text-muted)] hover:border-[color:var(--primary)] hover:text-[color:var(--text-strong)]"
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                {...form.register("timelineFlexible")}
              />
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded-[6px] border transition",
                  timelineFlexible
                    ? "border-[color:var(--primary)] bg-[color:var(--primary)] text-white"
                    : "border-[color:var(--border-subtle)] bg-[color:var(--surface)]"
                )}
              >
                {timelineFlexible ? <Check size={13} /> : null}
              </span>
              Schedule is flexible
            </label>
            <FieldError message={form.formState.errors.timeline?.message} />

            <div className="mt-8 grid gap-4">
              <input
                className="h-14 rounded-[16px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-5 text-[color:var(--text-strong)] outline-none transition placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--primary)]"
                placeholder="Company or organisation (optional)"
                {...form.register("company")}
              />
              <input
                className="h-14 rounded-[16px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-5 text-[color:var(--text-strong)] outline-none transition placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--primary)]"
                placeholder="Your Name"
                {...form.register("name")}
              />
              <FieldError message={form.formState.errors.name?.message} />
              <input
                className="h-14 rounded-[16px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-5 text-[color:var(--text-strong)] outline-none transition placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--primary)]"
                placeholder="Your Email"
                type="email"
                {...form.register("email")}
              />
              <FieldError message={form.formState.errors.email?.message} />
              <div className="grid gap-4 sm:grid-cols-[1fr_0.8fr]">
                <input
                  className="h-14 rounded-[16px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-5 text-[color:var(--text-strong)] outline-none transition placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--primary)]"
                  placeholder="Phone or WhatsApp (optional)"
                  autoComplete="tel"
                  {...form.register("phone")}
                />
                <select
                  className="h-14 rounded-[16px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-5 text-[color:var(--text-strong)] outline-none transition focus:border-[color:var(--primary)]"
                  {...form.register("preferredContact")}
                >
                  <option value="EMAIL">Email</option>
                  <option value="PHONE">Phone</option>
                  <option value="WHATSAPP">WhatsApp</option>
                </select>
              </div>
              <textarea
                className="min-h-44 resize-y rounded-[16px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-5 py-4 text-[color:var(--text-strong)] outline-none transition placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--primary)]"
                placeholder="Tell me more about the project..."
                {...form.register("message")}
              />
              <FieldError message={form.formState.errors.message?.message} />
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="secondary" size="lg" onClick={back} className="inline-flex items-center gap-2">
                <ArrowLeft size={16} /> Back
              </Button>
              <Button type="submit" size="lg" className="sm:min-w-64" disabled={form.formState.isSubmitting || submitLead.isPending}>
                {form.formState.isSubmitting || submitLead.isPending ? "Submitting..." : "Submit Request"} <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </form>
  );
}

function mapServiceType(serviceId: string) {
  if (serviceId === "booking-systems") return "BOOKING_SYSTEM";
  if (serviceId === "ecommerce") return "ECOMMERCE";
  if (serviceId === "ai-automations" || serviceId === "automation") return "AI_AUTOMATION";
  if (serviceId === "web-applications" || serviceId === "brand-websites" || serviceId === "content-systems" || serviceId === "digital-campaigns") return "WEB_APP";

  return "OTHER";
}

function StepProgress({ step }: { step: number }) {
  const stepItems = [
    { index: 1, label: "Services" },
    { index: 2, label: "Budget" },
    { index: 3, label: "Timeline" }
  ];

  const progressWidth = step === 1 ? "0%" : step === 2 ? "50%" : "100%";

  return (
    <div className="relative mt-8 mb-10 flex items-center justify-between gap-4 px-5 sm:px-10">
      <div className="absolute left-5 right-5 top-5 h-1 rounded-full bg-[color:var(--border-subtle)]" />
      <div className="absolute left-5 top-5 h-1 rounded-full bg-[color:var(--primary)]" style={{ width: progressWidth }} />
      {stepItems.map((item) => {
        const active = item.index === step;
        const completed = item.index < step;

        return (
          <div key={item.index} className="relative flex flex-col items-center text-center">
            <span
              className={cn(
                "relative z-10 flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition",
                completed
                  ? "border-[color:var(--primary)] bg-[color:var(--primary)] text-white"
                  : active
                  ? "border-[color:var(--primary)] bg-[color:var(--surface)] text-[color:var(--primary)]"
                  : "border-[color:var(--border-subtle)] bg-[color:var(--background)] text-[color:var(--text-muted)]"
              )}
            >
              {completed ? <Check size={14} /> : item.index}
            </span>
            <span className="mt-3 text-sm font-semibold text-[color:var(--text-muted)]">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function WizardTitle({ title, description, center }: { title: string; description: string; center?: boolean }) {
  return (
    <div className={cn(center ? "mx-auto text-center" : "", "max-w-3xl")}>
      <p className="text-sm font-semibold text-[color:var(--text-muted)]">Project Steps</p>
      <h2 className="text-balance mt-3 font-display text-[clamp(1.75rem,calc(1.35rem+1.5vw),2.7rem)] font-black leading-tight text-[color:var(--text-strong)]">
        {title}
      </h2>
      <p className={cn("mt-3 max-w-2xl text-sm leading-6 text-[color:var(--text-muted)]", center ? "mx-auto" : "")}>{description}</p>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-sm font-semibold text-[#EF4444]">{message}</p>;
}
