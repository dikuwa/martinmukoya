import { webPageSchema } from "@/lib/schema";
import { ProjectCaseStudy } from "@/components/public/project-case-study";
import { getPublicContent } from "@/lib/public-content";
import { publicSiteConfigs } from "@/lib/public-site-config";
import { getOverriddenPublicSiteConfig } from "@/lib/site-overrides";
import { absoluteUrl, canonicalSiteForSharedContent, PRIMARY_SITE_SLUG, siteUrl, withCanonical } from "@/lib/seo";
import { getCurrentSite } from "@/lib/sites";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.values(publicSiteConfigs).flatMap((site) => site.projects.map((project) => ({ slug: project.slug })));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const currentSite = await getCurrentSite();
  const site = await getOverriddenPublicSiteConfig(currentSite?.slug);
  const content = await getPublicContent(site, currentSite?.id);
  const project = content.projects.find((item) => item.slug === slug);

  if (!project) {
    return { title: "Project not found" };
  }

  const isSharedWithPrimary = publicSiteConfigs[PRIMARY_SITE_SLUG].projects.some((item) => item.slug === project.slug);

  return withCanonical({
    title: project.title,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      images: [project.coverImage]
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.summary,
      images: [project.coverImage]
    }
  }, `/projects/${project.slug}`, site.slug, { canonicalSiteSlug: canonicalSiteForSharedContent(site.slug, isSharedWithPrimary) });
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const currentSite = await getCurrentSite();
  const site = await getOverriddenPublicSiteConfig(currentSite?.slug);
  const content = await getPublicContent(site, currentSite?.id);
  const project = content.projects.find((item) => item.slug === slug);

  if (!project) {
    notFound();
  }
  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    image: absoluteUrl(project.coverImage),
    url: absoluteUrl(`/projects/${project.slug}`),
    creator: { "@type": site.slug === "flextech-media" ? "Organization" : "Person", name: site.brandName, url: siteUrl },
    about: project.services,
    keywords: project.techStack.join(", ")
  };

  const breadcrumbSchema = webPageSchema({
    name: `${project.title} | ${site.brandName}`,
    description: project.summary,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Projects", url: "/projects" },
      { name: project.title, url: `/projects/${project.slug}` }
    ],
    url: `/projects/${project.slug}`
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ProjectCaseStudy project={project} site={site} />
    </>
  );
}
