import { Reveal } from "@/components/public/motion";
import { ProjectsClient } from "@/components/public/projects-client";
import { SectionHeading } from "@/components/public/section-heading";
import { Container, Section } from "@/components/ui/container";
import { projects } from "@/lib/site-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description: "Case studies by Martin Mukoya covering booking systems, lead-generation websites, ecommerce, and automation."
};

export default function ProjectsPage() {
  return (
    <>
      <Section className="pb-10">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Projects"
              title="Selected systems, case studies, and business outcomes."
              description="These examples show the kind of practical work Martin builds: clear customer journeys, useful admin flows, and dependable foundations for future improvements."
            />
          </Reveal>
        </Container>
      </Section>
      <Section className="pt-0 bg-gradient-to-b from-[color:var(--background-elevated)]/90 to-[color:var(--background)]/50">
        <Container>
          <ProjectsClient projects={projects} />
        </Container>
      </Section>
    </>
  );
}
