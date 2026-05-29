import type { PublicSiteConfig } from "@/lib/public-site-config";
import { getPublicSiteConfig } from "@/lib/public-site-config";
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
 *   "hero.description"   | "Websites, booking…"       | home.heroDescription
 *   "footer.description" | "Practical websites…"      | footerDescription
 *   "footer.company"     | "Reg. No. CC/2024/00337…"  | registrationInfo
 *   "footer.copyright"   | "Built for brands that…"   | copyright
 */

type SettingMapEntry = {
  /** Apply the raw DB value to the config at a specific path. */
  apply: (config: PublicSiteConfig, raw: unknown) => void;
};

function setString(target: { [key: string]: unknown }, key: string, raw: unknown) {
  if (typeof raw === "string" && raw.length > 0) {
    target[key] = raw;
  }
}

function setStringArray(target: { [key: string]: unknown }, key: string, raw: unknown) {
  if (Array.isArray(raw) && raw.every((item) => typeof item === "string")) {
    target[key] = raw;
  }
}

function setObjectArray(target: { [key: string]: unknown }, key: string, raw: unknown) {
  if (Array.isArray(raw) && raw.every((item) => typeof item === "object" && item !== null)) {
    target[key] = raw;
  }
}

function getRecord(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as Record<string, unknown>;
}

function pathSetter(path: string[], kind: "string" | "stringArray" | "objectArray" = "string"): SettingMapEntry {
  return {
    apply: (config, raw) => {
      let target: unknown = config;
      for (const segment of path.slice(0, -1)) {
        if (!target || typeof target !== "object") return;
        target = (target as Record<string, unknown>)[segment];
      }

      if (!target || typeof target !== "object") return;
      const key = path[path.length - 1];
      if (kind === "stringArray") return setStringArray(target as Record<string, unknown>, key, raw);
      if (kind === "objectArray") return setObjectArray(target as Record<string, unknown>, key, raw);
      setString(target as Record<string, unknown>, key, raw);
    }
  };
}

function applyDirectPath(config: PublicSiteConfig, key: string, raw: unknown) {
  const path = key.split(".").filter(Boolean);
  if (path.length < 2) return false;

  let target: unknown = config;
  for (const segment of path.slice(0, -1)) {
    if (!target || typeof target !== "object" || !(segment in target)) return false;
    target = (target as Record<string, unknown>)[segment];
  }

  if (!target || typeof target !== "object") return false;
  const last = path[path.length - 1];
  if (!(last in target)) return false;

  const current = (target as Record<string, unknown>)[last];
  if (typeof current === "string") {
    setString(target as Record<string, unknown>, last, raw);
    return true;
  }
  if (Array.isArray(current) && current.every((item) => typeof item === "string")) {
    setStringArray(target as Record<string, unknown>, last, raw);
    return true;
  }
  if (Array.isArray(current) && current.every((item) => typeof item === "object" && item !== null)) {
    setObjectArray(target as Record<string, unknown>, last, raw);
    return true;
  }
  if (typeof current === "object" && current !== null && typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
    (target as Record<string, unknown>)[last] = { ...current, ...raw };
    return true;
  }

  return false;
}

function applyHeroObject(config: PublicSiteConfig, raw: unknown) {
  const hero = getRecord(raw);
  if (!hero) return;

  setString(config.home, "eyebrow", hero.eyebrow);
  setString(config.home, "heroTitle", hero.title ?? hero.heading ?? hero.heroTitle ?? hero.headline);
  setString(config.home, "heroDescription", hero.description ?? hero.subtitle ?? hero.heroDescription);
  setString(config.home, "primaryCta", hero.primaryCta ?? hero.primary ?? hero.cta);
  setString(config.home, "secondaryCta", hero.secondaryCta ?? hero.secondary);
  setString(config.home, "secondaryHref", hero.secondaryHref);
  setString(config.home, "heroImage", hero.image ?? hero.heroImage);
  setString(config.home, "heroAlt", hero.alt ?? hero.heroAlt);
}

