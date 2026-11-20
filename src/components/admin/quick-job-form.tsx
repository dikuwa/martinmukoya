"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { DashboardSelect } from "@/components/ui/dashboard-select";

type Site = { id: string; name: string; slug: string };
type Service = { id: string; name: string; description: string | null; price: { toString(): string } };
export function QuickJobForm({ customerId, sites, services }: { customerId: string; sites: Site[]; services: Service[] }) {
  const router = useRouter();
  const defaultSite = sites.find(s => s.slug === "flextech-media")?.id || sites[0]?.id;
  const [description,setDescription] = useState("");
  const [amount,setAmount] = useState("0");
  const [saving,setSaving] = useState(false);
  const field = "h-10 w-full rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-3 text-sm";
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    try {
      const siteId = String(new FormData(event.currentTarget).get("siteId"));
      const response = await fetch("/api/admin/quick-jobs", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ customerId, siteId, description, amount: Number(amount) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.issues?.[0]?.message || "Could not add job");
      toast.success("Quick job created");
      router.push(`/admin/documents?booking=${data.id}`);
      router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not add job"); }
    finally { setSaving(false); }
  }
  return <form onSubmit={submit} className="grid gap-3 rounded-md border border-[color:var(--border-subtle)] p-4">
    <h2 className="font-semibold">Quick service / job</h2>
    <label className="grid gap-1 text-sm">Saved service
      <DashboardSelect className={field} defaultValue="" onChange={event => {
        const service = services.find(s => s.id === event.target.value);
        if (service) { setDescription(service.description || service.name); setAmount(String(service.price)); }
      }} options={[{ value: "", label: "Custom service" }, ...services.map(s => ({ value: s.id, label: s.name }))]}/>
    </label>
    <label className="grid gap-1 text-sm">Description
      <textarea className={field + " h-auto py-2"} rows={2} value={description} onChange={e => setDescription(e.target.value)} required/>
    </label>
    <div className="grid grid-cols-2 gap-3">
      <label className="grid gap-1 text-sm">Price (N$)
        <input type="number" step="0.01" min="0" className={field} value={amount} onChange={e => setAmount(e.target.value)}/>
      </label>
      <label className="grid gap-1 text-sm">Issuer
        <DashboardSelect name="siteId" className={field} defaultValue={defaultSite}
          options={sites.map(s => ({ value: s.id, label: s.name }))}/>
      </label>
    </div>
    <Button disabled={saving}>{saving ? "Saving…" : "Create job & prepare quotation"}</Button>
  </form>;
}