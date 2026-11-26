"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { FinanceSettingsForm } from "@/components/admin/finance-settings-form";
import { DashboardSelect } from "@/components/ui/dashboard-select";
import type { DashboardSelectOption } from "@/components/ui/dashboard-select";
import type { IssuerSnapshot } from "@/lib/issuer-constants";

const siteOptions: DashboardSelectOption[] = [
  { value: "flextech-media", label: "FlexTech Media (Business)" },
  { value: "martin-mukoya", label: "Martin Mukoya (Personal)" },
  { value: "", label: "Global (shared)" },
];

export default function FinanceSettingsPage() {
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<{ site: string | null; issuer: IssuerSnapshot | null } | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchIssuer() {
      try {
        const response = await fetch(`/api/admin/finance-settings?site=${selectedSite ?? ""}`);
        if (!response.ok) throw new Error("Identity settings unavailable");
        const data = await response.json();
        if (active) setLoaded({ site: selectedSite, issuer: data.issuer });
      } catch (error) {
        console.error("Failed to fetch issuer:", error);
        if (active) setLoaded({ site: selectedSite, issuer: null });
      }
    }
    fetchIssuer();
    return () => { active = false; };
  }, [selectedSite]);

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Financial identity"
        description="Configure issuer details, banking, payment methods, and signature for each identity."
        actions={
          <DashboardSelect
            aria-label="Business identity"
            value={selectedSite ?? ""}
            onChange={e => setSelectedSite(e.target.value === "" ? null : e.target.value)}
            options={siteOptions}
            className="w-full sm:w-[300px]"
          />
        }
      />
      {loaded?.site !== selectedSite ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-[color:var(--text-muted)]">Loading financial identity…</p>
        </div>
      ) : loaded.issuer ? (
        <FinanceSettingsForm key={selectedSite ?? "global"} initial={loaded.issuer} site={selectedSite} />
      ) : <p role="alert">Unable to load financial identity settings.</p>}
    </div>
  );
}
