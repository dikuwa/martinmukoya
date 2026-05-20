"use client";

import { Reveal } from "@/components/public/motion";
import { ProjectCard } from "@/components/public/project-card";
import type { PublicProject } from "@/lib/public-content";
import { useMemo, useState } from "react";

export function ProjectsClient({ projects, siteSlug }: { projects: PublicProject[]; siteSlug?: string }) {
  const serviceFilters = ["All", ...Array.from(new Set(projects.flatMap((project) => project.services)))];
  const [activeFilter, setActiveFilter] = useState("All");
  const displayedProjects = useMemo(
    () => (activeFilter === "All" ? projects : projects.filter((project) => project.services.includes(activeFilter))),
    [activeFilter, projects]
  );

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {serviceFilters.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[0.68rem] font-bold leading-none transition ${
                isActive
                  ? "border-[color:var(--primary)] bg-[color:var(--primary)]/15 text-[color:var(--text-strong)]"
                  : "border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] text-[color:var(--text-muted)] hover:border-[color:var(--primary)] hover:bg-[color:var(--primary)]/10 hover:text-[color:var(--text-strong)]"
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 mt-6">
        {displayedProjects.map((project, index) => (
          <Reveal key={project.slug} delay={index * 0.05}>
            <ProjectCard project={project} siteSlug={siteSlug} />
          </Reveal>
        ))}
      </div>
    </>
  );
}
