import { Container, Section } from "@/components/ui/container";
import { getOverriddenPublicSiteConfig } from "@/lib/site-overrides";
import { getCurrentSite } from "@/lib/sites";
import { webPageSchema } from "@/lib/schema";
import { withCanonical } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const currentSite = await getCurrentSite();
  const site = await getOverriddenPublicSiteConfig(currentSite?.slug);

  return withCanonical({
    title: "Privacy Policy",
    description: `Privacy Policy for ${site.brandName}. Learn how we collect, use, and protect your personal information.`,
    openGraph: {
      title: `Privacy Policy | ${site.brandName}`,
      description: `Privacy Policy for ${site.brandName}. Learn how we collect, use, and protect your personal information.`
    },
    twitter: {
      card: "summary_large_image",
      title: `Privacy Policy | ${site.brandName}`,
      description: `Privacy Policy for ${site.brandName}. Learn how we collect, use, and protect your personal information.`
    }
  }, "/privacy", site.slug);
}

export default async function PrivacyPage() {
  const currentSite = await getCurrentSite();
  const site = await getOverriddenPublicSiteConfig(currentSite?.slug);
  const isFlexTech = site.slug === "flextech-media";
  const brand = site.brandName;
  const domain = isFlexTech ? "flextech-media.com" : "martinmukoya.com";
  const email = site.contact.email;
  const updated = "28 May 2026";

  const breadcrumbSchema = webPageSchema({
    name: "Privacy Policy | " + brand,
    description: `Privacy Policy for ${brand}.`,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Privacy Policy", url: "/privacy" }
    ],
    url: "/privacy"
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Section>
        <Container className="max-w-3xl py-12">
          <h1 className="font-display text-3xl font-black tracking-tight text-[color:var(--text-strong)] md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-[color:var(--text-muted)]">
            Last updated: {updated}
          </p>

          <div className="mt-10 space-y-8 text-sm leading-7 text-[color:var(--text-normal)] [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-black [&_h2]:tracking-tight [&_h2]:text-[color:var(--text-strong)] [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:font-display [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-[color:var(--text-strong)] [&_p]:mb-3 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-1.5 [&_a]:text-[color:var(--primary)] [&_a]:underline [&_a]:underline-offset-2 [&_a]:transition [&_a:hover]:opacity-80">
            <p>
              {brand} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the website at{" "}
              <Link href="/">{domain}</Link>{" "}
              (the &ldquo;Service&rdquo;). This page informs you of our policies regarding the collection, use, and disclosure of
              personal data when you use our Service and the choices you have associated with that data.
            </p>

          <h2>1. Information We Collect</h2>

          <h3>Personal Data</h3>
          <p>We collect information that you voluntarily provide to us when you:</p>
          <ul>
            <li>Submit a contact or enquiry form (name, email address, phone number, and message content)</li>
            <li>Use the AI chatbot (name, email address, phone number, project details, budget information, and timeline preferences)</li>
            <li>Start a project request (selected services, budget range, and timeline)</li>
            <li>Communicate with us via email or WhatsApp</li>
          </ul>

          <h3>Automatically Collected Data</h3>
          <p>When you access the Service, we automatically collect certain information through analytics tools:</p>
          <ul>
            <li>Pages visited and the time and date of your visit</li>
            <li>Referring website URLs and exit pages</li>
            <li>Browser type, device type, and operating system</li>
            <li>General location information derived from your IP address (city or country level only)</li>
            <li>Interactions with buttons, links, forms, and other page elements</li>
          </ul>

          <h3>Cookies and Tracking Technologies</h3>
          <p>
            We use cookies and similar tracking technologies (localStorage, session storage) to operate and improve the Service.
            These include:
          </p>
          <ul>
            <li><strong>Essential cookies:</strong> Required for authentication (admin sessions) and basic site functionality</li>
            <li><strong>Analytics cookies:</strong> PostHog cookies and localStorage used to track page views, feature usage, and navigation patterns</li>
            <li><strong>Session storage:</strong> Used temporarily to maintain chatbot conversations</li>
          </ul>
          <p>
            You can control cookies through your browser settings. Disabling certain cookies may affect the functionality of the Service.
          </p>

          <h2>2. How We Use Your Data</h2>
          <p>We use the collected data for the following purposes:</p>
          <ul>
            <li>To respond to your enquiries, project requests, and messages</li>
            <li>To provide, maintain, and improve the Service</li>
            <li>To understand how visitors interact with the website and improve user experience</li>
            <li>To send administrative information, such as confirmations of form submissions</li>
            {!isFlexTech && <li>To send occasional direct communications regarding services or updates (only with your consent)</li>}
            <li>To detect, prevent, and address technical issues and abuse</li>
          </ul>

          <h2>3. Third-Party Services</h2>
          <p>We use the following third-party service providers to operate and support our Service:</p>
          <ul>
            <li><strong>Vercel Inc.</strong> &mdash; Web hosting and deployment (privacy policy:{" "}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">vercel.com/legal/privacy-policy</a>)</li>
            <li><strong>PostHog Inc.</strong> &mdash; Product analytics and event tracking (privacy policy:{" "}
              <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer">posthog.com/privacy</a>)</li>
            <li><strong>Resend Inc.</strong> &mdash; Email delivery for notifications and confirmations (privacy policy:{" "}
              <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">resend.com/legal/privacy-policy</a>)</li>
            <li><strong>Cloudflare Inc.</strong> &mdash; CDN, DNS, and R2 object storage (privacy policy:{" "}
              <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">cloudflare.com/privacypolicy</a>)</li>
            <li><strong>Neon Inc.</strong> &mdash; PostgreSQL database hosting (privacy policy:{" "}
              <a href="https://neon.tech/privacy" target="_blank" rel="noopener noreferrer">neon.tech/privacy</a>)</li>
          </ul>
          <p>
            These third parties have their own privacy policies governing the use of your data. We encourage you to review them.
          </p>

          <h2>4. Data Retention</h2>
          <p>
            We retain your personal data only for as long as necessary to fulfil the purposes for which it was collected:
          </p>
          <ul>
            <li><strong>Contact form and chatbot submissions:</strong> Retained for the duration of the client relationship or project, then archived or deleted</li>
            <li><strong>Analytics events:</strong> Retained for up to 26 months for trend analysis and reporting</li>
            <li><strong>Admin account information:</strong> Retained for as long as the admin account remains active</li>
          </ul>
          <p>
            When the retention period expires, personal data will be securely deleted or anonymised.
          </p>

          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organisational measures to protect your personal data against
            unauthorised access, alteration, disclosure, or destruction. These include encrypted connections (HTTPS),
            secure database access controls, and adherence to security best practices in our code and infrastructure.
          </p>

          <h2>6. Your Data Protection Rights</h2>
          <p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
            <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data</li>
            <li><strong>Erasure:</strong> Request deletion of your personal data, subject to certain exceptions</li>
            <li><strong>Restriction:</strong> Request restriction of processing of your personal data</li>
            <li><strong>Data portability:</strong> Request transfer of your data to another service provider</li>
            <li><strong>Objection:</strong> Object to the processing of your personal data for direct marketing purposes</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us at{" "}
            <a href={`mailto:${email}`}>{email}</a>. We will respond to your request within 30 days.
          </p>

          <h2>7. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than the one you reside in,
            where our service providers are located (including the United States and the European Union). We ensure
            appropriate safeguards are in place through standard contractual clauses or equivalent mechanisms
            where required by applicable law.
          </p>

          <h2>8. Children&rsquo;s Privacy</h2>
          <p>
            Our Service is not directed to individuals under the age of 16. We do not knowingly collect personal
            data from children. If you become aware that a child has provided us with personal data, please contact
            us at{" "}
            <a href={`mailto:${email}`}>{email}</a> so that we can take appropriate action.
          </p>

          <h2>9. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by
            posting the new policy on this page and updating the &ldquo;Last updated&rdquo; date. We encourage you
            to review this policy periodically.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <ul>
            <li>Email: <a href={`mailto:${email}`}>{email}</a></li>
            <li>Website: <Link href="/contact">Contact page</Link></li>
            {isFlexTech && <li>Reg. No. CC/2024/00337 &middot; ERF 234, Silver Avenue, Tamariskia, Swakopmund, Namibia</li>}
          </ul>
        </div>
      </Container>
    </Section>
    </>
  );
}
