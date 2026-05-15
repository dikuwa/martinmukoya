import type { Metadata } from "next";
import { ProjectCard } from "@/components/public/project-card";
import { Reveal } from "@/components/public/motion";
import { SectionHeading } from "@/components/public/section-heading";
import { Badge } from "@/components/ui/badge";
import { Container, Section } from "@/components/ui/container";
import { projects } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Projects",
  description: "Case studies by Martin Mukoya covering booking systems, lead-generation websites, ecommerce, and automation."
};

export default function ProjectsPage() {
  const serviceFilters = ["All", "Booking Systems", "Web Applications", "E-commerce", "Automation"];

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
          <div className="mt-8 flex flex-wrap gap-2">
            {serviceFilters.map((filter, index) => (
              <Badge
                key={filter}
                className={index === 0 ? "border-[color:var(--accent)] bg-[rgba(198,97,63,0.1)] text-[color:var(--text-strong)]" : ""}
              >
                {filter}
              </Badge>
            ))}
          </div>
        </Container>
      </Section>
      <Section className="pt-0">
        <Container>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project, index) => (
              <Reveal key={project.slug} delay={index * 0.05}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