function applyHomepageObject(config: PublicSiteConfig, raw: unknown) {
  const homepage = getRecord(raw);
  if (!homepage) return;

  applyHeroObject(config, homepage.hero ?? homepage);
  applyDirectPath(config, "home.techStack", homepage.techStack);
  applyDirectPath(config, "home.servicesTitle", homepage.servicesTitle);
  applyDirectPath(config, "home.servicesDescription", homepage.servicesDescription);
  applyDirectPath(config, "home.workEyebrow", homepage.workEyebrow);
  applyDirectPath(config, "home.workTitle", homepage.workTitle);
  applyDirectPath(config, "home.workDescription", homepage.workDescription);
  applyDirectPath(config, "home.reasonsTitle", homepage.reasonsTitle);
  applyDirectPath(config, "home.reasonsDescription", homepage.reasonsDescription);
  applyDirectPath(config, "home.reasons", homepage.reasons);
  applyDirectPath(config, "home.testimonialsTitle", homepage.testimonialsTitle);
  applyDirectPath(config, "home.aboutTitle", homepage.aboutTitle);
  applyDirectPath(config, "home.aboutDescription", homepage.aboutDescription);
  applyDirectPath(config, "home.aboutImage", homepage.aboutImage);
  applyDirectPath(config, "home.aboutAlt", homepage.aboutAlt);
}

