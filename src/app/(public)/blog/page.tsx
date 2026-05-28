import { BlogClient } from "@/components/public/blog-client";
import { Reveal } from "@/components/public/motion";
import { SectionHeading } from "@/components/public/section-heading";
import { Container, Section } from "@/components/ui/container";
import { getPublicContent } from "@/lib/public-content";
import { getPublicSiteConfig } from "@/lib/public-site-config";
import { getCurrentSite } from "@/lib/sites";
import { cn } from "@/lib/utils";
import { webPageSchema } from "@/lib/schema";
import { withCanonical } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);

  return withCanonical({
    title: "Blog",
    description: site.pages.blog.metadataDescription,
    openGraph: {
      title: `Blog | ${site.brandName}`,
      description: site.pages.blog.metadataDescription
    },
    twitter: {
      card: "summary_large_image",
      title: `Blog | ${site.brandName}`,
      description: site.pages.blog.metadataDescription
    }
  }, "/blog", site.slug);
}

export default async function BlogPage() {
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);
  const content = await getPublicContent(site, currentSite?.id);
  const page = site.pages.blog;
  const isFlexTech = site.slug === "flextech-media";

  const breadcrumbSchema = webPageSchema({
    name: "Blog | " + site.brandName,
    description: page.metadataDescription,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" }
    ],
    url: "/blog"
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Section className={cn("pb-10", isFlexTech && "pb-8")}>
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Blog"
              title={page.title}
              description={page.description}
              align="center"
            />
          </Reveal>
        </Container>
      </Section>
      <Section className={cn("pt-0", isFlexTech
        ? "bg-[color:var(--background)]"
        : "bg-gradient-to-b from-[color:var(--background-elevated)]/90 to-[color:var(--background)]/50"
      )}>
        <Container>
          <BlogClient posts={content.blogPosts} siteSlug={site.slug} />
        </Container>
      </Section>
    </>
  );
}
