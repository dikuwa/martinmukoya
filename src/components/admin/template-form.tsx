"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogEditor } from "@/components/admin/blog-editor";
import { DashboardSelect } from "@/components/ui/dashboard-select";
import { DashboardCheckbox } from "@/components/ui/dashboard-checkbox";
import { Card } from "@/components/ui/card";
import { RequiredLabel } from "@/components/ui/required-label";

type InitialTemplate = {
  id?: string;
  name?: string;
  documentCategory?: string;
  defaultTitle?: string | null;
  defaultSubject?: string | null;
  defaultBodyMarkdown?: string;
  aiInstructions?: string | null;
  defaultTone?: string;
  defaultStyle?: string;
  defaultLength?: string;
  signatureRequired?: boolean;
  senderName?: string | null;
  senderRole?: string | null;
  active?: boolean;
  sortOrder?: number;
};

type Props = { initial?: InitialTemplate | null };

const docTypes = [
  { value: "PROPOSAL", label: "Project proposal" },
  { value: "SERVICE_AGREEMENT", label: "Service agreement" },
  { value: "WEB_DESIGN_CONTRACT", label: "Web design contract" },
  { value: "MAINTENANCE_AGREEMENT", label: "Website maintenance agreement" },
  { value: "SCOPE_OF_WORK", label: "Scope of work" },
  { value: "CHANGE_REQUEST", label: "Change request" },
  { value: "PROJECT_HANDOVER", label: "Project handover" },
  { value: "BUSINESS_LETTER", label: "Business letter" },
  { value: "PAYMENT_REMINDER", label: "Payment reminder" },
  { value: "AUDIT_REPORT", label: "Audit report" },
  { value: "NDA", label: "NDA" },
  { value: "CUSTOM", label: "Custom" },
];

const toneOptions = [
  { value: "Professional", label: "Professional" },
  { value: "Formal", label: "Formal" },
  { value: "Friendly", label: "Friendly" },
  { value: "Persuasive", label: "Persuasive" },
  { value: "Direct", label: "Direct" },
  { value: "Technical", label: "Technical" },
];

const styleOptions = [
  { value: "Structured", label: "Structured" },
  { value: "Concise", label: "Concise" },
  { value: "Detailed", label: "Detailed" },
  { value: "Conversational", label: "Conversational" },
  { value: "Marketing-style", label: "Marketing-style" },
];

const lengthOptions = [
  { value: "Short", label: "Short" },
  { value: "Medium", label: "Medium" },
  { value: "Long", label: "Long" },
];

import { inputClass } from "@/components/ui/input";

export function TemplateForm({ initial }: Props) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(initial?.name || "");
  const [category, setCategory] = useState(initial?.documentCategory || "PROPOSAL");
  const [defaultTitle, setDefaultTitle] = useState(initial?.defaultTitle || "");
  const [defaultSubject, setDefaultSubject] = useState(initial?.defaultSubject || "");
  const [bodyMarkdown, setBodyMarkdown] = useState(initial?.defaultBodyMarkdown || "");
  const [aiInstructions, setAiInstructions] = useState(initial?.aiInstructions || "");
  const [defaultTone, setDefaultTone] = useState(initial?.defaultTone || "Professional");
  const [defaultStyle, setDefaultStyle] = useState(initial?.defaultStyle || "Structured");
  const [defaultLength, setDefaultLength] = useState(initial?.defaultLength || "Medium");
  const [signatureRequired, setSignatureRequired] = useState(initial?.signatureRequired ?? false);
  const [senderName, setSenderName] = useState(initial?.senderName || "");
  const [senderRole, setSenderRole] = useState(initial?.senderRole || "");
  const [active, setActive] = useState(initial?.active ?? true);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Template name is required"); return; }
    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        documentCategory: category,
        defaultTitle: defaultTitle.trim() || undefined,
        defaultSubject: defaultSubject.trim() || undefined,
        defaultBodyMarkdown: bodyMarkdown,
        aiInstructions: aiInstructions.trim() || undefined,
        defaultTone, defaultStyle, defaultLength,
        signatureRequired, senderName: senderName.trim() || undefined,
        senderRole: senderRole.trim() || undefined,

        active,
      };

      const url = isEdit ? `/api/admin/business-templates/${initial!.id}` : "/api/admin/business-templates";
      const method = isEdit ? "PATCH" : "POST";
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Save failed");
      toast.success(isEdit ? "Template updated" : "Template created");
      router.push("/admin/business-templates");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [name, category, defaultTitle, defaultSubject, bodyMarkdown, aiInstructions, defaultTone, defaultStyle, defaultLength, signatureRequired, senderName, senderRole, active, isEdit, initial, router]);

  return (
    <Card padding="lg" className="grid gap-6" onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-[1fr_200px]">
        <label className="grid min-w-0 gap-2 text-sm font-bold">
          <RequiredLabel>Template name</RequiredLabel>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="e.g., Standard proposal" />
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-bold">
          Category
          <DashboardSelect
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={docTypes}
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Default title
          <input value={defaultTitle} onChange={(e) => setDefaultTitle(e.target.value)} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Default subject
          <input value={defaultSubject} onChange={(e) => setDefaultSubject(e.target.value)} className={inputClass} />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-bold">
          Default tone
          <DashboardSelect
            value={defaultTone}
            onChange={(e) => setDefaultTone(e.target.value)}
            options={toneOptions}
            className={inputClass}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Default style
          <DashboardSelect
            value={defaultStyle}
            onChange={(e) => setDefaultStyle(e.target.value)}
            options={styleOptions}
            className={inputClass}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Default length
          <DashboardSelect
            value={defaultLength}
            onChange={(e) => setDefaultLength(e.target.value)}
            options={lengthOptions}
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid gap-2 text-sm font-bold">
        <span>Default body (Markdown)</span>
        <BlogEditor value={bodyMarkdown} onChange={setBodyMarkdown} />
      </div>

      <label className="grid gap-2 text-sm font-bold">
        AI generation instructions
        <textarea value={aiInstructions} onChange={(e) => setAiInstructions(e.target.value)} rows={3} className={`${inputClass} min-h-[72px] py-3`} placeholder="Describe what AI should generate for this document type..." />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Sender name
          <input value={senderName} onChange={(e) => setSenderName(e.target.value)} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Sender role
          <input value={senderRole} onChange={(e) => setSenderRole(e.target.value)} className={inputClass} />
        </label>
      </div>

      <div className="flex flex-wrap gap-5">
        <DashboardCheckbox
          label="Signature required"
          checked={signatureRequired}
          onChange={(e) => setSignatureRequired(e.target.checked)}
        />
        <DashboardCheckbox
          label="Active"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> {isEdit ? "Update template" : "Create template"}</>}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/business-templates")}>Cancel</Button>
      </div>
    </Card>
  );
}