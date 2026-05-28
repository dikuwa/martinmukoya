"use client";

import {
  MessageCircle,
  Phone,
} from "lucide-react";

type ServiceRow = {
  id: string;
  label: string;
  subtitle?: string;
  serviceValue: string;
  customDetails?: string;
};

const serviceRows: ServiceRow[] = [
  {
    id: "web-apps",
    label: "Web applications & business dashboards",
    serviceValue: "web-applications",
  },
  {
    id: "booking",
    label: "Booking & appointment systems",
    serviceValue: "booking-systems",
  },
  {
    id: "ecommerce",
    label: "Ecommerce flows & online storefronts",
    serviceValue: "ecommerce",
  },
  {
    id: "ai-auto",
    label: "AI automations & workflow integrations",
    serviceValue: "ai-automations",
  },
];

type BuyerIntentCardProps = {
  onSelectService: (
    serviceId: string,
    label: string,
    serviceValue: string,
    customDetails?: string,
  ) => void;
  onWhatsApp: () => void;
  onCall: () => void;
  whatsappHref: string;
  humanLabel: string;
};

export function BuyerIntentCard({
  onSelectService,
  onWhatsApp,
  onCall,
  whatsappHref,
  humanLabel,
}: BuyerIntentCardProps) {
  return (
    <div className="mt-1 animate-card-fade-in">
      <div className="space-y-1.5">
        {serviceRows.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() =>
              onSelectService(
                row.id,
                row.label,
                row.serviceValue,
                row.customDetails,
              )
            }
            className="w-full rounded-xl border border-[color:var(--border-subtle)] bg-transparent px-4 py-3 text-left text-sm font-bold text-[color:var(--text-strong)] transition-all duration-200 hover:border-[color:var(--primary)]/30 hover:bg-[color:var(--primary)]/8 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/40"
          >
            {row.label}
          </button>
        ))}

        {/* Other option — dashed border, visually distinct */}
        <button
          type="button"
          onClick={() =>
            onSelectService("other-project", "Other", "other")
          }
          className="w-full rounded-xl border border-dashed border-[color:var(--border-subtle)] bg-transparent px-4 py-3 text-left transition-all duration-200 hover:border-[color:var(--primary)]/40 hover:bg-[color:var(--primary)]/6 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/40"
        >
          <div className="text-sm font-bold text-[color:var(--text-strong)]">
            Something else? Describe your project
          </div>
          <div className="mt-0.5 text-xs text-[color:var(--text-muted)]">
            Tell us what you need and we&rsquo;ll guide you
          </div>
        </button>

        {/* Quick contact links */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onWhatsApp}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[color:var(--text-muted)] transition hover:text-[color:var(--primary)]"
          >
            <MessageCircle size={13} />
            WhatsApp {humanLabel}
          </a>
          <span className="text-[color:var(--text-faint)] select-none">·</span>
          <button
            type="button"
            onClick={onCall}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[color:var(--text-muted)] transition hover:text-[color:var(--primary)]"
          >
            <Phone size={13} />
            Call {humanLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
