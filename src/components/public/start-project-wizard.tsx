/* Replaced with enhanced multi-step wizard implementation */
"use client";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics-client";
import { contact, services } from "@/lib/site-data";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Bot, CalendarCheck, Check, MessageCircle, MonitorCog, Rocket, ShoppingBag } from "lucide-react";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const budgets = ["Under $1000", "$1000 - $3000", "$7000 - $15,000", "$15,000+"] as const;
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

export function StartProjectWizard() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const formStarted = useRef(false);
  const submitLead = useMutation({
    mutationFn: async (values: WizardInput) => {
      const parsed = wizardSchema.parse(values);
      const selectedServiceItems = services.filter((service) => parsed.selectedServices.includes(service.id));
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
  const otherSelected = selectedServices.includes("other");
  const progress = step === 1 ? "33%" : step === 2 ? "66%" : "100%";

  async function nextStep() {
    if (step === 1) {
      const valid = await form.trigger(["selectedServices", "otherDetails"]);
      if (!valid) return;
    }
    trackEvent({
      eventType: "step_completed",
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
    form.setValue("budgetRange", value, { shouldDirty: true, shouldValidate: true });
  }

  async function onSubmit(values: WizardInput) {
    try {
      const result = await submitLead.mutateAsync(values);

      trackEvent({
        eventType: "form_submitted",
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

      toast.success("Project request sent", {
        description: `${result.parsed.name}, I’ll review this and follow up with a practical next step.`
      });
      setSubmitted(true);
      form.reset();
    } catch (error) {
      toast.error("Request not sent", {
        description: error instanceof Error ? error.message : "Please try again in a moment."
      });
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto grid w-full max-w-5xl gap-6 overflow-hidden rounded-[32px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6 sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--accent)]">Request received</p>
          <h2 className="mt-3 font-display text-[clamp(2rem,calc(1.45rem+2vw),3.2rem)] font-black leading-tight text-[color:var(--text-strong)]">
            Thanks. Your brief is in good shape.
          </h2>
          <p className="mt-4 text-[clamp(1rem,calc(0.95rem+0.35vw),1.12rem)] leading-8 text-[color:var(--text-muted)]">
            I’ll review the services, budget, timeline, and notes you shared, then come back with the clearest next step. If timing is urgent, WhatsApp is the quickest way to add context.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <a href={contact.whatsappHref} target="_blank" rel="noreferrer" onClick={() => trackEvent({ eventType: "whatsapp_click", page: "/start-project", source: "start_project_success" })}>
              WhatsApp Martin <MessageCircle size={18} />
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
      onSubmit={form.handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-5xl overflow-hidden rounded-[32px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)]"
    >
      <div className="p-5 sm:p-6 lg:p-8">
        <input {...form.register("website")} className="hidden" tabIndex={-1} autoComplete="off" />
        <div className="mb-6 rounded-full bg-[color:var(--surface-soft)] p-3 sm:p-4">
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-[color:var(--accent)] transition-[width] duration-300" style={{ width: progress }} />
          </div>
          <div className="grid grid-cols-3 items-center gap-3">
            {[
              { index: 1, label: "Services" },
              { index: 2, label: "Budget" },
              { index: 3, label: "Timeline" }
            ].map((item) => {
              const active = item.index === step;
              const completed = item.index < step;

              return (
                <div key={item.index} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold",
                      completed
                        ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
                        : active
                        ? "border-[color:var(--accent)] bg-white text-[color:var(--accent)]"
                        : "border-[color:var(--border-subtle)] bg-white text-[color:var(--text-muted)]"
                    )}
                  >
                    {completed ? <Check size={14} /> : item.index}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-faint)]">Step {item.index}</p>
                    <p className={cn("text-sm font-semibold", active ? "text-[color:var(--text-strong)]" : "text-[color:var(--text-muted)]")}>{item.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[color:var(--accent)]">Step {step} of 3</p>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">
              {step === 1 && "Select the services that match your project."}
              {step === 2 && "Pick a budget range or leave it open for a flexible quote."}
              {step === 3 && "Select the timeline, then share your details and project notes."}
            </p>
          </div>
          <div className="text-right text-xs uppercase tracking-[0.24em] text-[color:var(--text-faint)]">
            {selectedServices.length ? `${selectedServices.length} service${selectedServices.length > 1 ? "s" : ""} chosen` : "No services selected"}
          </div>
        </div>

        {step === 1 ? (
          <div>
            <WizardTitle title="Choose your services" description="Select one or more services and add custom details as needed." />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[...services, { id: "other", number: "05", title: "Other", summary: "Describe a custom service or integration." }].map((service) => {
                const Icon = serviceIcons[service.id as keyof typeof serviceIcons] ?? MonitorCog;
                const selected = selectedServices.includes(service.id);

                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleService(service.id)}
                    className={cn(
                      "group flex min-h-28 items-start gap-4 rounded-[18px] border p-5 text-left transition duration-200 hover:-translate-y-0.5",
                      selected
                        ? "border-2 border-[color:var(--accent)] bg-[rgba(198,97,63,0.09)]"
                        : "border border-[color:var(--border-subtle)] bg-white/[0.03] hover:border-[rgba(198,97,63,0.35)]"
                    )}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] border border-[color:var(--border-subtle)] bg-white/[0.04] text-[color:var(--accent)]">
                      <Icon size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="block text-xs font-black uppercase tracking-[0.24em] text-[color:var(--text-faint)]">{service.number}</span>
                        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">{selected ? "Selected" : "Tap to select"}</span>
                      </div>
                      <h3 className="mt-3 font-display text-[clamp(1.2rem,calc(1.02rem+0.8vw),1.5rem)] font-black text-[color:var(--text-strong)]">
                        {service.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">{service.summary}</p>
                    </div>
                    <span className="mt-1 grid h-9 w-9 place-items-center rounded-2xl border border-[color:var(--border-subtle)] bg-white/[0.06] text-[color:var(--text-strong)] transition group-hover:border-[color:var(--accent)]">
                      {selected ? <Check size={18} className="text-[color:var(--accent)]" /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
            {otherSelected ? (
              <div className="mt-6">
                <label className="mb-3 block text-sm font-semibold text-[color:var(--text-strong)]">Other service details</label>
                <textarea
                  className="min-h-32 w-full rounded-[16px] border border-[color:var(--border-subtle)] bg-white/[0.04] px-5 py-4 text-[color:var(--text-strong)] outline-none transition placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--accent)]"
                  placeholder="Describe the custom work or integration you need..."
                  {...form.register("otherDetails")}
                />
                <FieldError message={form.formState.errors.otherDetails?.message} />
              </div>
            ) : null}
            <FieldError message={form.formState.errors.selectedServices?.message} />
            <div className="mt-8 flex justify-end">
              <Button type="button" size="lg" onClick={nextStep}>
                Continue
              </Button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div>
            <WizardTitle title="Select a budget range" description="Choose a budget range or leave the field open for a flexible proposal." />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {budgets.map((budget) => (
                <button
                  key={budget}
                  type="button"
                  onClick={() => chooseBudget(budget)}
                  className={cn(
                    "min-h-28 rounded-[18px] border p-5 text-left font-display text-[clamp(1.2rem,calc(1.02rem+0.8vw),1.5rem)] font-black transition duration-200 hover:-translate-y-0.5",
                    selectedBudget === budget
                      ? "border-2 border-[color:var(--accent)] bg-[rgba(198,97,63,0.09)] text-[color:var(--text-strong)]"
                      : "border border-[color:var(--border-subtle)] bg-white/[0.03] text-[color:var(--text-strong)] hover:border-[rgba(198,97,63,0.35)]"
                  )}
                >
                  {budget}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm text-[color:var(--text-muted)]">This step is optional — choose a range that feels right, or continue without one.</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={back} className="inline-flex items-center gap-2 text-sm font-bold text-[color:var(--text-muted)] hover:text-[color:var(--text-strong)]">
                <ArrowLeft size={16} /> Back
              </button>
              <Button type="button" size="lg" onClick={nextStep}>
                Next
              </Button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <WizardTitle title="Choose a timeline" description="Pick a launch window and whether the schedule can be flexible." />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {timelines.map((timeline) => (
                <button
                  key={timeline}
                  type="button"
                  onClick={() => form.setValue("timeline", timeline, { shouldDirty: true, shouldValidate: true })}
                  className={cn(
                    "min-h-28 rounded-[18px] border p-5 text-left font-display text-[clamp(1.15rem,calc(1rem+0.7vw),1.35rem)] font-black transition duration-200 hover:-translate-y-0.5",
                    selectedTimeline === timeline
                      ? "border-2 border-[color:var(--accent)] bg-[rgba(198,97,63,0.09)] text-[color:var(--text-strong)]"
                      : "border border-[color:var(--border-subtle)] bg-white/[0.03] text-[color:var(--text-strong)] hover:border-[rgba(198,97,63,0.35)]"
                  )}
                >
                  {timeline}
                </button>
              ))}
            </div>
            <label className="mt-6 flex items-center gap-3 text-sm font-semibold text-[color:var(--text-strong)]">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border border-[color:var(--border-subtle)] bg-white/[0.04] text-[color:var(--accent)] focus:ring-0"
                {...form.register("timelineFlexible")}
              />
              Schedule is flexible
            </label>
            <FieldError message={form.formState.errors.timeline?.message} />

            <div className="mt-8 grid gap-4">
              <input
                className="h-14 rounded-[16px] border border-[color:var(--border-subtle)] bg-white/[0.04] px-5 text-[color:var(--text-strong)] outline-none transition placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--accent)]"
                placeholder="Company or organisation (optional)"
                {...form.register("company")}
              />
              <input
                className="h-14 rounded-[16px] border border-[color:var(--border-subtle)] bg-white/[0.04] px-5 text-[color:var(--text-strong)] outline-none transition placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--accent)]"
                placeholder="Your Name"
                {...form.register("name")}
              />
              <FieldError message={form.formState.errors.name?.message} />
              <input
                className="h-14 rounded-[16px] border border-[color:var(--border-subtle)] bg-white/[0.04] px-5 text-[color:var(--text-strong)] outline-none transition placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--accent)]"
                placeholder="Your Email"
                type="email"
                {...form.register("email")}
              />
              <FieldError message={form.formState.errors.email?.message} />
              <div className="grid gap-4 sm:grid-cols-[1fr_0.8fr]">
                <input
                  className="h-14 rounded-[16px] border border-[color:var(--border-subtle)] bg-white/[0.04] px-5 text-[color:var(--text-strong)] outline-none transition placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--accent)]"
                  placeholder="Phone or WhatsApp (optional)"
                  autoComplete="tel"
                  {...form.register("phone")}
                />
                <select
                  className="h-14 rounded-[16px] border border-[color:var(--border-subtle)] bg-white/[0.04] px-5 text-[color:var(--text-strong)] outline-none transition focus:border-[color:var(--accent)]"
                  {...form.register("preferredContact")}
                >
                  <option value="EMAIL">Email</option>
                  <option value="PHONE">Phone</option>
                  <option value="WHATSAPP">WhatsApp</option>
                </select>
              </div>
              <textarea
                className="min-h-44 resize-y rounded-[16px] border border-[color:var(--border-subtle)] bg-white/[0.04] px-5 py-4 text-[color:var(--text-strong)] outline-none transition placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--accent)]"
                placeholder="Tell me more about the project..."
                {...form.register("message")}
              />
              <FieldError message={form.formState.errors.message?.message} />
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={back} className="inline-flex items-center gap-2 text-sm font-bold text-[color:var(--text-muted)] hover:text-[color:var(--text-strong)]">
                <ArrowLeft size={16} /> Back
              </button>
              <Button type="submit" size="lg" className="sm:min-w-64" disabled={form.formState.isSubmitting || submitLead.isPending}>
                {form.formState.isSubmitting || submitLead.isPending ? "Submitting..." : "Submit Request"} <Rocket size={18} />
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
  if (serviceId === "ai-automations") return "AI_AUTOMATION";
  if (serviceId === "web-applications") return "WEB_APP";

  return "OTHER";
}

function WizardTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--accent)]">Project step</p>
      <h2 className="mt-3 font-display text-[clamp(1.75rem,calc(1.35rem+1.5vw),2.7rem)] font-black leading-tight text-[color:var(--text-strong)]">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--text-muted)]">{description}</p>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-sm font-semibold text-[#EF4444]">{message}</p>;
}
