"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

type Service = { id: string; name: string; description: string | null; price: string; active: boolean };

export function ServiceCatalogForm({ service }: { service?: Service }) {
  const router = useRouter();
  const [saving,setSaving] = useState(false);
  const [name,setName] = useState(service?.name ?? "");
  const [description,setDescription] = useState(service?.description ?? "");
  const [price,setPrice] = useState(service?.price ?? "");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await save({ name, description, price: Number(price) });
  }

  async function save(input: { name: string; description: string; price: number } | { active: boolean }) {
    setSaving(true);
    try {
      const response = await fetch(service ? `/api/admin/service-catalog/${service.id}` : "/api/admin/service-catalog", {
        method: service ? "PATCH" : "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.issues?.[0]?.message || data.error || "Unable to save service.");
      toast.success("active" in input ? (input.active ? "Service restored" : "Service archived") : service ? "Service updated" : "Service added");
      if (!service) {
        setName("");
        setDescription("");
        setPrice("");
      }
      router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to save service."); }
    finally { setSaving(false); }
  }
  const cls = "h-10 w-full rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-3 text-sm";
  return <form onSubmit={submit} className="grid gap-3 rounded-md border border-[color:var(--border-subtle)] p-4">
    <h2 className="font-semibold">{service ? "Edit service" : "Add a reusable service"}</h2>
    <label className="grid gap-1 text-sm">Service name
      <input required className={cls} value={name} onChange={e => setName(e.target.value)}/>
    </label>
    <label className="grid gap-1 text-sm">Description
      <textarea rows={3} className={cls + " h-auto py-2"} value={description} onChange={e => setDescription(e.target.value)}/>
    </label>
    <label className="grid gap-1 text-sm">Default price (N$)
      <input required type="number" min="0" step="0.01" className={cls} value={price} onChange={e => setPrice(e.target.value)}/>
    </label>
    <Button disabled={saving}>{saving ? "Saving…" : service ? "Save service" : "Add service"}</Button>
    {service && <Button type="button" variant="secondary" disabled={saving} onClick={() => save({ active: !service.active })}>
      {service.active ? "Archive service" : "Restore service"}
    </Button>}
  </form>;
}