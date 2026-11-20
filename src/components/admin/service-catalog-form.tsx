"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export function ServiceCatalogForm() {
  const router = useRouter();
  const [saving,setSaving] = useState(false);
  const [name,setName] = useState("");
  const [description,setDescription] = useState("");
  const [price,setPrice] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    try {
      const response = await fetch("/api/admin/service-catalog", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, description, price: Number(price) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.issues?.[0]?.message || "Unable to save service.");
      toast.success("Service added");
      setName(""); setDescription(""); setPrice("");
      router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to save service."); }
    finally { setSaving(false); }
  }
  const cls = "h-10 w-full rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-3 text-sm";
  return <form onSubmit={submit} className="grid gap-3 rounded-md border border-[color:var(--border-subtle)] p-4">
    <h2 className="font-semibold">Add a reusable service</h2>
    <label className="grid gap-1 text-sm">Service name
      <input required className={cls} value={name} onChange={e => setName(e.target.value)}/>
    </label>
    <label className="grid gap-1 text-sm">Description
      <textarea rows={3} className={cls + " h-auto py-2"} value={description} onChange={e => setDescription(e.target.value)}/>
    </label>
    <label className="grid gap-1 text-sm">Default price (N$)
      <input required type="number" min="0" step="0.01" className={cls} value={price} onChange={e => setPrice(e.target.value)}/>
    </label>
    <Button disabled={saving}>{saving ? "Saving…" : "Add service"}</Button>
  </form>;
}