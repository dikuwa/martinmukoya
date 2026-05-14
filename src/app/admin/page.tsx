import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Admin overview"
        title="Portfolio operations"
        description="Foundation shell for managing content, leads, analytics, chat handovers, and site settings."
        actions={
          <Button asChild>
            <Link href="/admin/projects">Manage Projects</Link>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="New leads" value="0" detail="Lead records arrive in Phase 5." />
        <StatCard label="Published projects" value="0" detail="Project CRUD arrives in Phase 4." />
        <StatCard label="Blog views" value="0" detail="Analytics tracking arrives in Phase 8." />
        <StatCard label="Chat handovers" value="0" detail="AI assistant arrives in Phase 6." />
      </div>
    </div>
  );
}
