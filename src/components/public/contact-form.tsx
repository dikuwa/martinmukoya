"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const contactSchema = z.object({
  name: z.string().min(2, "Enter your name."),
  email: z.string().email("Enter a valid email."),
  phone: z.string().optional(),
  inquiryType: z.string().min(2, "Choose an inquiry type."),
  preferredContact: z.string().min(2, "Choose a contact method."),
  message: z.string().min(20, "Share a little more context.")
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      inquiryType: "Project enquiry",
      preferredContact: "Email",
      message: ""
    }
  });

  function onSubmit() {
    toast.success("Thanks. The full submission workflow arrives in Phase 5.");
    form.reset();
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
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
          <option>Email</option>
          <option>Phone</option>
          <option>WhatsApp</option>
        </select>
      </Field>
      <Field label="Message" error={form.formState.errors.message?.message}>
        <textarea {...form.register("message")} className={`${inputClass} min-h-36 resize-y py-3`} />
      </Field>
      <Button className="justify-self-start" type="submit">
        Send Message <Send size={16} />
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
