import { ContactForm } from "@/components/public/contact-form";
import { Reveal } from "@/components/public/motion";
import { SectionHeading } from "@/components/public/section-heading";
import { TrackedAnchor } from "@/components/public/tracked-anchor";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { getPublicSiteConfig } from "@/lib/public-site-config";
import { getCurrentSite } from "@/lib/sites";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import { webPageSchema } from "@/lib/schema";
import { withCanonical } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);

  return withCanonical({
    title: "Contact",
    description: site.pages.contact.metadataDescription,
    openGraph: {
      title: `Contact | ${site.brandName}`,
      description: site.pages.contact.metadataDescription
    },
    twitter: {
      card: "summary_large_image",
      title: `Contact | ${site.brandName}`,
      description: site.pages.contact.metadataDescription
    }
  }, "/contact", site.slug);
}

export default async function ContactPage() {
  const currentSite = await getCurrentSite();
  const site = getPublicSiteConfig(currentSite?.slug);
  const contact = site.contact;
  const page = site.pages.contact;

  const breadcrumbSchema = webPageSchema({
    name: "Contact | " + site.brandName,
    description: page.metadataDescription,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Contact", url: "/contact" }
    ],
    url: "/contact"
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Section>
      <Container className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal>
          <SectionHeading
            eyebrow="Contact"
            title={page.title}
            description={page.description}
          />
          <div className="mt-8 grid gap-3">
            <ContactLink siteSlug={site.slug} icon={<Mail size={18} />} label={contact.email} href={`mailto:${contact.email}`} />
            <ContactLink siteSlug={site.slug} icon={<Phone size={18} />} label={contact.phone} href={contact.phoneHref} />
            <ContactDetail icon={<MapPin size={18} />} label={contact.location} />
          </div>
          <Button asChild className="mt-7" variant="secondary">
            <TrackedAnchor siteSlug={site.slug} eventType="whatsapp_click" eventPage="/contact" eventSource="contact_page_cta" href={contact.whatsappHref} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={17} /> {page.whatsappLabel}
            </TrackedAnchor>
          </Button>
        </Reveal>
        <Reveal>
          <div className="rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6 shadow-[0_3px_10px_rgba(0,0,0,0.06)] md:p-8">
            <ContactForm site={site} />
          </div>
        </Reveal>
      </Container>
    </Section>
    </>
  );
}

function ContactLink({ icon, label, href, siteSlug }: { icon: React.ReactNode; label: string; href: string; siteSlug: string }) {
  const eventType = href.startsWith("mailto:") ? "email_click" : href.startsWith("tel:") ? "phone_click" : "contact_link_click";

  return (
    <TrackedAnchor siteSlug={siteSlug} eventType={eventType} eventPage="/contact" eventSource="contact_details" href={href} className="flex items-center gap-3 rounded-[14px] border border-[color:var(--border-subtle)] bg-white/[0.04] p-4 text-sm font-bold text-[color:var(--text-strong)] transition hover:border-[color:var(--primary)]">
      <span className="text-[color:var(--primary)]">{icon}</span>
      {label}
    </TrackedAnchor>
  );
}

function ContactDetail({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-[color:var(--border-subtle)] bg-white/[0.04] p-4 text-sm font-bold text-[color:var(--text-strong)]">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--primary)]/12 text-[color:var(--primary)]">{icon}</span>
      {label}
    </div>
  );
}
