import { FAQList } from "@/components/public/faq-list";
import { Reveal } from "@/components/public/motion";
import { FlexTechProjectCard, ProjectCard } from "@/components/public/project-card";
import { SectionHeading } from "@/components/public/section-heading";
import { ServiceCard } from "@/components/public/service-card";
import { TestimonialCarousel } from "@/components/public/testimonial-carousel";
import { TestimonialMarquee } from "@/components/public/testimonial-marquee";
import { TrackedAnchor } from "@/components/public/tracked-anchor";
import { TrackedLink } from "@/components/public/tracked-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { getPublicContent } from "@/lib/public-content";
import { getPublicSiteConfig, type PublicSiteConfig } from "@/lib/public-site-config";
import { getCurrentSite } from "@/lib/sites";
import { cn } from "@/lib/utils";
import { ArrowRight, Facebook, Github, Handshake, Linkedin, Mail, MessageCircle, Smartphone, Target, Zap } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);

  const pageTitle = site.slug === "flextech-media" ? "Digital Media Agency" : "Business Systems Developer";

  return {
    title: pageTitle,
    description: site.home.heroDescription,
    openGraph: {
      title: `${pageTitle} | ${site.brandName}`,
      description: site.home.heroDescription,
      images: [site.home.heroImage]
    },
    twitter: {
      card: "summary_large_image",
      title: `${pageTitle} | ${site.brandName}`,
      description: site.home.heroDescription,
      images: [site.home.heroImage]
    }
  };
}