const SETTING_MAP: Record<string, SettingMapEntry> = {
  "brand.name": pathSetter(["brandName"]),
  "brandName": pathSetter(["brandName"]),
  "logo.alt": pathSetter(["logoAlt"]),
  "logoAlt": pathSetter(["logoAlt"]),
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
  contact: {
    apply: (config, raw) => {
      const obj = getRecord(raw);
      if (!obj) return;
      if (typeof obj.email === "string" && obj.email.length > 0) config.contact.email = obj.email;
      if (typeof obj.phone === "string" && obj.phone.length > 0) {
        const digits = obj.phone.replace(/[^0-9]/g, "");
        config.contact.phone = obj.phone;
        config.contact.phoneHref = `tel:${obj.phone.replace(/\s+/g, "")}`;
        if (digits) config.contact.whatsappHref = `https://wa.me/${digits}`;
      }
      if (typeof obj.location === "string" && obj.location.length > 0) config.contact.location = obj.location;
      if (typeof obj.whatsapp === "string" && obj.whatsapp.length > 0) config.contact.whatsappHref = obj.whatsapp;
    },
  },
  socials: {
    apply: (config, raw) => {
      const obj = getRecord(raw);
      if (!obj) return;
      if (typeof obj.github === "string" && obj.github.length > 0) config.contact.github = obj.github;
      if (typeof obj.facebook === "string" && obj.facebook.length > 0) config.contact.facebook = obj.facebook;
      if (typeof obj.linkedin === "string" && obj.linkedin.length > 0) config.contact.linkedin = obj.linkedin;
    },
  },
  hero: { apply: applyHeroObject },
  "home.hero": { apply: applyHeroObject },
  "homepage.hero": { apply: applyHeroObject },
  homepage: { apply: applyHomepageObject },
  "hero.eyebrow": pathSetter(["home", "eyebrow"]),
  "hero.title": pathSetter(["home", "heroTitle"]),
  "hero.heading": pathSetter(["home", "heroTitle"]),
  "hero.description": pathSetter(["home", "heroDescription"]),
  "hero.subtitle": pathSetter(["home", "heroDescription"]),
  "hero.primaryCta": pathSetter(["home", "primaryCta"]),
  "hero.primary": pathSetter(["home", "primaryCta"]),
  "hero.secondaryCta": pathSetter(["home", "secondaryCta"]),
  "hero.secondary": pathSetter(["home", "secondaryCta"]),
  "hero.secondaryHref": pathSetter(["home", "secondaryHref"]),
  "hero.image": pathSetter(["home", "heroImage"]),
  "hero.alt": pathSetter(["home", "heroAlt"]),
  "home.eyebrow": pathSetter(["home", "eyebrow"]),
  "home.hero.title": pathSetter(["home", "heroTitle"]),
  "home.hero.heading": pathSetter(["home", "heroTitle"]),
  "home.hero.description": pathSetter(["home", "heroDescription"]),
  "home.hero.subtitle": pathSetter(["home", "heroDescription"]),
  "homepage.hero.title": pathSetter(["home", "heroTitle"]),
  "homepage.hero.heading": pathSetter(["home", "heroTitle"]),
  "homepage.hero.description": pathSetter(["home", "heroDescription"]),
  "homepage.hero.subtitle": pathSetter(["home", "heroDescription"]),
  "homepage.hero.primaryCta": pathSetter(["home", "primaryCta"]),
  "homepage.hero.secondaryCta": pathSetter(["home", "secondaryCta"]),
  "homepage.hero.secondaryHref": pathSetter(["home", "secondaryHref"]),
  "homepage.hero.image": pathSetter(["home", "heroImage"]),
  "homepage.hero.alt": pathSetter(["home", "heroAlt"]),
  "home.heroTitle": pathSetter(["home", "heroTitle"]),
  "home.heroDescription": pathSetter(["home", "heroDescription"]),
  "home.primaryCta": pathSetter(["home", "primaryCta"]),
  "home.headline": pathSetter(["home", "heroTitle"]),
  "home.cta": pathSetter(["home", "primaryCta"]),
  "home.secondaryCta": pathSetter(["home", "secondaryCta"]),
  "home.secondaryHref": pathSetter(["home", "secondaryHref"]),
  "home.heroImage": pathSetter(["home", "heroImage"]),
  "home.heroAlt": pathSetter(["home", "heroAlt"]),
  "home.techStack": pathSetter(["home", "techStack"], "stringArray"),
  "services.title": pathSetter(["home", "servicesTitle"]),
  "services.description": pathSetter(["home", "servicesDescription"]),
  "home.servicesTitle": pathSetter(["home", "servicesTitle"]),
  "home.servicesDescription": pathSetter(["home", "servicesDescription"]),
  "work.eyebrow": pathSetter(["home", "workEyebrow"]),
  "work.title": pathSetter(["home", "workTitle"]),
  "work.description": pathSetter(["home", "workDescription"]),
  "home.workEyebrow": pathSetter(["home", "workEyebrow"]),
  "home.workTitle": pathSetter(["home", "workTitle"]),
  "home.workDescription": pathSetter(["home", "workDescription"]),
  "reasons.title": pathSetter(["home", "reasonsTitle"]),
  "reasons.description": pathSetter(["home", "reasonsDescription"]),
  "reasons.items": pathSetter(["home", "reasons"], "objectArray"),
  "home.reasonsTitle": pathSetter(["home", "reasonsTitle"]),
  "home.reasonsDescription": pathSetter(["home", "reasonsDescription"]),
  "home.reasons": pathSetter(["home", "reasons"], "objectArray"),
  "testimonials.title": pathSetter(["home", "testimonialsTitle"]),
  "home.testimonialsTitle": pathSetter(["home", "testimonialsTitle"]),
  "about.title": pathSetter(["home", "aboutTitle"]),
  "about.description": pathSetter(["home", "aboutDescription"]),
  "about.image": pathSetter(["home", "aboutImage"]),
  "about.alt": pathSetter(["home", "aboutAlt"]),
  "home.aboutTitle": pathSetter(["home", "aboutTitle"]),
  "home.aboutDescription": pathSetter(["home", "aboutDescription"]),
  "home.aboutImage": pathSetter(["home", "aboutImage"]),
  "home.aboutAlt": pathSetter(["home", "aboutAlt"]),
  "finalCta.eyebrow": pathSetter(["finalCta", "eyebrow"]),
  "finalCta.title": pathSetter(["finalCta", "title"]),
  "finalCta.description": pathSetter(["finalCta", "description"]),
  "finalCta.primary": pathSetter(["finalCta", "primary"]),
  "finalCta.secondary": pathSetter(["finalCta", "secondary"]),
  "footer.description": pathSetter(["footerDescription"]),
  "footer.company": pathSetter(["registrationInfo"]),
  "footer.registrationInfo": pathSetter(["registrationInfo"]),
  "footer.copyright": pathSetter(["copyright"]),
  "pages.services.title": pathSetter(["pages", "services", "title"]),
  "pages.services.description": pathSetter(["pages", "services", "description"]),
  "pages.services.metadataDescription": pathSetter(["pages", "services", "metadataDescription"]),
  "pages.services.ctaLabel": pathSetter(["pages", "services", "ctaLabel"]),
  "pages.projects.title": pathSetter(["pages", "projects", "title"]),
  "pages.projects.description": pathSetter(["pages", "projects", "description"]),
  "pages.projects.metadataDescription": pathSetter(["pages", "projects", "metadataDescription"]),
  "pages.blog.title": pathSetter(["pages", "blog", "title"]),
  "pages.blog.description": pathSetter(["pages", "blog", "description"]),
  "pages.blog.metadataDescription": pathSetter(["pages", "blog", "metadataDescription"]),
  "pages.faq.title": pathSetter(["pages", "faq", "title"]),
  "pages.faq.description": pathSetter(["pages", "faq", "description"]),
  "pages.faq.metadataDescription": pathSetter(["pages", "faq", "metadataDescription"]),
  "pages.about.eyebrow": pathSetter(["pages", "about", "eyebrow"]),
  "pages.about.title": pathSetter(["pages", "about", "title"]),
  "pages.about.description": pathSetter(["pages", "about", "description"]),
  "pages.about.metadataDescription": pathSetter(["pages", "about", "metadataDescription"]),
  "pages.about.ctaLabel": pathSetter(["pages", "about", "ctaLabel"]),
  "pages.about.cards": pathSetter(["pages", "about", "cards"], "objectArray"),
  "pages.about.stackTitle": pathSetter(["pages", "about", "stackTitle"]),
  "pages.about.stackDescription": pathSetter(["pages", "about", "stackDescription"]),
  "pages.contact.title": pathSetter(["pages", "contact", "title"]),
  "pages.contact.description": pathSetter(["pages", "contact", "description"]),
  "pages.contact.metadataDescription": pathSetter(["pages", "contact", "metadataDescription"]),
  "pages.contact.whatsappLabel": pathSetter(["pages", "contact", "whatsappLabel"]),
  "pages.contact.successTitle": pathSetter(["pages", "contact", "successTitle"]),
  "pages.contact.successDescription": pathSetter(["pages", "contact", "successDescription"]),
  "pages.contact.successToast": pathSetter(["pages", "contact", "successToast"]),
  "pages.startProject.eyebrow": pathSetter(["pages", "startProject", "eyebrow"]),
  "pages.startProject.title": pathSetter(["pages", "startProject", "title"]),
  "pages.startProject.description": pathSetter(["pages", "startProject", "description"]),
  "pages.startProject.metadataDescription": pathSetter(["pages", "startProject", "metadataDescription"])
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
    where: {
      OR: [
        { siteId: null },
        { site: { slug: siteSlug } }
      ]
    },
    orderBy: [{ siteId: "asc" }, { updatedAt: "asc" }]
  });

  if (settings.length === 0) return config;

  // Deep-clone so mutate never touches the original hardcoded object
  const merged: PublicSiteConfig = JSON.parse(JSON.stringify(config));

  const orderedSettings = settings.sort((a, b) => {
    if (a.siteId === b.siteId) return a.updatedAt.getTime() - b.updatedAt.getTime();
    if (a.siteId === null) return -1;
    if (b.siteId === null) return 1;
    return 0;
  });

  for (const setting of orderedSettings) {
    const entry = SETTING_MAP[setting.key];
    if (entry) {
      entry.apply(merged, setting.value);
    } else {
      applyDirectPath(merged, setting.key, setting.value);
    }
  }

  return merged;
}

export async function getOverriddenPublicSiteConfig(slug?: string | null): Promise<PublicSiteConfig> {
  return mergeSiteOverrides(getPublicSiteConfig(slug), slug);
}
