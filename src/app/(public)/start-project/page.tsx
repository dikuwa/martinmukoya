import { Reveal } from "@/components/public/motion";
import { StartProjectWizard } from "@/components/public/start-project-wizard";
import { Badge } from "@/components/ui/badge";
import { Container, Section } from "@/components/ui/container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start Project",
  description: "Start a project with Martin Mukoya for a website, booking system, ecommerce flow, or AI automation."
};

export default function StartProjectPage() {
  return (
    <Section className="relative overflow-hidden bg-[color:var(--background-elevated)] pb-12 pt-12 lg:pb-16 lg:pt-16">
      <Container>
        <Reveal className="mx-auto max-w-5xl text-center">
          <Badge>Start a project</Badge>
          <h1 className="mt-6 font-display text-[clamp(2.25rem,calc(1.7rem+3vw),4.25rem)] font-black leading-none text-[color:var(--text-strong)]">
            Start your project with clear services, budget, and timeline.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-[clamp(1rem,calc(0.95rem+0.5vw),1.2rem)] leading-8 text-[color:var(--text-muted)]">
            Choose the services you need, indicate your price range, and set a timeline so your brief is ready for action.
          </p>
        </Reveal>
        <Reveal className="mt-10" delay={0.08}>
          <StartProjectWizard />
        </Reveal>
      </Container>
    </Section>
  );
}
