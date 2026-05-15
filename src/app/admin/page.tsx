import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";

export default async function AdminPage() {
  const [newLeads, projects, blogViews, chatHandovers, whatsappClicks, ctaClicks] = await Promise.all([
    db.lead.count({ where: { status: "NEW" } }),
    db.project.count({ where: { published: true } }),
    db.analyticsEvent.count({ where: { eventType: "blog_view" } }),
    db.chatSession.count({ where: { handedToHuman: true } }),
    db.analyticsEvent.count({ where: { eventType: "whatsapp_click" } }),
    db.analyticsEvent.count({ where: { eventType: "cta_click" } })
  ]);

  const conversionRate = ctaClicks === 0 ? "0%" : `${Math.round((newLeads / ctaClicks) * 100)}%`;

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Admin overview"
        title="Portfolio operations"
        description="Manage content, leads, analytics signals, chat handovers, and site settings from one protected workspace."
        actions={
          <Button asChild>
            <Link href="/admin/projects/new">New Project</Link>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="New leads" value={String(newLeads)} detail="Fresh submissions awaiting review." />
        <StatCard label="Published projects" value={String(projects)} detail="Public case studies currently visible." />
        <StatCard label="Blog views" value={String(blogViews)} detail="Internal events from seeded analytics." />
        <StatCard label="Chat handovers" value={String(chatHandovers)} detail="AI sessions routed toward human follow-up." />
        <StatCard label="WhatsApp clicks" value={String(whatsappClicks)} detail="Direct contact intent events." />
        <StatCard label="CTA clicks" value={String(ctaClicks)} detail="Start project and conversion CTA events." />
        <StatCard label="Conversion rate" value={conversionRate} detail="New leads divided by CTA clicks." />
      </div>
    </div>
  );
}
