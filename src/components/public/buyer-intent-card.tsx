"use client";

import { useCallback, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";

export type SelectedService = {
  id: string;
  label: string;
  serviceValue: string;
  customDetails?: string;
};

type ServiceRow = {
  id: string;
  label: string;
  subtitle?: string;
  serviceValue: string;
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
  onServicesConfirm: (selected: SelectedService[]) => void;
  onWhatsApp: () => void;
  onCall: () => void;
  whatsappHref: string;
  humanLabel: string;
};

export function BuyerIntentCard({
  onServicesConfirm,
  onWhatsApp,
  onCall,
  whatsappHref,
  humanLabel,
}: BuyerIntentCardProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [customDetails, setCustomDetails] = useState("");

  const toggleRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleOtherToggle = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has("other-project")) {
        next.delete("other-project");
        setCustomDetails("");
      } else {
        next.add("other-project");
      }
      return next;
    });
  }, []);

  const handleContinue = useCallback(() => {
    const selected: SelectedService[] = [];

    // Collect named service rows
    for (const row of serviceRows) {
      if (selectedIds.has(row.id)) {
        selected.push({
          id: row.id,
          label: row.label,
          serviceValue: row.serviceValue,
        });
      }
    }

    // Append "Something else?" if selected
    if (selectedIds.has("other-project")) {
      selected.push({
        id: "other-project",
        label: "Something else",
        serviceValue: "other",
        customDetails: customDetails || undefined,
      });
    }

    if (selected.length === 0) return;
    onServicesConfirm(selected);
  }, [selectedIds, customDetails, onServicesConfirm]);

  const isOtherSelected = selectedIds.has("other-project");
  const hasSelection = selectedIds.size > 0;

  return (
    <div className="mt-1 animate-card-fade-in">
      <div className="space-y-1.5">
        {serviceRows.map((row) => {
          const isSelected = selectedIds.has(row.id);
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => toggleRow(row.id)}
              className={`group flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/40 ${
                isSelected
                  ? "border-[color:var(--primary)] bg-[color:var(--primary)]/10 shadow-[0_0_0_1px_var(--primary-alpha)]"
                  : "border-[color:var(--border-subtle)] bg-transparent hover:border-[color:var(--primary)]/30 hover:bg-[color:var(--primary)]/8 hover:shadow-sm"
              }`}
              aria-pressed={isSelected}
            >
              {/* Checkbox indicator */}
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors duration-200 ${
                  isSelected
                    ? "border-[color:var(--primary)] bg-[color:var(--primary)]"
                    : "border-[color:var(--border-subtle)] group-hover:border-[color:var(--text-muted)]"
                }`}
              >
                {isSelected && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="2.5 6 5 8.5 9.5 3" />
                  </svg>
                )}
              </span>
              {/* Label */}
              <span
                className={`text-xs font-bold transition-colors duration-200 ${
                  isSelected
                    ? "text-[color:var(--primary)]"
                    : "text-[color:var(--text-strong)]"
                }`}
              >
                {row.label}
              </span>
            </button>
          );
        })}

        {/* Other option — dashed border, visually distinct */}
        <div>
          <button
            type="button"
            onClick={handleOtherToggle}
            className={`group flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/40 ${
              isOtherSelected
                ? "border-[color:var(--primary)] bg-[color:var(--primary)]/10 shadow-[0_0_0_1px_var(--primary-alpha)]"
                : "border-dashed border-[color:var(--border-subtle)] hover:border-[color:var(--primary)]/40 hover:bg-[color:var(--primary)]/6 hover:shadow-sm"
            }`}
            aria-pressed={isOtherSelected}
          >
            {/* Checkbox indicator */}
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors duration-200 ${
                isOtherSelected
                  ? "border-[color:var(--primary)] bg-[color:var(--primary)]"
                  : "border-[color:var(--border-subtle)] group-hover:border-[color:var(--text-muted)]"
              }`}
            >
              {isOtherSelected && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="2.5 6 5 8.5 9.5 3" />
                </svg>
              )}
            </span>
            {/* Label + subtitle */}
            <span className="grid gap-0.5 min-w-0">
              <span
                className={`text-xs font-bold transition-colors duration-200 ${
                  isOtherSelected
                    ? "text-[color:var(--primary)]"
                    : "text-[color:var(--text-strong)]"
                }`}
              >
                Something else? Describe your project
              </span>
              <span className="text-xs text-[color:var(--text-muted)]">
                Tell us what you need and we&rsquo;ll guide you
              </span>
            </span>
          </button>

          {/* Custom details input */}
          {isOtherSelected && (
            <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <input
                type="text"
                value={customDetails}
                onChange={(e) => setCustomDetails(e.target.value)}
                placeholder="Briefly describe what you need..."
                className="w-full rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-4 py-3 text-sm text-[color:var(--text-strong)] transition focus:border-[color:var(--primary)]/50 focus:shadow-[0_0_0_4px_rgba(107,38,217,0.10)] focus:outline-none placeholder:text-[color:var(--text-faint)]"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Continue button — shown only when at least one option is selected */}
        {hasSelection && (
          <div className="pt-1">
            <button
              type="button"
              onClick={handleContinue}
              disabled={!hasSelection}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[color:var(--primary)] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[color:var(--primary)]/15 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-[color:var(--primary)]/25 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        )}

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
