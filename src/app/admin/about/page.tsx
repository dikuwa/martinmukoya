import { AboutContentForm } from "@/components/admin/about-content-form";
import { PageHeader } from "@/components/ui/page-header";
import { getOverriddenPublicSiteConfig } from "@/lib/site-overrides";
import { getCurrentSite } from "@/lib/sites";
import { redirect } from "next/navigation";

export default async function AdminAboutPage() {
  const currentSite = await getCurrentSite();
  if (currentSite?.slug === "flextech-media") redirect("/admin/settings");
  const site = await getOverriddenPublicSiteConfig("martin-mukoya");
  return <div className="grid gap-8">
    <PageHeader title="About Content" description="Manage Martin Mukoya’s About page and homepage imagery." />
    <AboutContentForm initial={{ ...site.pages.about, aboutImage: site.home.aboutImage, heroImage: site.home.heroImage }} />
  </div>;
}
