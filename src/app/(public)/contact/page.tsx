import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/public/contact-form";
import { Reveal } from "@/components/public/motion";
import { SectionHeading } from "@/components/public/section-heading";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { contact } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Martin Mukoya for websites, booking systems, ecommerce, AI automations, and developer opportunities."
};

export default function ContactPage() {
  return (
    <Section>
      <Container className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal>
          <SectionHeading
            eyebrow="Contact"
            title="Tell me what needs to work better."
            description="Share the business goal, the current friction, and what a good result would look like. I’ll help shape it into a practical next step."
          />
          <div className="mt-8 grid gap-3">
            <ContactLink icon={<Mail size={18} />} label={contact.email} href={`mailto:${contact.email}`} />
            <ContactLink icon={<Phone size={18} />} label={contact.phone} href={contact.phoneHref} />
            <ContactLink icon={<MapPin size={18} />} label={contact.location} href="/contact" />
          </div>
          <Button asChild className="mt-7" variant="secondary">
            <a href={contact.whatsappHref} target="_blank" rel="noreferrer">
              <MessageCircle size={17} /> Continue on WhatsApp
            </a>
          </Button>
        </Reveal>
        <Reveal>
          <div className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 shadow-[0_8px_22px_rgba(0,0,0,0.1)] md:p-6">
            <ContactForm />
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

function ContactLink({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <a href={href} className="flex items-center gap-3 rounded-[14px] border border-[color:var(--border-subtle)] bg-white/[0.04] p-4 text-sm font-bold text-[color:var(--text-strong)] transition hover:border-[rgba(198,97,63,0.35)]">
      <span className="text-[color:var(--accent)]">{icon}</span>
      {label}
    </a>
  );
}