export default async function HomePage() {
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);
  const home = site.home;

  const content = await getPublicContent(site, currentSite?.id);
  const featuredProjects = content.featuredProjects;
  const testimonials = content.testimonials;

  return (
    <>
      <Section className={cn("motion-hero-stage relative overflow-hidden pb-12 pt-14 lg:pb-20 lg:pt-20", site.slug === "flextech-media" ? "bg-[color:var(--background)]" : "") }>
        {site.slug !== "flextech-media" && (
          <Image
            src="/assets/backgrounds/SVG/map-03.svg"
            alt=""
            fill
            priority
            className="pointer-events-none -z-10 object-cover opacity-[0.055] dark:opacity-[0.075]"
            sizes="100vw"
          />
        )}
        {site.slug === "flextech-media" ? (
          <FlexTechHero site={site} />
        ) : (
          <Container className="flex flex-col items-center text-center">
            <MartinHeroVisual site={site} />
            <HeroCopy site={site} className="mt-9" />
          </Container>
        )}
        <Container className="mt-12">
          <div className="flex flex-wrap items-center justify-center gap-2 border-y border-[color:var(--border-subtle)] py-5">
            {home.techStack.map((tech, index) => (
              <span
                key={`${site.slug}-home-tech-${tech}-${index}`}
                className="motion-chip rounded-full bg-white/[0.04] px-4 py-2 text-xs font-bold text-[color:var(--text-faint)]"
                style={{ animationDelay: `${0.18 + index * 0.045}s` }}
              >
                {tech}
              </span>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="technical-bg">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Services"
              title={home.servicesTitle}
              description={home.servicesDescription}
            />
          </Reveal>
          <div className="mt-10 grid gap-x-12 gap-y-2 md:grid-cols-2 lg:grid-cols-4">
            {site.services.map((service, index) => (
              <Reveal key={service.id} delay={index * 0.05}>
                <ServiceCard service={service} />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="technical-bg bg-[color:var(--background-elevated)]">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={home.workEyebrow}
              title={home.workTitle}
              description={home.workDescription}
            />
          </Reveal>
          <div className="mt-10 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredProjects.map((project, index) => (
              <Reveal key={project.slug} delay={index * 0.05}>
                {site.slug === "flextech-media" ? (
                  <FlexTechProjectCard project={project} siteSlug={site.slug} />
                ) : (
                  <ProjectCard project={project} siteSlug={site.slug} />
                )}
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="relative bg-[color:var(--surface-soft)]/95">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={site.slug === "flextech-media" ? "Working approach" : "Why work with me"}
              title={home.reasonsTitle}
              description={home.reasonsDescription}
              align="center"
            />
          </Reveal>

          {site.slug === "flextech-media" ? (
            <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
              {home.reasons.map(({ title, description }, index) => {
                const Icon = [Target, Smartphone, Zap][index] ?? Target;
                return (
                  <Reveal key={title} delay={index * 0.05}>
                    <div className="group relative h-full rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-7 shadow-[0_3px_10px_rgba(0,0,0,0.06)] transition duration-300 hover:border-[color:var(--primary)]/40 hover:shadow-[0_8px_30px_rgba(107,38,217,0.12)]">
                      <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-[color:var(--primary)]/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="relative">
                        <div className="grid h-12 w-12 place-items-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] text-[color:var(--primary)] shadow-[0_0_20px_rgba(107,38,217,0.08)]">
                          <Icon size={20} />
                        </div>
                        <h3 className="text-balance mt-5 font-display text-xl font-black text-[color:var(--text-strong)]">{title}</h3>
                        <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">{description}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          ) : (
            <div className="mx-auto mt-10 grid max-w-5xl gap-10 text-center md:grid-cols-3">
              {home.reasons.map(({ title, description }, index) => {
                const Icon = [Target, Smartphone, Handshake][index] ?? Target;
                return (
                  <Reveal key={title} delay={index * 0.05}>
                    <div>
                      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] text-[color:var(--primary)]">
                        <Icon size={28} />
                      </div>
                      <h3 className="text-balance mt-6 font-display text-xl font-black text-[color:var(--text-strong)]">{title}</h3>
                      <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">{description}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </Container>
      </Section>

      <Section className="relative bg-gradient-to-b from-[color:var(--background-elevated)]/95 to-[color:var(--background)]/50 overflow-hidden">
        <Container className="overflow-hidden">
          <Reveal>
            <SectionHeading eyebrow="Testimonials" title={home.testimonialsTitle} align="center" />
          </Reveal>
          {site.slug === "flextech-media" ? (
            <TestimonialMarquee items={testimonials} />
          ) : (
            <TestimonialCarousel items={testimonials} siteSlug={site.slug} />
          )}
        </Container>
      </Section>

      <Section className="relative overflow-hidden bg-gradient-to-b from-[color:var(--background)]/50 to-[color:var(--background)]">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(79,79,79,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,79,79,0.1)_1px,transparent_1px)] bg-[size:14px_24px] opacity-50 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        <Container className={cn("grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]")}>
          <Reveal className={cn(site.slug === "flextech-media" ? "self-start" : "self-center")}>
            <SectionHeading
              eyebrow="About"
              title={home.aboutTitle}
              description={home.aboutDescription}
            />
            {site.slug === "flextech-media" ? (
              <>
                <p className="mt-5 text-sm leading-7 text-[color:var(--text-muted)]">
                  The focus is not just visual polish. Every system is structured to improve follow-up, reduce friction, and help teams respond faster as the business grows.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {["Clear enquiry flow", "Mobile-first journeys", "Practical automation", "Easier customer follow-up"].map((point) => (
                    <span key={point} className="rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-3 py-1.5 text-xs font-semibold text-[color:var(--text-muted)]">
                      {point}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <Button asChild className="mt-7" variant="secondary">
                <Link href="/about">More About {site.brandLines[0]}</Link>
              </Button>
            )}
          </Reveal>
          {site.slug === "flextech-media" ? (
            <Reveal className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-[28px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] shadow-[0_30px_80px_rgba(107,38,217,0.12)] dark:bg-[color:var(--surface)]">
              <div className="relative aspect-[4/5] w-full">
                <Image src="/assets/about/analytics.png" alt="Analytics dashboard overview" fill className="object-cover" sizes="420px" />
              </div>
            </Reveal>
          ) : (
            <Reveal className="relative mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-[22px] self-center">
              <Image src={home.aboutImage} alt={home.aboutAlt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 520px" />
            </Reveal>
          )}
        </Container>
      </Section>

      <Section className="relative overflow-hidden bg-[color:var(--background-elevated)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-[0.055] blur-[1px] dark:opacity-[0.08]"
          style={{ backgroundImage: "url('/assets/backgrounds/SVG/SVG/bg-FAQ.svg')" }}
        />
        <Container className="relative z-10">
          {site.slug === "flextech-media" ? (
            <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
              {/* Left: Support panel */}
              <Reveal className="lg:sticky lg:top-32">
                <div className="rounded-[28px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-8 shadow-[0_8px_30px_rgba(107,38,217,0.08)]">
                  <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-full bg-[color:var(--surface-soft)] ring-2 ring-[color:var(--primary)]/20 lg:mx-0">
                    <Image src="/assets/FAQs/FAQ.webp" alt="" fill className="object-cover" sizes="64px" />
                  </div>
                  <h3 className="text-balance mt-5 font-display text-xl font-black text-[color:var(--text-strong)]">Got a question? Let&rsquo;s chat.</h3>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
                    I&rsquo;m happy to explain the process, discuss ideas, or help you understand what makes the most sense for your business.
                  </p>
                  <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                    <TrackedAnchor
                      siteSlug={site.slug}
                      eventType="email_click"
                      eventPage="/"
                      eventSource="faq_contact"
                      href={`mailto:${site.contact.email}`}
                      className="inline-flex items-center justify-center gap-2 rounded-[1rem] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-5 py-3 text-xs font-bold text-[color:var(--text-normal)] transition hover:border-[color:var(--primary)] hover:bg-[color:var(--primary)]/10"
                    >
                      <Mail size={14} /> Send an email
                    </TrackedAnchor>
                    <TrackedAnchor
                      siteSlug={site.slug}
                      eventType="whatsapp_click"
                      eventPage="/"
                      eventSource="faq_contact"
                      href={site.contact.whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-[1rem] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-5 py-3 text-xs font-bold text-[color:var(--text-normal)] transition hover:border-[color:var(--primary)] hover:bg-[color:var(--primary)]/10"
                    >
                      <MessageCircle size={14} /> Text on WhatsApp
                    </TrackedAnchor>
                  </div>
                </div>
              </Reveal>

              {/* Right: FAQ accordion */}
              <Reveal>
                <SectionHeading
                  eyebrow="FAQ"
                  title="Questions that usually come up before we start."
                  align="left"
                />
                <div className="mt-6">
                  <FAQList items={content.faqs} limit={4} variant="soft" />
                </div>
              </Reveal>
            </div>
          ) : (
            <>
              <Reveal>
                <SectionHeading eyebrow="FAQ" title="Straight answers before we start." align="center" />
              </Reveal>
              <Reveal className="mx-auto mt-10 max-w-4xl">
                <FAQList items={content.faqs} limit={4} />
              </Reveal>
            </>
          )}
        </Container>
      </Section>

      {/* Final CTA moved to shared component `FinalCTA` rendered in layout */}
    </>
  );
}

function SocialLinks({ site }: { site: PublicSiteConfig }) {
  if (site.slug === "flextech-media") {
    const faces = [
      "/assets/UI Faces/10.webp",
      "/assets/UI Faces/17.webp",
      "/assets/UI Faces/2.webp",
      "/assets/UI Faces/20.webp",
      "/assets/UI Faces/5.webp"
    ];

    return (
        <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-center">
          <div className="motion-avatar-stack flex -space-x-4">
            {faces.map((src, index) => (
              <div
                key={src}
                className={cn(
                    "relative h-14 w-14 overflow-hidden rounded-full border-2 border-violet-200/70 shadow-[0_18px_40px_rgba(0,0,0,0.12)] transition-colors dark:border-violet-300/50",
                  index === 0 ? "z-30" : index === 4 ? "z-20" : "z-10"
                )}
                style={{ animationDelay: `${0.18 + index * 0.055}s` }}
              >
                <Image src={src} alt={`FlexTech team face ${index + 1}`} fill className="object-cover" sizes="56px" />
              </div>
            ))}
          </div>
        </div>
          <div className="max-w-xl text-center sm:text-left">
            <p className="text-base leading-7 text-[color:var(--text-normal)]">
          Built for businesses that want leads, bookings and measurable growth.
            </p>
          </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <TrackedAnchor
            siteSlug={site.slug}
            eventType="email_click"
            eventPage="/"
            eventSource="hero_contact_cta"
            aria-label={`Email ${site.brandName}`}
            href={`mailto:${site.contact.email}`}
            className="inline-flex items-center justify-center gap-2 rounded-[1rem] bg-[color:var(--primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--primary-light)]"
          >
            <Mail size={16} /> Email
          </TrackedAnchor>
          <TrackedAnchor
            siteSlug={site.slug}
            eventType="whatsapp_click"
            eventPage="/"
            eventSource="hero_contact_cta"
            aria-label={`WhatsApp ${site.brandName}`}
            href={site.contact.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-[1rem] border border-[color:var(--primary)] bg-transparent px-6 py-3 text-sm font-semibold text-[color:var(--text-strong)] transition hover:bg-[color:var(--primary)]/10"
          >
            <MessageCircle size={16} /> WhatsApp
          </TrackedAnchor>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 flex items-center gap-3 text-[color:var(--text-muted)]">
      <a aria-label="GitHub" className="rounded-full border border-[color:var(--border-subtle)] p-3 transition hover:text-[color:var(--text-strong)]" href={site.contact.github} target="_blank" rel="noopener noreferrer">
        <Github size={18} />
      </a>
      <a aria-label="LinkedIn" className="rounded-full border border-[color:var(--border-subtle)] p-3 transition hover:text-[color:var(--text-strong)]" href={site.contact.linkedin} target="_blank" rel="noopener noreferrer">
        <Linkedin size={18} />
      </a>
      <a aria-label="Facebook" className="rounded-full border border-[color:var(--border-subtle)] p-3 transition hover:text-[color:var(--text-strong)]" href={site.contact.facebook} target="_blank" rel="noopener noreferrer">
        <Facebook size={18} />
      </a>
      <TrackedAnchor siteSlug={site.slug} eventType="email_click" eventPage="/" eventSource="hero_socials" aria-label={`Email ${site.brandName}`} className="rounded-full border border-[color:var(--border-subtle)] p-3 transition hover:text-[color:var(--text-strong)]" href={`mailto:${site.contact.email}`}>
        <Mail size={18} />
      </TrackedAnchor>
      <TrackedAnchor siteSlug={site.slug} eventType="whatsapp_click" eventPage="/" eventSource="hero_socials" aria-label={`WhatsApp ${site.brandName}`} className="rounded-full border border-[color:var(--border-subtle)] p-3 transition hover:text-[color:var(--text-strong)]" href={site.contact.whatsappHref} target="_blank" rel="noopener noreferrer">
        <MessageCircle size={18} />
      </TrackedAnchor>
    </div>
  );
}

function HeroCopy({ site, className = "" }: { site: PublicSiteConfig; className?: string }) {
  const home = site.home;
  const isFlexTech = site.slug === "flextech-media";

  return (
    <Reveal className={`flex flex-col ${isFlexTech ? "items-center text-center" : "items-center text-center"} ${className}`} delay={0.08} distance={24} duration={0.74}>
      <Badge className="rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-4 py-2 text-[0.75rem] font-semibold text-[color:var(--text-muted)] dark:bg-[color:var(--surface)] dark:text-[color:var(--text-strong)]">
        {home.eyebrow}
      </Badge>
      <h1 className="text-balance mt-8 max-w-4xl text-[clamp(2.8rem,4vw,5.2rem)] font-display font-black leading-[0.92] tracking-[-0.03em] text-[color:var(--text-strong)]">
        {home.heroTitle}
      </h1>
      <p className="mt-6 max-w-3xl text-base leading-8 text-[color:var(--text-normal)] sm:text-lg">
        {home.heroDescription}
      </p>
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Button asChild size="lg" className="motion-sheen w-full rounded-[1rem] bg-[color:var(--primary)] px-8 py-4 font-semibold text-white shadow-[0_24px_60px_rgba(107,38,217,0.18)] transition hover:bg-[color:var(--primary-light)] sm:w-auto">
          <TrackedLink siteSlug={site.slug} eventType="book_project_clicked" eventPage="/" eventSource="hero_start_project" href="/start-project">
            {home.primaryCta} <ArrowRight size={18} />
          </TrackedLink>
        </Button>
        <Button asChild size="lg" variant="secondary" className="w-full rounded-[1rem] border border-[color:var(--primary)] bg-transparent px-8 py-4 font-semibold text-[color:var(--primary)] transition hover:bg-[color:var(--primary)]/10 sm:w-auto">
          <TrackedLink siteSlug={site.slug} eventType="see_work_clicked" eventPage="/" eventSource="hero_secondary" href={home.secondaryHref}>
            {home.secondaryCta}
          </TrackedLink>
        </Button>
      </div>
      <SocialLinks site={site} />
    </Reveal>
  );
}

function FlexTechHero({ site }: { site: PublicSiteConfig }) {
  const home = site.home;
  const faces = [
    "/assets/UI%20Faces/10.webp",
    "/assets/UI%20Faces/17.webp",
    "/assets/UI%20Faces/2.webp",
    "/assets/UI%20Faces/20.webp",
    "/assets/UI%20Faces/5.webp"
  ];

  return (
    <Container className="relative overflow-hidden rounded-[2rem] bg-[color:var(--background)] px-4 py-16 sm:px-6 lg:px-8">
      <div className="absolute inset-0">
        <Image src={home.heroImage} alt="" fill className="object-cover opacity-20" priority />
        <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--background)]/95 via-[color:var(--surface)]/88 to-[color:var(--primary)]/72" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(107,38,217,0.24),transparent_16%),radial-gradient(circle_at_top_right,rgba(107,38,217,0.18),transparent_20%),radial-gradient(circle_at_75%_18%,rgba(255,255,255,0.12),transparent_15%)]" />
      </div>
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        <Reveal delay={0.04} distance={14}>
          <Badge className="rounded-full bg-[color:var(--surface-soft)] px-4 py-2 text-[0.75rem] font-semibold text-[color:var(--text-muted)]">
            {home.eyebrow}
          </Badge>
        </Reveal>
        <Reveal delay={0.12} distance={28} duration={0.78}>
          <h1 className="text-balance mt-8 text-[clamp(2.8rem,4vw,5.2rem)] font-display font-black leading-[0.92] tracking-[-0.03em] text-[color:var(--text-strong)]">
            {home.heroTitle}
          </h1>
        </Reveal>
        <Reveal delay={0.2} distance={18}>
          <p className="mx-auto mt-6 max-w-3xl text-center text-base leading-8 text-[color:var(--text-normal)] sm:text-lg">
            {home.heroDescription}
          </p>
        </Reveal>
        <Reveal delay={0.28} distance={16}>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="motion-sheen group w-full rounded-[1rem] bg-[color:var(--primary)] px-8 py-4 font-semibold text-white transition hover:bg-[color:var(--primary-light)] sm:w-auto">
            <TrackedLink siteSlug={site.slug} eventType="book_project_clicked" eventPage="/" eventSource="hero_start_project" href="/start-project">
              <span className="inline-flex items-center gap-2">
                {home.primaryCta}
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </TrackedLink>
          </Button>
          <Button asChild size="lg" variant="secondary" className="w-full rounded-[1rem] border border-[color:var(--primary)] bg-transparent px-8 py-4 font-semibold text-[color:var(--text-strong)] transition hover:bg-[color:var(--primary)]/10 sm:w-auto">
            <TrackedLink siteSlug={site.slug} eventType="see_work_clicked" eventPage="/" eventSource="hero_secondary" href={home.secondaryHref}>
              {home.secondaryCta}
            </TrackedLink>
          </Button>
        </div>
        </Reveal>
        <Reveal delay={0.36} direction="up" distance={16}>
        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex items-center justify-center">
            <div className="motion-avatar-stack flex -space-x-4">
              {faces.map((src, index) => (
                <div
                  key={src}
                  className={cn(
                    "relative h-14 w-14 overflow-hidden rounded-full border-2 border-violet-200/70 shadow-[0_18px_40px_rgba(0,0,0,0.12)] transition-colors dark:border-violet-300/50",
                    index === 0 ? "z-30" : index === 4 ? "z-20" : "z-10"
                  )}
                  style={{ animationDelay: `${0.42 + index * 0.055}s` }}
                >
                  <Image src={src} alt={`FlexTech team face ${index + 1}`} fill className="object-cover" sizes="56px" />
                </div>
              ))}
            </div>
          </div>
          <div className="max-w-xl text-center sm:text-left">
            <p className="text-base leading-7 text-[color:var(--text-normal)]">
              Built for businesses that want leads, bookings and measurable growth.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <TrackedAnchor
              siteSlug={site.slug}
              eventType="email_click"
              eventPage="/"
              eventSource="hero_contact_cta"
              aria-label={`Email ${site.brandName}`}
              href={`mailto:${site.contact.email}`}
              className="inline-flex items-center justify-center gap-2 rounded-[1rem] bg-[color:var(--primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--primary-light)]"
            >
              <Mail size={16} /> Email
            </TrackedAnchor>
            <TrackedAnchor
              siteSlug={site.slug}
              eventType="whatsapp_click"
              eventPage="/"
              eventSource="hero_contact_cta"
              aria-label={`WhatsApp ${site.brandName}`}
              href={site.contact.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-[1rem] border border-[color:var(--primary)] bg-transparent px-6 py-3 text-sm font-semibold text-[color:var(--text-strong)] transition hover:bg-[color:var(--primary)]/10"
            >
              <MessageCircle size={16} /> WhatsApp
            </TrackedAnchor>
          </div>
        </div>
        </Reveal>
      </div>
    </Container>
  );
}

function MartinHeroVisual({ site }: { site: PublicSiteConfig }) {
  const home = site.home;

  return (
    <Reveal className="motion-float relative mx-auto aspect-square w-[min(48vw,11.5rem)] sm:w-[12.5rem] lg:w-[13.25rem]" scale={0.96} distance={12} duration={0.8}>
      <div className="motion-orbit absolute inset-0 rounded-full bg-[color:var(--primary)]/15 blur-2xl" />
      <div className="relative h-full overflow-hidden rounded-full border-2 border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)]/70 shadow-[0_8px_24px_rgba(0,0,0,0.16)] ring-1 ring-[color:var(--border-subtle)]">
        <Image
          src={home.heroImage}
          alt={home.heroAlt}
          fill
          priority
          unoptimized
          className="scale-[1.08] object-cover object-center"
          sizes="(max-width: 640px) 48vw, 212px"
        />
      </div>
      <div className="motion-presence-chip absolute left-[78%] top-6 whitespace-nowrap rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface)]/95 px-4 py-2 text-xs font-bold text-[color:var(--text-strong)] shadow-[0_3px_10px_rgba(0,0,0,0.08)] transition hover:bg-[color:var(--surface-soft)] sm:text-sm">
        <span className="relative mr-2 inline-flex h-2.5 w-2.5">
          <span className="absolute inset-0 rounded-full bg-[#22C55E]/40 animate-ping" />
          <span className="relative inline-block h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
        </span>
        {site.availability}
      </div>
    </Reveal>
  );
}
