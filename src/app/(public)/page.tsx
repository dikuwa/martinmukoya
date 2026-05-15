import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Facebook, Github, Handshake, Linkedin, Mail, MessageCircle, Smartphone, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { FAQList } from "@/components/public/faq-list";
import { Reveal } from "@/components/public/motion";
import { ProjectCard } from "@/components/public/project-card";
import { SectionHeading } from "@/components/public/section-heading";
import { ServiceCard } from "@/components/public/service-card";
import { TestimonialCarousel } from "@/components/public/testimonial-carousel";
import { contact, projects, services, techStack, testimonials } from "@/lib/site-data";

export default function HomePage() {
  const featuredProjects = projects.filter((project) => project.featured);

  return (
    <>
      <Section className="relative overflow-hidden pb-12 pt-14 lg:pb-20 lg:pt-20">
        <Image
          src="/assets/backgrounds/SVG/map-03.svg"
          alt=""
          fill
          priority
          className="pointer-events-none -z-10 object-cover opacity-[0.055] dark:opacity-[0.075]"
          sizes="100vw"
        />
        <Container className="flex flex-col items-center text-center">
          <Reveal className="relative mx-auto aspect-square w-[min(48vw,11.5rem)] sm:w-[12.5rem] lg:w-[13.25rem]">
            <div className="absolute inset-0 rounded-full bg-[rgba(85,49,113,0.15)] blur-2xl" />
            <div className="relative h-full overflow-hidden rounded-full border-[3px] border-[rgba(198,97,63,0.46)] bg-[#F49724] shadow-[0_8px_24px_rgba(0,0,0,0.16)] ring-1 ring-[color:var(--border-subtle)]">
              <Image
                src="/assets/hero-images/webp/hero-image.webp"
                alt="Martin Mukoya"
                fill
                priority
                className="translate-y-2 scale-[1.1] object-cover object-center"
                sizes="(max-width: 640px) 48vw, 212px"
              />
            </div>
            <div className="absolute left-[78%] top-6 whitespace-nowrap rounded-full border border-[rgba(34,197,94,0.35)] bg-[color:var(--surface)] px-4 py-2 text-xs font-bold text-[color:var(--text-strong)] shadow-[0_3px_10px_rgba(0,0,0,0.08)] sm:text-sm">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#22C55E]" />
              Available now
            </div>
          </Reveal>

          <Reveal className="mt-9 flex flex-col items-center" delay={0.08}>
            <Badge>Business systems developer in Namibia</Badge>
            <h1 className="mt-6 max-w-5xl font-display text-[clamp(2.45rem,calc(1.9rem+3.6vw),5.45rem)] font-black leading-[0.94] text-[color:var(--text-strong)]">
              I build practical systems that turn visitors into clients.
            </h1>
            <p className="mt-6 max-w-2xl text-[clamp(1rem,calc(0.94rem+0.32vw),1.125rem)] leading-8 text-[color:var(--text-muted)]">
              Websites, booking systems, ecommerce flows, and AI automations for businesses that need clearer leads, less manual work, and stronger follow-up.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/start-project">
                  Start Your Project <ArrowRight size={18} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/projects">View Case Studies</Link>
              </Button>
            </div>
            <SocialLinks />
          </Reveal>
        </Container>
        <Container className="mt-12">
          <div className="flex flex-wrap items-center justify-center gap-2 border-y border-[color:var(--border-subtle)] py-5">
            {techStack.map((tech) => (
              <span key={tech} className="rounded-full bg-white/[0.04] px-4 py-2 text-xs font-bold text-[color:var(--text-faint)]">
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
              title="Business-first systems for the work that matters."
              description="Each service is shaped around a practical outcome: more qualified enquiries, fewer repeated tasks, clearer operations, and smoother customer journeys."
            />
          </Reveal>
          <div className="mt-10 grid gap-x-12 gap-y-2 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => (
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
              eyebrow="Featured work"
              title="Case studies built around real business problems."
              description="The strongest work is not just attractive. It captures the right information, supports the team behind the scenes, and makes the next action obvious."
            />
          </Reveal>
          <div className="mt-10 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredProjects.map((project, index) => (
              <Reveal key={project.slug} delay={index * 0.05}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Why work with me"
              title="Why choose a practical build?"
              description="A good build gives the business owner clarity. What came in? What needs a response? What should be automated? What should stay human?"
              align="center"
            />
          </Reveal>
          <div className="mx-auto mt-12 grid max-w-5xl gap-10 text-center md:grid-cols-3">
            {[
              {
                icon: Target,
                title: "Conversion focus",
                description: "CTAs, forms, and follow-up paths are treated as product features."
              },
              {
                icon: Smartphone,
                title: "Mobile-first execution",
                description: "Key flows are designed for the phones most customers actually use."
              },
              {
                icon: Handshake,
                title: "Plain-English planning",
                description: "The work starts with the business goal, not a stack list."
              }
            ].map(({ icon: Icon, title, description }, index) => (
              <Reveal key={title} delay={index * 0.05}>
                <div>
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[color:var(--border-subtle)] bg-white/[0.03] text-[color:var(--accent)]">
                    <Icon size={28} />
                  </div>
                  <h3 className="mt-6 font-display text-xl font-black text-[color:var(--text-strong)]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">{description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="technical-bg bg-[color:var(--background)]">
        <Container className="overflow-hidden">
          <Reveal>
            <SectionHeading eyebrow="Testimonials" title="Useful systems leave people with less to chase." align="center" />
          </Reveal>
          <TestimonialCarousel items={testimonials} />
        </Container>
      </Section>

      <Section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[color:var(--background)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(79,79,79,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,79,79,0.18)_1px,transparent_1px)] bg-[size:14px_24px] opacity-45 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <Container className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
          <Reveal className="self-center">
            <SectionHeading
              eyebrow="About"
              title="More than just lines of code."
              description="👋 Hi there! I'm a science teacher by day and a curious human all the time. My life is a happy collision of lesson plans, bug reports, birdsong, and dog-eared books. I believe the best ideas live at the intersection of the natural world and the digital one, and I'm always trying to find them."
            />
            <Button asChild className="mt-7" variant="secondary">
              <Link href="/about">More About Martin</Link>
            </Button>
          </Reveal>
          <Reveal className="relative mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-[22px] self-center">
            <Image src="/assets/hero-images/webp/about.webp" alt="Martin Mukoya outside the code editor" fill className="object-cover" sizes="(max-width: 768px) 100vw, 520px" />
          </Reveal>
        </Container>
      </Section>

      <Section className="relative overflow-hidden bg-[color:var(--background-elevated)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-[0.055] blur-[1px] dark:opacity-[0.08]"
          style={{ backgroundImage: "url('/assets/backgrounds/SVG/SVG/bg-FAQ.svg')" }}
        />
        <Container className="relative z-10">
          <Reveal>
            <SectionHeading eyebrow="FAQ" title="Straight answers before we start." align="center" />
          </Reveal>
          <Reveal className="mx-auto mt-10 max-w-4xl">
            <FAQList limit={4} />
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <div className="mx-auto max-w-4xl text-center">
              <Badge>Ready to build?</Badge>
              <h2 className="mt-4 font-display text-[clamp(2rem,calc(1.45rem+2.5vw),4rem)] font-black leading-tight text-[color:var(--text-strong)]">
                  Let’s turn the next enquiry into a cleaner system.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[color:var(--text-muted)]">
                  Send the goal, the current friction, and the kind of customers you want to serve better.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/start-project">Start Your Project</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <a href={contact.whatsappHref} target="_blank" rel="noreferrer">WhatsApp Martin</a>
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

function SocialLinks() {
  return (
    <div className="mt-8 flex items-center gap-3 text-[color:var(--text-muted)]">
      <a aria-label="GitHub" className="rounded-full border border-[color:var(--border-subtle)] p-3 transition hover:text-[color:var(--text-strong)]" href={contact.github} target="_blank" rel="noreferrer">
        <Github size={18} />
      </a>
      <a aria-label="LinkedIn" className="rounded-full border border-[color:var(--border-subtle)] p-3 transition hover:text-[color:var(--text-strong)]" href={contact.linkedin} target="_blank" rel="noreferrer">
        <Linkedin size={18} />
      </a>
      <a aria-label="Facebook" className="rounded-full border border-[color:var(--border-subtle)] p-3 transition hover:text-[color:var(--text-strong)]" href={contact.facebook} target="_blank" rel="noreferrer">
        <Facebook size={18} />
      </a>
      <a aria-label="Email Martin" className="rounded-full border border-[color:var(--border-subtle)] p-3 transition hover:text-[color:var(--text-strong)]" href={`mailto:${contact.email}`}>
        <Mail size={18} />
      </a>
      <a aria-label="WhatsApp Martin" className="rounded-full border border-[color:var(--border-subtle)] p-3 transition hover:text-[color:var(--text-strong)]" href={contact.whatsappHref} target="_blank" rel="noreferrer">
        <MessageCircle size={18} />
      </a>
    </div>
  );
}
