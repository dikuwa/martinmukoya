"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { FinanceSettingsForm } from "@/components/admin/finance-settings-form";
import { DashboardSelect } from "@/components/ui/dashboard-select";
import type { DashboardSelectOption } from "@/components/ui/dashboard-select";
import type { IssuerSnapshot } from "@/lib/issuer-constants";
import { defaultIssuer, personalIssuer } from "@/lib/issuer-constants";

const siteOptions: DashboardSelectOption[] = [
  { value: "flextech-media", label: "FlexTech Media (Business)" },
  { value: "martin-mukoya", label: "Martin Mukoya (Personal)" },
  { value: "", label: "Global (shared)" },
];

export default function FinanceSettingsPage() {
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [initial, setInitial] = useState<IssuerSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchIssuer() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/finance-settings?site=${selectedSite ?? ""}`);
        if (response.ok) {
          const data = await response.json();
          setInitial(data.issuer);
        }
      } catch (error) {
        console.error("Failed to fetch issuer:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchIssuer();
  }, [selectedSite]);

  const defaultIssuerForSite = selectedSite === "martin-mukoya" ? personalIssuer : defaultIssuer;

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Financial identity"
        description="Configure issuer details, banking, payment methods, and signature for each identity."
        actions={
          <DashboardSelect
            value={selectedSite ?? ""}
            onChange={e => setSelectedSite(e.target.value === "" ? null : e.target.value)}
            options={siteOptions}
            className="w-[300px]"
          />
        }
      />
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-[color:var(--text-muted)]">Loading financial identity…</p>
        </div>
      ) : (
        <FinanceSettingsForm initial={initial ?? defaultIssuerForSite} />
      )}
    </div>
  );
}