import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, CalendarCheck, MonitorCog, ShoppingBag } from "lucide-react";
import { Reveal } from "@/components/public/motion";
import { SectionHeading } from "@/components/public/section-heading";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { services } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Services",
  description: "Web applications, booking systems, ecommerce, and AI automations by Martin Mukoya."
};

export default function ServicesPage() {
  return (
    <>
      <Section className="pb-12">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Services"
              title="Systems built around bookings, leads, sales, and workflow."
              description="Each service starts with the business outcome. The technology matters, but the real goal is making customer action and team follow-up easier."
            />
          </Reveal>
        </Container>
      </Section>
      <Section className="pt-0">
        <Container className="grid gap-6">
          {services.map((service, index) => (
            <Reveal key={service.id} delay={index * 0.05}>
              <article id={service.id} className="grid gap-6 border-b border-[color:var(--border-subtle)] py-8 transition duration-200 hover:border-[color:var(--accent)] md:grid-cols-[0.45fr_1fr]">
                <div className="flex items-center gap-3 self-start">
                  <ServiceIcon id={service.id} />
                  <h2 className="font-display text-[clamp(1.25rem,calc(1.05rem+0.9vw),2rem)] font-black text-[color:var(--text-strong)]">{service.title}</h2>
                </div>
                <div>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-[color:var(--text-muted)]">{service.summary}</p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <InfoBlock title="Who it helps" text={service.who} />
                    <InfoBlock title="Common friction" text={service.problems.join(", ")} />
                    <InfoBlock title="Business result" text={service.outcomes.join(", ")} />
                  </div>
                  <Button asChild className="mt-7">
                    <Link href="/start-project">
                      Discuss this service <ArrowRight size={17} />
                    </Link>
                  </Button>
                </div>
              </article>
            </Reveal>
          ))}
        </Container>
      </Section>
    </>
  );
}

function ServiceIcon({ id }: { id: string }) {
  const icons = {
    "web-applications": MonitorCog,
    "booking-systems": CalendarCheck,
    ecommerce: ShoppingBag,
    "ai-automations": Bot
  };
  const Icon = icons[id as keyof typeof icons] ?? MonitorCog;

  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[color:var(--border-subtle)] bg-white/[0.03] text-[color:var(--accent)]">
      <Icon size={23} />
    </div>
  );
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-[color:var(--text-strong)]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">{text}</p>
    </div>
  );
}
