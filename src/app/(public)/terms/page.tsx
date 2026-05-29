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
    title: "Terms of Service",
    description: `Terms of Service for ${site.brandName}. Understand the terms governing your use of our website and services.`,
    openGraph: {
      title: `Terms of Service | ${site.brandName}`,
      description: `Terms of Service for ${site.brandName}. Understand the terms governing your use of our website and services.`
    },
    twitter: {
      card: "summary_large_image",
      title: `Terms of Service | ${site.brandName}`,
      description: `Terms of Service for ${site.brandName}. Understand the terms governing your use of our website and services.`
    }
  }, "/terms", site.slug);
}

export default async function TermsPage() {
  const currentSite = await getCurrentSite();
  const site = await getOverriddenPublicSiteConfig(currentSite?.slug);
  const isFlexTech = site.slug === "flextech-media";
  const brand = site.brandName;
  const domain = isFlexTech ? "flextech-media.com" : "martinmukoya.com";
  const email = site.contact.email;
  const updated = "28 May 2026";

  const breadcrumbSchema = webPageSchema({
    name: "Terms of Service | " + brand,
    description: `Terms of Service for ${brand}.`,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Terms of Service", url: "/terms" }
    ],
    url: "/terms"
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Section>
        <Container className="max-w-3xl py-12">
          <h1 className="font-display text-3xl font-black tracking-tight text-[color:var(--text-strong)] md:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-[color:var(--text-muted)]">
            Last updated: {updated}
          </p>

          <div className="mt-10 space-y-8 text-sm leading-7 text-[color:var(--text-normal)] [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-black [&_h2]:tracking-tight [&_h2]:text-[color:var(--text-strong)] [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:font-display [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-[color:var(--text-strong)] [&_p]:mb-3 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-1.5 [&_a]:text-[color:var(--primary)] [&_a]:underline [&_a]:underline-offset-2 [&_a]:transition [&_a:hover]:opacity-80">
            <p>
              Welcome to {brand} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). By accessing or using our website at{" "}
              <Link href="/">{domain}</Link>{" "}
              (the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree with any part of
              these terms, you may not access or use the Service.
            </p>

            <h2>1. Services</h2>
            <p>
              {brand} provides {isFlexTech
                ? "digital media, web development, brand websites, campaign pages, content systems, analytics, and automation services."
                : "web development, booking systems, ecommerce solutions, AI automations, and related business systems consulting."}
              The specific scope, deliverables, timeline, and fees for each project will be outlined in a separate project agreement
              or proposal between us and the client.
            </p>
            <p>
              Any project or service engagement is subject to a separate written agreement. These Terms of Service govern your
              use of the website and do not constitute a contract for services unless otherwise agreed in writing.
            </p>

            <h2>2. Intellectual Property</h2>
            <p>
              Unless otherwise stated, {brand} and/or its licensors own the intellectual property rights for all content on the
              Service, including but not limited to text, graphics, logos, images, software, and design elements.
            </p>
            <p>You may not:</p>
            <ul>
              <li>Republish, sell, or redistribute material from the Service without prior written consent</li>
              <li>Reproduce or duplicate material for commercial purposes</li>
              <li>Modify or create derivative works based on the Service&rsquo;s content without authorisation</li>
            </ul>

            <h2>3. Website Use</h2>
            <p>You agree to use the Service only for lawful purposes and in a way that does not infringe the rights of others.</p>
            <p>You must not:</p>
            <ul>
              <li>Use the Service in any way that causes, or may cause, damage to the Service or impairment of its availability</li>
              <li>Use the Service to transmit or send unsolicited commercial communications</li>
              <li>Attempt to gain unauthorised access to any part of the Service, servers, or databases</li>
              <li>Use the Service for any fraudulent or unlawful purpose</li>
            </ul>

            <h2>4. User Submissions</h2>
            <p>
              When you submit information through our contact forms, chatbot, project requests, or other interactive features,
              you grant {brand} a non-exclusive, royalty-free license to use that information for the purpose of responding to
              your enquiry and providing our services.
            </p>
            <p>
              You represent and warrant that any information you submit is accurate, complete, and not misleading. You retain
              ownership of any intellectual property rights in the content you submit.
            </p>

            <h2>5. Project Terms</h2>
            <p>
              For clients who engage {brand} for services:
            </p>
            <ul>
              <li><strong>Proposals:</strong> All project work begins with a written proposal or agreement outlining scope, deliverables, timeline, and fees</li>
              <li><strong>Payment:</strong> Payment terms are specified in the project proposal. Late payments may result in project delays or suspension</li>
              <li><strong>Revisions:</strong> Any revision cycle or change order process will be detailed in the project agreement</li>
              <li><strong>Cancellation:</strong> Either party may cancel a project as outlined in the individual project agreement. Work completed up to the point of cancellation is billable</li>
            </ul>

            <h2>6. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, {brand} shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages, including but not limited to loss of profits, data, use, or goodwill,
              arising out of or in connection with your use of the Service.
            </p>
            <p>
              {brand} provides the Service on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We make no
              representations or warranties of any kind, express or implied, regarding the operation or availability of the Service.
            </p>

            <h2>7. Third-Party Links</h2>
            <p>
              The Service may contain links to third-party websites or services that are not owned or controlled by {brand}.
              We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any
              third-party websites. You acknowledge and agree that {brand} is not responsible for any damage or loss caused
              by or in connection with the use of such third-party services.
            </p>

            <h2>8. Indemnification</h2>
            <p>
              You agree to indemnify and hold {brand} harmless from any claims, losses, damages, liabilities, including legal
              fees, arising out of your use of the Service, your violation of these Terms, or your violation of any third-party
              rights.
            </p>

            <h2>9. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your access to the Service immediately, without prior notice or
              liability, for any reason, including if you breach these Terms of Service.
            </p>
            <p>
              Upon termination, your right to use the Service will cease immediately. The provisions of these Terms that by their
              nature should survive termination shall survive, including intellectual property disclaimers, limitation of liability,
              and indemnification.
            </p>

            <h2>10. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Republic of Namibia. Any disputes
              arising out of or relating to these Terms or the Service shall be resolved in the courts of Namibia.
            </p>

            <h2>11. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. Material changes will be posted on this page
              with an updated &ldquo;Last updated&rdquo; date. By continuing to access or use the Service after revisions become
              effective, you agree to be bound by the revised terms.
            </p>

            <h2>12. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us:
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
