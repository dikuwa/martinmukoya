import { Reveal } from "@/components/public/motion";
import { SectionHeading } from "@/components/public/section-heading";
import { TrackedAnchor } from "@/components/public/tracked-anchor";
import { TrackedLink } from "@/components/public/tracked-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { getPublicSiteConfig } from "@/lib/public-site-config";
import { getCurrentSite } from "@/lib/sites";
import { ArrowRight, Bot, CalendarCheck, MessageCircle, MonitorCog } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { webPageSchema } from "@/lib/schema";

export async function generateMetadata(): Promise<Metadata> {
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);

  return {
    title: "About",
    description: site.pages.about.metadataDescription,
    alternates: { canonical: "/about" },
    openGraph: {
      title: `About | ${site.brandName}`,
      description: site.pages.about.metadataDescription,
      url: "/about"
    },
    twitter: {
      card: "summary_large_image",
      title: `About | ${site.brandName}`,
      description: site.pages.about.metadataDescription
    }
  };
}

export default async function AboutPage() {
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);
  const isMartin = site.slug === "martin-mukoya";

  // FlexTech doesn't have an individual about page — redirect or show minimal
  if (!isMartin) {
    return <FlexTechAboutPage />;
  }

  const breadcrumbSchema = webPageSchema({
    name: "About | " + site.brandName,
    description: site.pages.about.metadataDescription,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "About", url: "/about" }
    ],
    url: "/about"
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* ─── 1. HERO ─── */}
      <Section className="relative overflow-hidden pb-12 pt-14 lg:pb-20 lg:pt-20">
        {/* Subtle map background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage: "url('/assets/backgrounds/SVG/map-03.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.055
          }}
        />

        <Container className="relative grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
          {/* Left: copy */}
          <Reveal>
            <Badge className="mb-6">About Martin</Badge>
            <h1 className="text-balance font-display text-[clamp(2.4rem,4vw,4rem)] font-black leading-[1.02] tracking-[-0.02em] text-[color:var(--text-strong)]">
              Curiosity turned into systems that solve real problems.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[color:var(--text-muted)]">
              I started as a science teacher, but curiosity pulled me deep into technology, systems,
              automation, and problem solving. Today, I build practical digital systems designed to
              help businesses operate more clearly.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="motion-sheen">
                <TrackedLink siteSlug={site.slug} eventType="cta_click" eventPage="/about" eventSource="hero_cta" href="/start-project">
                  Let&rsquo;s Build Something <ArrowRight size={18} />
                </TrackedLink>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <TrackedLink siteSlug={site.slug} eventType="cta_click" eventPage="/about" eventSource="hero_secondary" href="/projects">
                  See My Work
                </TrackedLink>
              </Button>
            </div>
          </Reveal>

          {/* Right: overlapping collage — outdoor, builder, teacher */}
          <Reveal className="relative mx-auto w-full max-w-[500px]">
            <div className="relative aspect-[4/5]">
              {/* Branded backdrop — atmospheric depth behind cards (first child = bottom of stack) */}
              <div className="absolute inset-0 overflow-hidden rounded-[1rem]" aria-hidden="true">
                {/* Deep navy/purple gradient base */}
                <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--primary)]/15 via-[color:var(--background-elevated)] to-[color:var(--background)]" />
                {/* Subtle radial glow */}
                <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[color:var(--primary)]/8 blur-[120px]" />
                {/* Faint grid texture */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(107,38,217,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(107,38,217,0.05)_1px,transparent_1px)] bg-[size:28px_28px]" />
                {/* Faded code atmosphere */}
                <div className="absolute bottom-6 left-6 right-6">
                  <pre className="select-none text-[clamp(0.35rem,0.8vw,0.45rem)] leading-[1.5] tracking-[0.06em] text-[color:var(--primary)]/10 font-mono opacity-60">{`// Martin Mukoya
// builder  ·  teacher  ·  problem solver

system.curiosity = true;
system.solve(realProblems);
return { clarity, purpose, flow };

// Good systems feel simpler.`}</pre>
                </div>
              </div>

              {/* Middle layer — Outdoor (moved from back) */}
              <div className="absolute bottom-[15%] left-0 aspect-[3/4] w-[72%] overflow-hidden rounded-[1rem] border border-[color:var(--border-subtle)] shadow-[0_12px_40px_rgba(107,38,217,0.12)]">
                <Image
                  src="/assets/about/OUTDOOR.png"
                  alt="Outdoor / reflection — Martin Mukoya"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>

              {/* Front layer — Themed code background (kept) */}
              <div className="absolute bottom-[28%] right-[6%] z-10 aspect-[1/1] w-[58%] overflow-hidden rounded-[1rem] border border-[color:var(--border-subtle)] bg-gradient-to-br from-[color:var(--primary)]/20 via-[color:var(--surface)] to-[color:var(--surface-soft)] shadow-[0_16px_50px_rgba(107,38,217,0.15)]">
                <div className="flex h-full items-center justify-center p-6">
                  <pre className="select-none text-center text-[clamp(0.45rem,1.1vw,0.6rem)] leading-[1.35] tracking-[0.06em] text-[color:var(--primary)]/20 font-mono opacity-30" aria-hidden="true">
{`function build() {
  const system = new System();
  system.understand(problem);
  system.design(solution);
  return clarity;
}

// Curiosity > complexity

class System {
  solve() {
    this.simplify();
    this.automate();
    this.scale();
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ─── 2. HOW IT STARTED ─── */}
      <Section className="relative bg-gradient-to-b from-[color:var(--background-elevated)]/95 to-[color:var(--background)]/50">
        <Container className="grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <h2 className="text-balance font-display text-[clamp(1.8rem,3vw,3rem)] font-black leading-[1.06] text-[color:var(--text-strong)]">
              How it started
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[color:var(--text-muted)]">
              Most of what I know about coding came from curiosity, experimentation, YouTube videos,
              blogs, documentation, and building things repeatedly until they worked.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[color:var(--text-muted)]">
              Over time, I became less interested in &ldquo;just websites&rdquo; and more interested
              in how systems, workflows, automation, and people interact.
            </p>
          </Reveal>
          <Reveal>
            <div className="relative mx-auto aspect-[4/3] w-full max-w-[440px] overflow-hidden rounded-[1rem] border border-[color:var(--border-subtle)] shadow-[0_8px_25px_rgba(107,38,217,0.08)]">
              <Image
                src="/assets/about/001.png"
                alt="Coding space — Martin Mukoya"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 90vw, 440px"
              />
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ─── 3. BEYOND THE WEBSITE ─── */}
      <Section>
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Beyond the website"
              title="The real work usually starts behind the interface."
              align="center"
            />
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SystemCard
              icon={<MonitorCog size={20} />}
              title="Lead Capture"
              description="Clear enquiry forms and landing flows that collect the right information without friction."
            />
            <SystemCard
              icon={<CalendarCheck size={20} />}
              title="Booking Systems"
              description="Appointment and scheduling flows that reduce double-handling for customers and teams."
            />
            <SystemCard
              icon={<MessageCircle size={20} />}
              title="Customer Follow-up"
              description="Structured response paths for leads and enquiries so nothing falls through."
            />
            <SystemCard
              icon={<Bot size={20} />}
              title="AI Automation"
              description="Automated workflows that handle repetitive tasks and keep business operations moving."
            />
          </div>
        </Container>
      </Section>

      {/* ─── 4. TEACHING SHAPED HOW I BUILD ─── */}
      <Section className="relative bg-gradient-to-b from-[color:var(--background-elevated)]/95 to-[color:var(--background)]/50">
        <Container className="grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <h2 className="text-balance font-display text-[clamp(1.8rem,3vw,3rem)] font-black leading-[1.06] text-[color:var(--text-strong)]">
              Teaching shaped how I build.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[color:var(--text-muted)]">
              Teaching science taught me how to simplify complexity, communicate clearly, and think
              in systems. That mindset now shapes how I approach technology and business problems.
            </p>
            <div className="mt-8 rounded-[20px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6 shadow-[0_3px_10px_rgba(0,0,0,0.05)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-3 text-[color:var(--primary-light)]" aria-hidden="true">
                <path d="M9.5 4A7.5 7.5 0 0 0 2 11.5V20h6v-8H4.5a4.5 4.5 0 0 1 4-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21.5 11.5A7.5 7.5 0 0 0 14 4v8.5h-3.5V20h11v-8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-base leading-7 font-semibold text-[color:var(--text-strong)]">
                Good systems should feel easier to use, not harder to understand.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[380px] overflow-hidden rounded-[1rem] border border-[color:var(--border-subtle)] shadow-[0_8px_25px_rgba(107,38,217,0.08)]">
              <Image
                src="/assets/about/TEACHING.png"
                alt="Teaching / classroom — Martin Mukoya"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 80vw, 380px"
              />
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ─── 5. PRACTICAL OVER COMPLICATED ─── */}
      <Section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(79,79,79,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,79,79,0.1)_1px,transparent_1px)] bg-[size:14px_24px] opacity-50 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"
        />
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance font-display text-[clamp(1.8rem,3vw,3rem)] font-black leading-[1.06] text-[color:var(--text-strong)]">
              Practical over complicated.
            </h2>
          </Reveal>
          <div className="mx-auto mt-12 grid max-w-4xl gap-3 sm:grid-cols-2">
            <PhilosophyCard text="Good systems create clarity." />
            <PhilosophyCard text="Automation should support people." />
            <PhilosophyCard text="The flow behind the website matters." />
            <PhilosophyCard text="Simple experiences build trust." />
          </div>
        </Container>
      </Section>

      {/* ─── 6. FINAL CTA ─── */}
      <Section className="relative bg-gradient-to-b from-[color:var(--background-elevated)]/95 to-[color:var(--background)]/50">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-[color:var(--primary)]/8 blur-[120px]" />
        </div>
        <Container>
          <Reveal scale={0.98} distance={20}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-balance font-display text-[clamp(2rem,calc(1.45rem+2.5vw),3.5rem)] font-black leading-tight text-[color:var(--text-strong)]">
                Let&rsquo;s build something that actually works.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-[color:var(--text-muted)]">
                If you need clearer customer flow, better operations, or systems that feel easier to
                manage, let&rsquo;s talk.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="motion-sheen">
                  <TrackedLink siteSlug={site.slug} eventType="cta_click" eventPage="/about" eventSource="about_cta" href="/start-project">
                    Start a Project <ArrowRight size={18} />
                  </TrackedLink>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <TrackedAnchor siteSlug={site.slug} eventType="whatsapp_click" eventPage="/about" eventSource="about_whatsapp" href={site.contact.whatsappHref} target="_blank" rel="noopener noreferrer">
                    <MessageCircle size={18} /> WhatsApp Martin
                  </TrackedAnchor>
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

/* ─── Sub-components ─── */

function SystemCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Reveal>
      <article className="group relative h-full rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6 shadow-[0_3px_10px_rgba(0,0,0,0.06)] transition duration-300 hover:border-[color:var(--primary)]/40 hover:shadow-[0_8px_30px_rgba(107,38,217,0.12)]">
        <div className="absolute inset-0 rounded-[18px] bg-gradient-to-br from-[color:var(--primary)]/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative">
          <div className="grid h-11 w-11 place-items-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] text-[color:var(--primary)] shadow-[0_0_20px_rgba(107,38,217,0.08)]">
            {icon}
          </div>
          <h3 className="text-balance mt-4 font-display text-lg font-black text-[color:var(--text-strong)]">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">{description}</p>
        </div>
      </article>
    </Reveal>
  );
}

function PhilosophyCard({ text }: { text: string }) {
  return (
    <Reveal>
      <div className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)]/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition duration-200 hover:border-[color:var(--primary)]/30 hover:bg-[color:var(--surface)]">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--primary)]/10 text-[color:var(--primary)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <p className="text-sm font-bold leading-6 text-[color:var(--text-strong)]">{text}</p>
        </div>
      </div>
    </Reveal>
  );
}

/* ─── FlexTech minimal about page ─── */
function FlexTechAboutPage() {
  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Badge className="mb-6">About FlexTech</Badge>
          <h1 className="text-balance font-display text-[clamp(2.4rem,4vw,4rem)] font-black leading-[1.02] tracking-[-0.02em] text-[color:var(--text-strong)]">
            Digital media work with practical systems underneath.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[color:var(--text-muted)]">
            FlexTech Media exists for brands that need more than a nice page. The work combines
            visual direction, clear copy, enquiry capture, content structure, and the tracking needed
            to know what is working.
          </p>
        </div>
      </Container>
    </Section>
  );
}
