"use client";

import { Reveal } from "@/components/public/motion";
import { FlexTechProjectCard, ProjectCard } from "@/components/public/project-card";
import type { PublicProject } from "@/lib/public-content";
import { BriefcaseBusiness, Filter, Layers3 } from "lucide-react";
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
      <div className="rounded-[28px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-4 shadow-[0_18px_60px_rgba(107,38,217,0.10)] sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[color:var(--primary)]/12 text-[color:var(--primary)]">
              <Filter size={19} />
            </span>
            <div>
              <p className="text-sm font-black text-[color:var(--text-strong)]">Filter case studies</p>
              <p className="text-xs leading-5 text-[color:var(--text-muted)]">
                Showing {displayedProjects.length} of {projects.length} projects
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {serviceFilters.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] ${
                    isActive
                      ? "border-[color:var(--primary)] bg-[color:var(--primary)]/15 text-[color:var(--text-strong)] shadow-[0_8px_24px_rgba(107,38,217,0.12)]"
                      : "border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] text-[color:var(--text-muted)] hover:border-[color:var(--primary)]/45 hover:bg-[color:var(--primary)]/10 hover:text-[color:var(--text-strong)]"
                  }`}
                >
                  {filter === "All" ? <Layers3 size={14} /> : <BriefcaseBusiness size={14} />}
                  {filter}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {displayedProjects.map((project, index) => (
          <Reveal key={project.slug} delay={index * 0.05}>
            {siteSlug === "flextech-media" ? (
              <FlexTechProjectCard project={project} siteSlug={siteSlug} />
            ) : (
              <ProjectCard project={project} siteSlug={siteSlug} />
            )}
          </Reveal>
        ))}
      </div>
    </>
  );
}
