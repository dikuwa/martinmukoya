import { PublicShell } from "@/components/navigation/public-shell";
import { getPublicSiteConfig } from "@/lib/public-site-config";
import { getCurrentSite } from "@/lib/sites";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const site = await getCurrentSite();
  const config = getPublicSiteConfig(site?.slug);
  return <PublicShell site={config}>{children}</PublicShell>;
}
