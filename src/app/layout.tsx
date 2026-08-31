import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { ToastProvider } from "@/components/providers/toast-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { absoluteUrl, siteUrl } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
  preload: false
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Martin Mukoya | Business Systems Developer",
  description:
    "A practical business-systems developer helping businesses increase bookings, automate work, and turn visitors into clients.",
  openGraph: {
    siteName: "Martin Mukoya",
    description:
      "Portfolio and lead-generation platform for practical websites, booking systems, ecommerce, and AI automations.",
    url: "/",
    images: [
      {
        url: "/assets/hero-images/webp/hero-image.webp",
        width: 1200,
        height: 630,
        alt: "Martin Mukoya"
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Martin Mukoya | Business Systems Developer",
    description: "Practical websites, booking systems, ecommerce, and AI automations for growing businesses.",
    images: ["/assets/hero-images/webp/hero-image.webp"]
  },
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: "Martin Mukoya",
        url: siteUrl,
        email: "info@martinmukoya.com",
        telephone: "+264 81 8563 005",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Windhoek",
          addressCountry: "NA"
        },
        jobTitle: "Business Systems Developer",
        image: absoluteUrl("/assets/hero-images/webp/hero-image.webp"),
        sameAs: ["https://github.com/", "https://linkedin.com/", "https://facebook.com/"]
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "Martin Mukoya",
        url: siteUrl,
        publisher: { "@id": `${siteUrl}/#person` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/blog?search={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <QueryProvider>
            <PostHogProvider>
              {children}
            </PostHogProvider>
            <ToastProvider />
          </QueryProvider>
        </ThemeProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </body>
    </html>
  );
}
