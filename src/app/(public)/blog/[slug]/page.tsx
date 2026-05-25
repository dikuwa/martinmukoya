import { webPageSchema } from "@/lib/schema";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyCodeButton } from "@/components/copy-code-button";
import { BlogMarkdown } from "@/components/public/blog-markdown";
import { Reveal } from "@/components/public/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { getPublicContent } from "@/lib/public-content";
import { getPublicSiteConfig, publicSiteConfigs } from "@/lib/public-site-config";
import { absoluteUrl, canonicalSiteForSharedContent, PRIMARY_SITE_SLUG, siteUrl, withCanonical } from "@/lib/seo";
import { getCurrentSite } from "@/lib/sites";

type BlogPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.values(publicSiteConfigs).flatMap((site) => site.blogPosts.map((post) => ({ slug: post.slug })));
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);
  const content = await getPublicContent(site, currentSite?.id);
  const post = content.blogPosts.find((item) => item.slug === slug);

  if (!post) {
    return { title: "Post not found" };
  }

  const isSharedWithPrimary = publicSiteConfigs[PRIMARY_SITE_SLUG].blogPosts.some((item) => item.slug === post.slug);

  return withCanonical({
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [site.brandName],
      images: [post.coverImage]
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage]
    }
  }, `/blog/${post.slug}`, site.slug, { canonicalSiteSlug: canonicalSiteForSharedContent(site.slug, isSharedWithPrimary) });
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);
  const content = await getPublicContent(site, currentSite?.id);
  const post = content.blogPosts.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  const code = `const lead = await captureLead({\n  source: "website",\n  serviceType: "booking-system",\n  preferredContact: "whatsapp"\n});`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: absoluteUrl(post.coverImage),
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": site.slug === "flextech-media" ? "Organization" : "Person", name: site.brandName, url: siteUrl },
    publisher: { "@type": site.slug === "flextech-media" ? "Organization" : "Person", name: site.brandName, url: siteUrl },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`)
  };

  const breadcrumbSchema = webPageSchema({
    name: `${post.title} | ${site.brandName}`,
    description: post.excerpt,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" },
      { name: post.title, url: `/blog/${post.slug}` }
    ],
    url: `/blog/${post.slug}`
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Section className="pb-12">
        <Container className="max-w-4xl text-center">
          <Reveal>
            <Badge>{post.category}</Badge>
            <h1 className="text-balance mt-5 font-display text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.98] text-[color:var(--text-strong)]">
              {post.title}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[color:var(--text-muted)]">{post.excerpt}</p>
            <p className="mt-4 text-sm font-semibold text-[color:var(--text-faint)]">
              Published {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(post.publishedAt))}
            </p>
          </Reveal>
        </Container>
        <Container className="mt-10">
          <Reveal className="relative aspect-[16/8] overflow-hidden rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)]">
            <Image src={post.coverImage} alt={post.title + " — cover image"} fill priority className="object-cover" sizes="100vw" />
          </Reveal>
        </Container>
      </Section>
      <Section className="pt-0">
        <Container className="max-w-3xl">
          <article className="space-y-6 text-base leading-8 text-[color:var(--text-normal)]">
            <BlogMarkdown content={post.content.join("\n\n")} />
            <div className="overflow-hidden rounded-[calc(var(--radius,1rem))] border" style={{ backgroundColor: "var(--code-bg)", borderColor: "var(--code-border)" }}>
              <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ backgroundColor: "var(--code-header-bg)", borderColor: "var(--code-border)" }}>
                <span className="text-xs font-medium tracking-wide" style={{ color: "var(--code-muted)" }}>Example handover shape</span>
                <CopyCodeButton code={code} />
              </div>
              <pre className="overflow-x-auto p-5 text-[0.925rem] leading-7" style={{ color: "var(--code-text)" }}><code className="font-mono">{code}</code></pre>
            </div>
          </article>
          <Button asChild className="mt-10" variant="secondary">
            <Link href="/blog">Back to Blog</Link>
          </Button>
        </Container>
      </Section>
    </>
  );
}
