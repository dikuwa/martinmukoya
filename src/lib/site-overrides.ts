import type { PublicSiteConfig } from "@/lib/public-site-config";
import { db } from "@/lib/db";

/**
 * Known setting keys that can override the hardcoded PublicSiteConfig.
 *
 * Admin users create/update these via /admin/settings.
 * The value column stores the raw JSON value (string for most, object where noted).
 *
 *   key                  | value example              | maps to
 *   ---------------------|----------------------------|------------------------------------------
 *   "contact.email"      | "info@flextech-media.com"  | contact.email
 *   "contact.phone"      | "+264 81 8563 005"         | contact.phone, contact.phoneHref,
 *                         |                            |   contact.whatsappHref (derived)
 *   "availability"       | "Booking new projects"     | availability
 *   "hero.title"         | "I build systems that…"    | home.heroTitle
 *   "footer.description" | "Practical websites…"      | footerDescription
 *   "footer.company"     | "Reg. No. CC/2024/00337…"  | registrationInfo
 *   "footer.copyright"   | "Built for brands that…"   | copyright
 */

type SettingMapEntry = {
  /** Apply the raw DB value to the config at a specific path. */
  apply: (config: PublicSiteConfig, raw: unknown) => void;
};

const SETTING_MAP: Record<string, SettingMapEntry> = {
  "contact.email": {
    apply: (config, raw) => {
      if (typeof raw === "string" && raw.length > 0) config.contact.email = raw;
    },
  },
  "contact.phone": {
    apply: (config, raw) => {
      if (typeof raw === "string" && raw.length > 0) {
        const digits = raw.replace(/[^0-9]/g, "");
        config.contact.phone = raw;
        config.contact.phoneHref = `tel:${raw.replace(/\s+/g, "")}`;
        if (digits) config.contact.whatsappHref = `https://wa.me/${digits}`;
      }
    },
  },
  availability: {
    apply: (config, raw) => {
      if (typeof raw === "string" && raw.length > 0) config.availability = raw;
    },
  },
  "hero.title": {
    apply: (config, raw) => {
      if (typeof raw === "string" && raw.length > 0) config.home.heroTitle = raw;
    },
  },
  "footer.description": {
    apply: (config, raw) => {
      if (typeof raw === "string" && raw.length > 0) config.footerDescription = raw;
    },
  },
  "footer.company": {
    apply: (config, raw) => {
      if (typeof raw === "string" && raw.length > 0) config.registrationInfo = raw;
    },
  },
  "footer.copyright": {
    apply: (config, raw) => {
      if (typeof raw === "string" && raw.length > 0) config.copyright = raw;
    },
  },
};

/**
 * Fetch site settings from the DB for the given slug and merge them
 * into a fresh copy of the hardcoded config.
 *
 * Call from server components where the overridable fields are rendered
 * (layout.tsx for nav/footer, page.tsx for the hero heading).
 */
export async function mergeSiteOverrides(
  config: PublicSiteConfig,
  slug?: string | null,
): Promise<PublicSiteConfig> {
  const siteSlug = slug ?? config.slug;
  if (siteSlug === "global") return config;

  const settings = await db.siteSetting.findMany({
    where: { site: { slug: siteSlug } },
  });

  if (settings.length === 0) return config;

  // Deep-clone so mutate never touches the original hardcoded object
  const merged: PublicSiteConfig = JSON.parse(JSON.stringify(config));

  for (const setting of settings) {
    const entry = SETTING_MAP[setting.key];
    if (entry) {
      entry.apply(merged, setting.value);
    }
  }

  return merged;
}
