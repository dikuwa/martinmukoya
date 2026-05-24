import { siteUrl } from "./seo";

/**
 * Generate BreadcrumbList schema.org structured data.
 *
 * @example
 *   breadcrumbSchema([
 *     { name: "Home", url: "/" },
 *     { name: "Services", url: "/services" },
 *   ]);
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`
    }))
  };
}

/**
 * Generate FAQPage schema.org structured data.
 */
export interface FaqItem {
  question: string;
  answer: string;
}

export function faqPageSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer
      }
    }))
  };
}

/**
 * Generate Service schema.org structured data for a single service.
 */
export interface ServiceSchema {
  name: string;
  description: string;
  providerName: string;
  providerType?: "Person" | "Organization";
  url?: string;
  image?: string;
  areaServed?: string;
}

export function serviceSchema(service: ServiceSchema) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: {
      "@type": service.providerType ?? "Person",
      name: service.providerName
    },
    ...(service.url && { url: service.url }),
    ...(service.image && { image: service.image }),
    ...(service.areaServed && { areaServed: service.areaServed })
  };
}

/**
 * Generate a simple WebPage schema with breadcrumb.
 */
export function webPageSchema({
  name,
  description,
  breadcrumbs,
  url
}: {
  name: string;
  description?: string;
  breadcrumbs: BreadcrumbItem[];
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    ...(description && { description }),
    url: `${siteUrl}${url}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `${siteUrl}${item.url}`
      }))
    }
  };
}
