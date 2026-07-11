import type { services } from "@/lib/site-data";
import { ArrowRight, Bot, CalendarCheck, MonitorCog, ShoppingBag } from "lucide-react";
import Link from "next/link";

type Service = (typeof services)[number];

const serviceIcons = {
  "web-applications": MonitorCog,
  "booking-systems": CalendarCheck,
  ecommerce: ShoppingBag,
  "ai-automations": Bot
};

export function ServiceCard({ service }: { service: Service }) {
  const Icon = serviceIcons[service.id as keyof typeof serviceIcons] ?? MonitorCog;

  return (
    <article role="listitem" className="group flex h-full flex-col rounded-lg border border-transparent p-3 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-px hover:border-[color:var(--border-subtle)] hover:bg-[color:var(--surface-soft)]/40 focus-within:border-[color:var(--border-subtle)] focus-within:bg-[color:var(--surface-soft)]/40">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] text-[color:var(--primary)]">
          <Icon size={19} aria-hidden="true" />
        </span>
        <h3 className="text-balance font-display text-[clamp(1.05rem,calc(0.95rem+0.5vw),1.35rem)] font-black text-[color:var(--text-strong)]">
          {service.title}
        </h3>
      </div>
      <p className="mt-4 text-sm leading-6 text-[color:var(--text-muted)]">{service.summary}</p>
      <Link
        href={`/services#${service.id}`}
        aria-label={`Learn more about ${service.title}`}
        className="mt-auto inline-flex w-fit items-center gap-1.5 pt-5 text-sm font-bold text-[color:var(--primary)] outline-offset-4 transition-opacity duration-200 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-[color:var(--primary)]"
      >
        Learn more
        <ArrowRight
          size={15}
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:translate-x-1 group-focus-within:translate-x-1"
        />
      </Link>
    </article>
  );
}
