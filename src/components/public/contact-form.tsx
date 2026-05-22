"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Check, ChevronDown, MessageCircle, Send } from "lucide-react";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics-client";
import type { PublicSiteConfig } from "@/lib/public-site-config";

const contactSchema = z.object({
  name: z.string().min(2, "Enter your name."),
  email: z.string().email("Enter a valid email."),
  phone: z.string().optional(),
  inquiryType: z.string().min(2, "Choose an inquiry type."),
  preferredContact: z.enum(["EMAIL", "PHONE", "WHATSAPP"]),
  message: z.string().min(20, "Share a little more context."),
  website: z.string().max(0).optional()
});

type ContactFormValues = z.infer<typeof contactSchema>;

const inquiryOptions = ["Project enquiry", "Recruiter conversation", "Support or maintenance", "Partnership"] as const;
const inquirySelectOptions = inquiryOptions.map((option) => ({ label: option, value: option }));
const preferredContactOptions = [
  { label: "Email", value: "EMAIL" },
  { label: "Phone", value: "PHONE" },
  { label: "WhatsApp", value: "WHATSAPP" }
] as const;

export function ContactForm({ site }: { site: PublicSiteConfig }) {
  const [submitted, setSubmitted] = useState(false);
  const pageCopy = site.pages.contact;
  const formStarted = useRef(false);
  const submitMessage = useMutation({
    mutationFn: async (values: ContactFormValues) => {
      const preferredContactLabel = {
        EMAIL: "Email",
        PHONE: "Phone",
        WHATSAPP: "WhatsApp"
      }[values.preferredContact];

      const response = await fetch("/api/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.phone,
          inquiryType: values.inquiryType,
          sourcePage: "/contact",
          siteSlug: site.slug,
          website: values.website,
          message: `Preferred contact: ${preferredContactLabel}\n\n${values.message}`
        })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Could not send the message.");
      }

      return response.json();
    }
  });
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      inquiryType: "Project enquiry",
      preferredContact: "EMAIL",
      message: "",
      website: ""
    }
  });
  const inquiryType = useWatch({ control: form.control, name: "inquiryType" });
  const preferredContact = useWatch({ control: form.control, name: "preferredContact" });

  async function onSubmit(values: ContactFormValues) {
    try {
      await submitMessage.mutateAsync(values);

      trackEvent({
        eventType: "form_submitted",
        siteSlug: site.slug,
        page: "/contact",
        source: "contact_form",
        metadata: { inquiryType: values.inquiryType, preferredContact: values.preferredContact }
      });

      toast.success("Message sent", {
        description: pageCopy.successToast
      });
      setSubmitted(true);
      form.reset();
    } catch (error) {
      toast.error("Message not sent", {
        description: error instanceof Error ? error.message : "Please try again in a moment."
      });
    }
  }

  function trackFormStart() {
    if (formStarted.current) return;
    formStarted.current = true;
    trackEvent({
      eventType: "form_started",
      siteSlug: site.slug,
      page: "/contact",
      source: "contact_form",
      metadata: { form: "contact" }
    });
  }

  if (submitted) {
    return (
      <div className="grid gap-5 rounded-[16px] border border-[color:var(--border-subtle)] bg-white/[0.03] p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--accent)]">Message received</p>
          <h2 className="text-balance mt-3 font-display text-[clamp(1.8rem,calc(1.4rem+1.5vw),2.5rem)] font-black leading-tight text-[color:var(--text-strong)]">
            {pageCopy.successTitle}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
            {pageCopy.successDescription}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <a href={site.contact.whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent({ eventType: "whatsapp_click", siteSlug: site.slug, page: "/contact", source: "contact_success" })}>
              {pageCopy.whatsappLabel} <MessageCircle size={16} />
            </a>
          </Button>
          <Button type="button" variant="secondary" onClick={() => setSubmitted(false)}>
            Send another message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="grid gap-4" onFocusCapture={trackFormStart} onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("website")} className="hidden" tabIndex={-1} autoComplete="off" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" error={form.formState.errors.name?.message}>
          <input {...form.register("name")} className={inputClass} autoComplete="name" placeholder="Your full name" />
        </Field>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <input {...form.register("email")} className={inputClass} type="email" autoComplete="email" placeholder="you@example.com" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" error={form.formState.errors.phone?.message}>
          <input {...form.register("phone")} className={inputClass} autoComplete="tel" placeholder="+264 ..." />
        </Field>
        <Field label="Inquiry type" error={form.formState.errors.inquiryType?.message}>
          <CustomSelect
            value={inquiryType}
            options={inquirySelectOptions}
            onChange={(value) => form.setValue("inquiryType", value, { shouldDirty: true, shouldValidate: true })}
          />
        </Field>
      </div>
      <Field label="Preferred contact" error={form.formState.errors.preferredContact?.message}>
        <CustomSelect
          value={preferredContact}
          options={[...preferredContactOptions]}
          onChange={(value) => form.setValue("preferredContact", value as ContactFormValues["preferredContact"], { shouldDirty: true, shouldValidate: true })}
        />
      </Field>
      <Field label="Message" error={form.formState.errors.message?.message}>
        <textarea {...form.register("message")} className={`${inputClass} min-h-36 resize-y py-3`} placeholder="Tell me what you want to build, fix, or improve..." />
      </Field>
      <Button className="justify-self-start" type="submit" disabled={form.formState.isSubmitting || submitMessage.isPending}>
        {form.formState.isSubmitting || submitMessage.isPending ? "Sending..." : "Send Message"} <Send size={16} />
      </Button>
    </form>
  );
}

const inputClass =
  "w-full rounded-[12px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-3 text-[color:var(--text-strong)] outline-none transition placeholder:text-[color:var(--text-faint)] hover:border-[color:var(--primary)] focus:border-[color:var(--primary)] min-h-11";

function CustomSelect({
  value,
  options,
  onChange
}: {
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-[12px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-3 text-left text-[color:var(--text-strong)] outline-none transition hover:border-[color:var(--primary)] focus:border-[color:var(--primary)]"
      >
        <span>{selected?.label ?? "Choose an option"}</span>
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface)] text-[color:var(--primary)]">
          <ChevronDown size={15} className={open ? "rotate-180 transition" : "transition"} />
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-[14px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-1 shadow-[var(--shadow-sm)]">
          {options.map((option) => {
            const active = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm font-semibold transition ${
                  active
                    ? "bg-[color:var(--primary)]/12 text-[color:var(--text-strong)]"
                    : "text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)]"
                }`}
              >
                {option.label}
                {active ? <Check size={15} className="text-[color:var(--primary)]" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2 text-sm font-semibold text-[color:var(--text-strong)]">
      <span>{label}</span>
      {children}
      {error ? <span className="text-xs text-[#EF4444]">{error}</span> : null}
    </div>
  );
}
