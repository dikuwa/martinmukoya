"use client";

import {
  Globe,
  Search,
  Bot,
  ShoppingCart,
  Palette,
  CalendarDays,
  Phone,
  MessageCircle,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

export type ServiceAction = {
  id: string;
  label: string;
  icon: React.ElementType;
  serviceValue: string;
  customDetails?: string;
};

const services: ServiceAction[] = [
  {
    id: "website",
    label: "Website",
    icon: Globe,
    serviceValue: "web-applications",
  },
  {
    id: "seo",
    label: "SEO",
    icon: Search,
    serviceValue: "web-applications",
    customDetails: "SEO & digital visibility",
  },
  {
    id: "ai",
    label: "AI Automation",
    icon: Bot,
    serviceValue: "ai-automations",
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    icon: ShoppingCart,
    serviceValue: "ecommerce",
  },
  {
    id: "branding",
    label: "Branding",
    icon: Palette,
    serviceValue: "other",
    customDetails: "Branding & design services",
  },
  {
    id: "booking",
    label: "Booking",
    icon: CalendarDays,
    serviceValue: "booking-systems",
  },
];

type BuyerIntentCardProps = {
  onSelectService: (
    serviceId: string,
    label: string,
    serviceValue: string,
    customDetails?: string,
  ) => void;
  onBookConsultation: () => void;
  onWhatsApp: () => void;
  onCall: () => void;
  whatsappHref: string;
  humanLabel: string;
};

export function BuyerIntentCard({
  onSelectService,
  onBookConsultation,
  onWhatsApp,
  onCall,
  whatsappHref,
  humanLabel,
}: BuyerIntentCardProps) {
  return (
    <div className="mt-1 animate-card-fade-in">
      {/* Card container */}
      <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-3.5 shadow-sm">
        {/* Heading */}
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={14} className="text-[color:var(--primary)]" />
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
            How can I help?
          </span>
        </div>

        {/* Service grid — 3 columns */}
        <div className="mb-3 grid grid-cols-3 gap-1.5">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                type="button"
                onClick={() =>
                  onSelectService(
                    service.id,
                    service.label,
                    service.serviceValue,
                    service.customDetails,
                  )
                }
                className="group flex flex-col items-center gap-1.5 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-1.5 py-2.5 transition-all duration-200 hover:border-[color:var(--primary)]/30 hover:bg-[color:var(--surface-soft)] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/40"
                aria-label={`Select service: ${service.label}`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--primary)]/8 text-[color:var(--primary)] transition-all duration-200 group-hover:bg-[color:var(--primary)]/15">
                  <Icon size={14} />
                </span>
                <span className="text-[10px] font-bold leading-tight text-center text-[color:var(--text-strong)]">
                  {service.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Book Consultation CTA */}
        <button
          type="button"
          onClick={onBookConsultation}
          className="group mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--primary)] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:shadow-md hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/40"
        >
          <Sparkles size={14} />
          Book a Consultation
          <ArrowUpRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>

        {/* Quick contact links */}
        <div className="flex items-center justify-center gap-3">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onWhatsApp}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[color:var(--text-muted)] transition hover:text-[color:var(--primary)]"
          >
            <MessageCircle size={13} />
            WhatsApp {humanLabel}
          </a>
          <span className="text-[color:var(--text-faint)] select-none">·</span>
          <button
            type="button"
            onClick={onCall}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[color:var(--text-muted)] transition hover:text-[color:var(--primary)]"
          >
            <Phone size={13} />
            Call {humanLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
