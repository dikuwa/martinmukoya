"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics-client";
import { contact } from "@/lib/site-data";

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

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
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

  async function onSubmit(values: ContactFormValues) {
    try {
      await submitMessage.mutateAsync(values);

      trackEvent({
        eventType: "form_submitted",
        page: "/contact",
        source: "contact_form",
        metadata: { inquiryType: values.inquiryType, preferredContact: values.preferredContact }
      });

      toast.success("Message sent", {
        description: "Thanks. I’ll review this and reply with a practical next step."
      });
      setSubmitted(true);
      form.reset();
    } catch (error) {
      toast.error("Message not sent", {
        description: error instanceof Error ? error.message : "Please try again in a moment."
      });
    }
  }

  if (submitted) {
    return (
      <div className="grid gap-5 rounded-[16px] border border-[color:var(--border-subtle)] bg-white/[0.03] p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--accent)]">Message received</p>
          <h2 className="mt-3 font-display text-[clamp(1.8rem,calc(1.4rem+1.5vw),2.5rem)] font-black leading-tight text-[color:var(--text-strong)]">
            Thanks. I’ll take it from here.
          </h2>
          <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
            I’ll read through the context and reply with the most useful next step. For urgent notes, WhatsApp is still the fastest route.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <a href={contact.whatsappHref} target="_blank" rel="noreferrer" onClick={() => trackEvent({ eventType: "whatsapp_click", page: "/contact", source: "contact_success" })}>
              WhatsApp Martin <MessageCircle size={16} />
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
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("website")} className="hidden" tabIndex={-1} autoComplete="off" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" error={form.formState.errors.name?.message}>
          <input {...form.register("name")} className={inputClass} autoComplete="name" />
        </Field>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <input {...form.register("email")} className={inputClass} type="email" autoComplete="email" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" error={form.formState.errors.phone?.message}>
          <input {...form.register("phone")} className={inputClass} autoComplete="tel" />
        </Field>
        <Field label="Inquiry type" error={form.formState.errors.inquiryType?.message}>
          <select {...form.register("inquiryType")} className={inputClass}>
            <option>Project enquiry</option>
            <option>Recruiter conversation</option>
            <option>Support or maintenance</option>
            <option>Partnership</option>
          </select>
        </Field>
      </div>
      <Field label="Preferred contact" error={form.formState.errors.preferredContact?.message}>
        <select {...form.register("preferredContact")} className={inputClass}>
          <option value="EMAIL">Email</option>
          <option value="PHONE">Phone</option>
          <option value="WHATSAPP">WhatsApp</option>
        </select>
      </Field>
      <Field label="Message" error={form.formState.errors.message?.message}>
        <textarea {...form.register("message")} className={`${inputClass} min-h-36 resize-y py-3`} />
      </Field>
      <Button className="justify-self-start" type="submit" disabled={form.formState.isSubmitting || submitMessage.isPending}>
        {form.formState.isSubmitting || submitMessage.isPending ? "Sending..." : "Send Message"} <Send size={16} />
      </Button>
    </form>
  );
}

const inputClass =
  "w-full rounded-[12px] border border-[color:var(--border-subtle)] bg-white/[0.04] px-3 text-[color:var(--text-strong)] outline-none transition focus:border-[color:var(--accent)] min-h-11";

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
    <label className="grid gap-2 text-sm font-semibold text-[color:var(--text-strong)]">
      {label}
      {children}
      {error ? <span className="text-xs text-[#EF4444]">{error}</span> : null}
    </label>
  );
}
