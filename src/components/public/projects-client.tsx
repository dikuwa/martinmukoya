"use client";

import { Reveal } from "@/components/public/motion";
import { ProjectCard } from "@/components/public/project-card";
import { useMemo, useState } from "react";

type Project = (typeof import("@/lib/site-data").projects)[number];

export function ProjectsClient({ projects }: { projects: Project[] }) {
  const serviceFilters = ["All", "Booking Systems", "Web Applications", "E-commerce", "Automation"];
  const [activeFilter, setActiveFilter] = useState("All");
  const displayedProjects = useMemo(
    () => (activeFilter === "All" ? projects : projects.filter((project) => project.services.includes(activeFilter))),
    [activeFilter, projects]
  );

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        {serviceFilters.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold transition ${
                isActive
                  ? "border-[color:var(--accent)] bg-[color:var(--accent)]/15 text-[color:var(--text-strong)]"
                  : "border-[color:var(--border-subtle)] bg-white/[0.04] text-[color:var(--text-muted)] hover:border-[color:var(--accent)] hover:bg-[color:var(--accent)]/10 hover:text-[color:var(--text-strong)]"
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
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </>
  );
}
