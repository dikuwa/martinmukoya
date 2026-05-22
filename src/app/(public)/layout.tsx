import type { Metadata } from "next";
import { PublicShell } from "@/components/navigation/public-shell";
import { getPublicSiteConfig } from "@/lib/public-site-config";
import { getCurrentSite } from "@/lib/sites";

export async function generateMetadata(): Promise<Metadata> {
  const currentSite = await getCurrentSite();
  const config = getPublicSiteConfig(currentSite?.slug);

  return {
    title: {
      default: `${config.brandName} | Business Systems`,
      template: `%s | ${config.brandName}`
    }
  };
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const site = await getCurrentSite();
  const config = getPublicSiteConfig(site?.slug);
  return <PublicShell site={config}>{children}</PublicShell>;
}
