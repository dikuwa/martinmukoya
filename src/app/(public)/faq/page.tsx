import type { Metadata } from "next";
import { FAQList } from "@/components/public/faq-list";
import { Reveal } from "@/components/public/motion";
import { SectionHeading } from "@/components/public/section-heading";
import { Container, Section } from "@/components/ui/container";
import { getPublicContent } from "@/lib/public-content";
import { getPublicSiteConfig } from "@/lib/public-site-config";
import { getCurrentSite } from "@/lib/sites";

export async function generateMetadata(): Promise<Metadata> {
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);

  return {
    title: "FAQ",
    description: site.pages.faq.metadataDescription,
    openGraph: {
      title: `FAQ | ${site.brandName}`,
      description: site.pages.faq.metadataDescription,
      url: "/faq"
    },
    twitter: {
      card: "summary_large_image",
      title: `FAQ | ${site.brandName}`,
      description: site.pages.faq.metadataDescription
    }
  };
}

export default async function FAQPage() {
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);
  const content = await getPublicContent(site, currentSite?.id);
  const page = site.pages.faq;

  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="FAQ"
            title={page.title}
            description={page.description}
          />
        </Reveal>
        <Reveal className="mt-10 max-w-4xl">
          <FAQList items={content.faqs} />
        </Reveal>
      </Container>
    </Section>
  );
}
