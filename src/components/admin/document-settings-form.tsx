"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSelect } from "@/components/ui/dashboard-select";
import { DashboardCheckbox } from "@/components/ui/dashboard-checkbox";

const inputClass = "h-11 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--background)] px-4 text-sm outline-none focus:border-[color:var(--primary)]";

type DocSettings = {
  id?: string;
  defaultSenderName: string;
  defaultSenderRole: string;
  defaultSignature: string;
  backdropEnabled: boolean;
  defaultBusinessExpiryDays: number;
  defaultProposalValidity: number;
  defaultEmailSubject: string;
  defaultEmailBody: string;
  defaultWhatsAppMsg: string;
  aiDefaultTone: string;
  aiDefaultStyle: string;
  aiDefaultLength: string;
  acceptanceEnabled: boolean;
};

const toneOptions = [
  { label: "Professional", value: "Professional" },
  { label: "Formal", value: "Formal" },
  { label: "Friendly", value: "Friendly" },
  { label: "Persuasive", value: "Persuasive" },
  { label: "Direct", value: "Direct" },
  { label: "Technical", value: "Technical" },
];

const styleOptions = [
  { label: "Structured", value: "Structured" },
  { label: "Concise", value: "Concise" },
  { label: "Detailed", value: "Detailed" },
  { label: "Conversational", value: "Conversational" },
  { label: "Marketing-style", value: "Marketing-style" },
];

const lengthOptions = [
  { label: "Short", value: "Short" },
  { label: "Medium", value: "Medium" },
  { label: "Long", value: "Long" },
];

export function DocumentSettingsForm() {
  const [settings, setSettings] = useState<DocSettings>({
    defaultSenderName: "Martin Mukoya",
    defaultSenderRole: "Managing Director",
    defaultSignature: "",
    backdropEnabled: true,
    defaultBusinessExpiryDays: 30,
    defaultProposalValidity: 30,
    defaultEmailSubject: "Document {{documentNumber}} from FlexTech Media",
    defaultEmailBody: "Hello {{recipientName}},\n\nPlease find the document below.\n\n{{shareLink}}\n\nRegards,\n{{senderName}}",
    defaultWhatsAppMsg: "Good afternoon {{recipientName}},\n\nPlease find your document below:\n{{shareLink}}\n\nRegards,\n{{senderName}}",
    aiDefaultTone: "Professional",
    aiDefaultStyle: "Structured",
    aiDefaultLength: "Medium",
    acceptanceEnabled: true,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/document-settings");
        if (res.ok) {
          const data = await res.json();
          setSettings({ ...settings, ...data });
        }
      } catch { /* use defaults */ }
      finally { setLoading(false); }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/document-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save");
      const result = await res.json();
      toast.success(`Document settings saved. ${result.documentsUpdated ?? 0} existing documents updated.`);
    } catch {
      toast.error("Failed to save document settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6"><p className="text-sm text-[color:var(--text-muted)]">Loading settings...</p></div>;

  return (
    <div className="grid gap-6 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6">
      <section className="grid gap-5 md:grid-cols-2">
        <h2 className="font-display text-xl font-black md:col-span-2">Default sender</h2>
        <label className="grid gap-2 text-sm font-bold">
          Sender name
          <input value={settings.defaultSenderName} onChange={(e) => setSettings({ ...settings, defaultSenderName: e.target.value })} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Sender role
          <input value={settings.defaultSenderRole} onChange={(e) => setSettings({ ...settings, defaultSenderRole: e.target.value })} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-bold md:col-span-2">
          Default signature
          <textarea value={settings.defaultSignature} onChange={(e) => setSettings({ ...settings, defaultSignature: e.target.value })} rows={2} className={`${inputClass} min-h-16 py-3`} />
        </label>
      </section>

      <section className="grid gap-5 border-t border-[color:var(--border-subtle)] pt-6 md:grid-cols-3">
        <h2 className="font-display text-xl font-black md:col-span-3">Defaults</h2>
        <label className="grid gap-2 text-sm font-bold">
          Business doc expiry (days)
          <input type="number" min={1} max={365} value={settings.defaultBusinessExpiryDays} onChange={(e) => setSettings({ ...settings, defaultBusinessExpiryDays: parseInt(e.target.value) || 30 })} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Proposal validity (days)
          <input type="number" min={1} max={365} value={settings.defaultProposalValidity} onChange={(e) => setSettings({ ...settings, defaultProposalValidity: parseInt(e.target.value) || 30 })} className={inputClass} />
        </label>
        <DashboardCheckbox
          label="Document backdrop enabled"
          checked={settings.backdropEnabled}
          onChange={(e) => setSettings({ ...settings, backdropEnabled: e.target.checked })}
        />
      </section>

      <section className="grid gap-5 border-t border-[color:var(--border-subtle)] pt-6">
        <h2 className="font-display text-xl font-black">Email templates</h2>
        <label className="grid gap-2 text-sm font-bold">
          Default subject
          <input value={settings.defaultEmailSubject} onChange={(e) => setSettings({ ...settings, defaultEmailSubject: e.target.value })} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Default email body
          <textarea value={settings.defaultEmailBody} onChange={(e) => setSettings({ ...settings, defaultEmailBody: e.target.value })} rows={4} className={`${inputClass} min-h-24 py-3 font-mono text-xs`} />
        </label>
        <p className="text-xs text-[color:var(--text-muted)]">Available variables: {`{{recipientName}}`}, {`{{documentNumber}}`}, {`{{documentType}}`}, {`{{shareLink}}`}, {`{{senderName}}`}</p>
      </section>

      <section className="grid gap-5 border-t border-[color:var(--border-subtle)] pt-6">
        <h2 className="font-display text-xl font-black">WhatsApp template</h2>
        <label className="grid gap-2 text-sm font-bold">
          Default WhatsApp message
          <textarea value={settings.defaultWhatsAppMsg} onChange={(e) => setSettings({ ...settings, defaultWhatsAppMsg: e.target.value })} rows={4} className={`${inputClass} min-h-24 py-3 font-mono text-xs`} />
        </label>
      </section>

      <section className="grid gap-5 border-t border-[color:var(--border-subtle)] pt-6 md:grid-cols-3">
        <h2 className="font-display text-xl font-black md:col-span-3">AI defaults</h2>
        <label className="grid gap-2 text-sm font-bold">
          Default tone
          <DashboardSelect
            value={settings.aiDefaultTone}
            onChange={(e) => setSettings({ ...settings, aiDefaultTone: e.target.value })}
            options={toneOptions}
            className={inputClass}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Default style
          <DashboardSelect
            value={settings.aiDefaultStyle}
            onChange={(e) => setSettings({ ...settings, aiDefaultStyle: e.target.value })}
            options={styleOptions}
            className={inputClass}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Default length
          <DashboardSelect
            value={settings.aiDefaultLength}
            onChange={(e) => setSettings({ ...settings, aiDefaultLength: e.target.value })}
            options={lengthOptions}
            className={inputClass}
          />
        </label>
      </section>

      <section className="grid gap-5 border-t border-[color:var(--border-subtle)] pt-6">
        <h2 className="font-display text-xl font-black">Acceptance</h2>
        <DashboardCheckbox
          label="Enable document acceptance on public pages"
          checked={settings.acceptanceEnabled}
          onChange={(e) => setSettings({ ...settings, acceptanceEnabled: e.target.checked })}
        />
      </section>

      <Button onClick={save} disabled={saving}>
        {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save document settings</>}
      </Button>
    </div>
  );
}
