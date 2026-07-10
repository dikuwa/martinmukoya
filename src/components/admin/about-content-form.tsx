"use client";

import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

type AboutValues = {
  eyebrow: string;
  title: string;
  description: string;
  metadataDescription: string;
  ctaLabel: string;
  stackTitle: string;
  stackDescription: string;
  cards: Array<{ title: string; description: string }>;
  aboutImage: string;
  heroImage: string;
};

const fieldClass = "w-full rounded-[calc(var(--radius)*0.75)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-4 py-3 text-sm text-[color:var(--text-strong)] outline-none transition focus:border-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--primary)]/15";

export function AboutContentForm({ initial }: { initial: AboutValues }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = (key: keyof AboutValues, value: AboutValues[keyof AboutValues]) => setValues((current) => ({ ...current, [key]: value }));

  async function save() {
    setSaving(true);
    const settings: Array<[string, unknown]> = [
      ["pages.about.eyebrow", values.eyebrow], ["pages.about.title", values.title],
      ["pages.about.description", values.description], ["pages.about.metadataDescription", values.metadataDescription],
      ["pages.about.ctaLabel", values.ctaLabel], ["pages.about.stackTitle", values.stackTitle],
      ["pages.about.stackDescription", values.stackDescription], ["pages.about.cards", values.cards],
      ["home.aboutImage", values.aboutImage], ["home.heroImage", values.heroImage],
    ];
    try {
      const responses = await Promise.all(settings.map(([key, value]) => fetch("/api/site-settings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, siteSlug: "martin-mukoya", value }),
      })));
      if (responses.some((response) => !response.ok)) throw new Error("One or more fields could not be saved");
      toast.success("About content saved");
      router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "About content could not be saved"); }
    finally { setSaving(false); }
  }

  return <div className="grid gap-6">
    <div className="grid gap-5 rounded-[var(--radius)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6">
      <h2 className="font-display text-xl font-black text-[color:var(--text-strong)]">About page copy</h2>
      {(["eyebrow", "title", "ctaLabel", "stackTitle"] as const).map((key) => <label key={key} className="grid gap-2 text-sm font-bold capitalize text-[color:var(--text-strong)]">{key.replace(/([A-Z])/g, " $1")}<input className={fieldClass} value={values[key]} onChange={(event) => set(key, event.target.value)} /></label>)}
      {(["description", "metadataDescription", "stackDescription"] as const).map((key) => <label key={key} className="grid gap-2 text-sm font-bold capitalize text-[color:var(--text-strong)]">{key.replace(/([A-Z])/g, " $1")}<textarea className={`${fieldClass} min-h-28`} value={values[key]} onChange={(event) => set(key, event.target.value)} /></label>)}
      <label className="grid gap-2 text-sm font-bold text-[color:var(--text-strong)]">Cards (JSON)<textarea className={`${fieldClass} min-h-52 font-mono`} value={JSON.stringify(values.cards, null, 2)} onChange={(event) => { try { const cards=JSON.parse(event.target.value); if(Array.isArray(cards)) set("cards", cards); } catch { /* keep last valid cards */ } }} /></label>
    </div>
    <div className="grid gap-5 rounded-[var(--radius)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6 md:grid-cols-2">
      <ImageUploadField label="Homepage About image" folder="settings/about" value={values.aboutImage} onChange={(url) => set("aboutImage", url)} cropAspect={false} />
      <ImageUploadField label="Homepage hero image" folder="settings/hero" value={values.heroImage} onChange={(url) => set("heroImage", url)} cropAspect={false} />
    </div>
    <div><Button type="button" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save About Content"}</Button></div>
  </div>;
}
