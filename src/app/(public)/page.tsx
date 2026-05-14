import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Github, Linkedin, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";

export default function HomePage() {
  return (
    <Section className="min-h-[calc(100vh-122px)] overflow-hidden">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Badge>Business systems developer in Namibia</Badge>
          <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.75rem,7vw,6rem)] font-black leading-[0.94] text-[color:var(--text-strong)]">
            I build practical systems that turn visitors into clients.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--text-muted)]">
            Websites, booking systems, ecommerce flows, and AI automations for businesses that need clearer leads, less manual work, and stronger follow-up.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/start-project">
                Start Your Project <ArrowRight size={18} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/projects">View Case Studies</Link>
            </Button>
          </div>
          <div className="mt-8 flex items-center gap-3 text-[color:var(--text-muted)]">
            <a aria-label="GitHub" className="rounded-full border border-[color:var(--border-subtle)] p-3 transition hover:text-[color:var(--text-strong)]" href="https://github.com/" target="_blank">
              <Github size={18} />
            </a>
            <a aria-label="LinkedIn" className="rounded-full border border-[color:var(--border-subtle)] p-3 transition hover:text-[color:var(--text-strong)]" href="https://linkedin.com/" target="_blank">
              <Linkedin size={18} />
            </a>
            <a aria-label="Email Martin" className="rounded-full border border-[color:var(--border-subtle)] p-3 transition hover:text-[color:var(--text-strong)]" href="mailto:info@martinmukoya.com">
              <Mail size={18} />
            </a>
          </div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-[520px]">
          <div className="absolute inset-8 rounded-full bg-[rgba(85,49,113,0.24)] blur-3xl" />
          <div className="relative h-full overflow-hidden rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface)] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
            <Image src="/assets/site/02.JPG" alt="Martin Mukoya" fill priority className="object-cover" sizes="(max-width: 768px) 90vw, 520px" />
          </div>
          <div className="absolute bottom-10 left-8 rounded-full border border-[rgba(34,197,94,0.35)] bg-[color:var(--surface)] px-4 py-2 text-sm font-bold text-[color:var(--text-strong)] shadow-xl">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#22C55E]" />
            Available now
          </div>
        </div>
      </Container>
    </Section>
  );
}
