import type { services } from "@/lib/site-data";
import { Bot, CalendarCheck, MonitorCog, ShoppingBag } from "lucide-react";
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
    <Link
      href={`/services#${service.id}`}
      className="motion-card group block h-full rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6 shadow-[0_3px_10px_rgba(0,0,0,0.06)] hover:border-[color:var(--border-subtle)] hover:bg-[color:var(--surface-soft)] hover:shadow-[0_10px_28px_rgba(107,38,217,0.10)]"
    >
      <article>
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] text-[color:var(--primary)] transition duration-200 group-hover:scale-105 group-hover:border-[color:var(--primary)] group-hover:bg-[color:var(--primary)]/10">
            <Icon size={19} />
          </span>
          <h3 className="text-balance font-display text-[clamp(1.05rem,calc(0.95rem+0.5vw),1.35rem)] font-black text-[color:var(--text-strong)]">
            {service.title}
          </h3>
        </div>
        <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">{service.summary}</p>
      </article>
    </Link>
  );
}
