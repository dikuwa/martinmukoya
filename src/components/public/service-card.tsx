import Link from "next/link";
import { Bot, CalendarCheck, MonitorCog, ShoppingBag } from "lucide-react";
import type { services } from "@/lib/site-data";

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
      className="group block h-full rounded-[16px] border border-[color:var(--border-subtle)] bg-white/[0.04] p-5 transition-colors duration-200 hover:border-[#74459A] hover:bg-white/[0.07]"
    >
      <article>
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[color:var(--border-subtle)] bg-white/[0.03] text-[color:var(--accent)] transition group-hover:border-[rgba(198,97,63,0.45)]">
            <Icon size={19} />
          </span>
          <h3 className="font-display text-[clamp(1.05rem,calc(0.95rem+0.5vw),1.35rem)] font-black text-[color:var(--text-strong)]">
            {service.title}
          </h3>
        </div>
        <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">{service.summary}</p>
      </article>
    </Link>
  );
}
