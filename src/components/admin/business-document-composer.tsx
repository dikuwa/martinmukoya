"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";
import { BlogEditor } from "@/components/admin/blog-editor";
import { AiWritingAssistant } from "@/components/admin/ai-writing-assistant";
import { Button } from "@/components/ui/button";
import { DashboardSelect } from "@/components/ui/dashboard-select";
import { DashboardCheckbox } from "@/components/ui/dashboard-checkbox";
import { DashboardDatePicker } from "@/components/ui/date-picker";
import { ManualLeadForm, type LeadOption } from "@/components/admin/manual-lead-form";

type Template = {
  id: string; name: string; documentCategory: string; defaultTitle?: string | null;
  defaultBodyMarkdown?: string; defaultTone?: string; defaultStyle?: string; defaultLength?: string;
  signatureRequired?: boolean; senderName?: string | null; senderRole?: string | null;
};

type Lead = LeadOption & { phoneIsWhatsApp?: boolean; };
type Project = { id: string; title: string; slug: string; };
type Site = { id: string; name: string };

const docTypes = [
  { value: "PROPOSAL", label: "Project proposal" },
  { value: "SERVICE_AGREEMENT", label: "Service agreement" },
  { value: "WEB_DESIGN_CONTRACT", label: "Web design contract" },
  { value: "MAINTENANCE_AGREEMENT", label: "Website maintenance agreement" },
  { value: "HOSTING_AGREEMENT", label: "Hosting & domain agreement" },
  { value: "SCOPE_OF_WORK", label: "Scope of work" },
  { value: "PROJECT_BRIEF", label: "Project brief" },
  { value: "CHANGE_REQUEST", label: "Change request" },
  { value: "PROJECT_HANDOVER", label: "Project handover" },
  { value: "CLIENT_ACCEPTANCE", label: "Client acceptance/sign-off" },
  { value: "BUSINESS_LETTER", label: "Formal business letter" },
  { value: "PAYMENT_REMINDER", label: "Payment reminder" },
  { value: "OVERDUE_NOTICE", label: "Overdue payment notice" },
  { value: "MEETING_SUMMARY", label: "Meeting summary" },
  { value: "PROGRESS_REPORT", label: "Project progress report" },
  { value: "AUDIT_REPORT", label: "Website audit report" },
  { value: "MAINTENANCE_REPORT", label: "Website maintenance report" },
  { value: "NDA", label: "Confidentiality agreement (NDA)" },
  { value: "CUSTOM", label: "Custom document" },
];

const inputClass = "h-11 rounded-[calc(var(--radius)*0.75)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-4 text-sm text-[color:var(--text-strong)] outline-none transition placeholder:text-[color:var(--text-faint)] hover:bg-[color:var(--surface-soft)] hover:border-[color:var(--primary)]/30 focus:border-[color:var(--primary)] focus:bg-[color:var(--surface-soft)] focus:shadow-[0_0_0_3px_rgba(107,38,217,0.1)]";

type InitialDoc = {
  id?: string;
  documentType?: string;
  title?: string;
  subject?: string;
  documentNumber?: string | null;
  contactId?: string | null;
  leadId?: string | null;
  projectId?: string | null;
  templateId?: string | null;
  companyName?: string | null;
  recipientName?: string | null;
  recipientEmail?: string | null;
  recipientPhone?: string | null;
  recipientWhatsApp?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  reviewDate?: string | null;
  contentMarkdown?: string;
  internalNotes?: string | null;
  aiTone?: string | null;
  aiStyle?: string | null;
  aiLength?: string | null;
  signatureRequired?: boolean;
  senderName?: string | null;
  senderRole?: string | null;
};

type Props = {
  templates: Template[];
  leads: Lead[];
  projects: Project[];
  sites: Site[];
  initial?: InitialDoc | null;
};

export function BusinessDocumentComposer({ templates, leads: initialLeads, projects, sites, initial }: Props) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [saving, setSaving] = useState(false);
  const [leads, setLeads] = useState(initialLeads);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [pendingLead, setPendingLead] = useState<Lead | null>(null);

  // Form state
  const [documentType, setDocumentType] = useState(initial?.documentType || "PROPOSAL");
  const [title, setTitle] = useState(initial?.title || "");
  const [subject, setSubject] = useState(initial?.subject || "");
  const [selectedTemplate, setSelectedTemplate] = useState(initial?.templateId || "");
  const [selectedLead, setSelectedLead] = useState(initial?.leadId || "");
  const [selectedProject, setSelectedProject] = useState(initial?.projectId || "");
  const [companyName, setCompanyName] = useState(initial?.companyName || "");
  const [recipientName, setRecipientName] = useState(initial?.recipientName || "");
  const [recipientEmail, setRecipientEmail] = useState(initial?.recipientEmail || "");
  const [recipientPhone, setRecipientPhone] = useState(initial?.recipientPhone || "");
  const [recipientWhatsApp, setRecipientWhatsApp] = useState(initial?.recipientWhatsApp || "");
  const [contentMarkdown, setContentMarkdown] = useState(initial?.contentMarkdown || "");
  const [internalNotes, setInternalNotes] = useState(initial?.internalNotes || "");
  const [expiryDate, setExpiryDate] = useState(initial?.expiryDate ? initial.expiryDate.slice(0, 10) : "");
  const [issueDate] = useState(initial?.issueDate ? initial.issueDate.slice(0, 10) : "");
  const [reviewDate] = useState(initial?.reviewDate ? initial.reviewDate.slice(0, 10) : "");
  const [signatureRequired, setSignatureRequired] = useState(initial?.signatureRequired ?? false);
  const [senderName, setSenderName] = useState(initial?.senderName || "");
  const [senderRole, setSenderRole] = useState(initial?.senderRole || "");
  const [tone, setTone] = useState(initial?.aiTone || "Professional");
  const [style, setStyle] = useState(initial?.aiStyle || "Structured");
  const [docLength, setDocLength] = useState(initial?.aiLength || "Medium");

  // Find the selected template to pre-fill content
  const template = useMemo(() => templates.find((t) => t.id === selectedTemplate), [templates, selectedTemplate]);

  const applyTemplate = useCallback((tpl: Template) => {
    setTitle(tpl.defaultTitle || "");
    setContentMarkdown(tpl.defaultBodyMarkdown || "");
    setTone(tpl.defaultTone || "Professional");
    setStyle(tpl.defaultStyle || "Structured");
    setDocLength(tpl.defaultLength || "Medium");
    setSignatureRequired(tpl.signatureRequired ?? false);
    setSenderName(tpl.senderName || "");
    setSenderRole(tpl.senderRole || "");
  }, []);

  const fillFromLead = useCallback((ld: Lead) => {
    setRecipientName(ld.name);
    setRecipientEmail(ld.email);
    setRecipientPhone(ld.phone || "");
    setRecipientWhatsApp(ld.whatsAppNumber || "");
    setCompanyName(ld.company || "");
  }, []);
  const recipientHasValues = Boolean(recipientName || recipientEmail || recipientPhone || recipientWhatsApp || companyName);

  const handleSave = useCallback(async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const body = {
        documentType,
        title: title.trim(),
        subject: subject.trim() || undefined,
        templateId: selectedTemplate || null,
        leadId: selectedLead || null,
        projectId: selectedProject || null,
        companyName: companyName.trim() || undefined,
        recipientName: recipientName.trim() || undefined,
        recipientEmail: recipientEmail.trim() || undefined,
        recipientPhone: recipientPhone.trim() || undefined,
        recipientWhatsApp: recipientWhatsApp.trim() || undefined,
        issueDate: issueDate || undefined,
        expiryDate: expiryDate || undefined,
        reviewDate: reviewDate || undefined,
        contentMarkdown,
        internalNotes: internalNotes.trim() || undefined,
        aiTone: tone, aiStyle: style, aiLength: docLength,
        signatureRequired,
        senderName: senderName.trim() || undefined,
        senderRole: senderRole.trim() || undefined,
      };

      const url = isEdit ? `/api/admin/business-documents/${initial!.id}` : "/api/admin/business-documents";
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Save failed");

      toast.success(isEdit ? "Document updated" : "Document created");
      router.push(`/admin/business-documents/${payload.id || initial!.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [title, subject, documentType, selectedTemplate, selectedLead, selectedProject, companyName, recipientName, recipientEmail, recipientPhone, recipientWhatsApp, contentMarkdown, internalNotes, issueDate, expiryDate, reviewDate, signatureRequired, senderName, senderRole, tone, style, docLength, isEdit, initial, router]);

  return (
    <div className="grid gap-6 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6">
      {/* Document type and template */}
      <div className="grid gap-5 md:grid-cols-[1fr_1fr]">
        <label className="grid gap-2 text-sm font-bold">
          Document type
          <DashboardSelect
            value={documentType}
            onChange={e => setDocumentType(e.target.value)}
            options={docTypes}
            className={inputClass}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Template
          <div className="flex gap-2">
            <DashboardSelect
              value={selectedTemplate}
              onChange={e => setSelectedTemplate(e.target.value)}
              options={[{ label: "None (start blank)", value: "" }, ...templates.map((tpl) => ({ label: tpl.name, value: tpl.id }))]}
              className={`${inputClass} flex-1`}
            />
            {template && (
              <Button type="button" variant="secondary" size="sm" onClick={() => applyTemplate(template)}>
                Apply
              </Button>
            )}
          </div>
        </label>
      </div>

      {/* Title */}
      <label className="grid gap-2 text-sm font-bold">
        Title <span className="text-[color:var(--destructive)]">*</span>
        <input value={title} onChange={e => setTitle(e.target.value)} className={inputClass} placeholder="e.g., FlexTech Media Website Redesign Proposal" />
      </label>

      {/* Subject */}
      <label className="grid gap-2 text-sm font-bold">
        Subject
        <input value={subject} onChange={e => setSubject(e.target.value)} className={inputClass} placeholder="Re: Website redesign project" />
      </label>

      {/* Client info from lead */}
      <div className="grid gap-5 md:grid-cols-[1fr_1fr]">
        <div className="grid gap-2 text-sm font-bold">
          Link to lead <span className="text-[color:var(--text-faint)] font-normal">(auto-fills details)</span>
          <DashboardSelect
            value={selectedLead}
            onChange={e => { setSelectedLead(e.target.value); const ld = leads.find((l) => l.id === e.target.value); if (ld) { if (recipientHasValues) setPendingLead(ld); else fillFromLead(ld); } }}
            options={[{ label: "None selected", value: "" }, ...leads.map((ld) => ({ label: `${ld.name}${ld.company ? ` · ${ld.company}` : ""} — ${ld.email || ld.phone || ld.whatsAppNumber || "No contact"}${ld.source ? ` · ${ld.source}` : ""}`, value: ld.id }))]}
            className={inputClass}
          />
          <Button type="button" variant="secondary" size="sm" className="w-fit" onClick={() => setShowLeadForm(true)}>Create new lead</Button>
        </div>
        <label className="grid gap-2 text-sm font-bold">
          Link to project
          <DashboardSelect
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            options={[{ label: "None selected", value: "" }, ...projects.map((p) => ({ label: p.title, value: p.id }))]}
            className={inputClass}
          />
        </label>
      </div>

      {showLeadForm && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-label="Create new lead"><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--background)] p-5 shadow-xl"><h2 className="mb-5 font-display text-2xl font-black">Create new lead</h2><ManualLeadForm sites={sites.map(site => ({value:site.id,label:site.name}))} projects={projects.map(project => ({value:project.id,label:project.title}))} onCancel={() => setShowLeadForm(false)} onCreated={lead => { setLeads(current => [lead, ...current.filter(item => item.id !== lead.id)]); setSelectedLead(lead.id); if (recipientHasValues) setPendingLead(lead); else fillFromLead(lead); setShowLeadForm(false); toast.success("Lead created and selected"); }}/></div></div>}
      {pendingLead && <div className="fixed inset-0 z-[110] grid place-items-center bg-black/45 p-4" role="alertdialog" aria-modal="true" aria-label="Replace recipient details"><div className="w-full max-w-md rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--background)] p-6 shadow-xl"><h2 className="font-display text-xl font-black">Replace recipient details?</h2><p className="mt-2 text-sm text-[color:var(--text-muted)]">You already entered recipient information. Replace it with details from {pendingLead.name}?</p><div className="mt-5 flex gap-3"><Button type="button" onClick={() => { fillFromLead(pendingLead); setPendingLead(null); }}>Replace details</Button><Button type="button" variant="secondary" onClick={() => setPendingLead(null)}>Keep my edits</Button></div></div></div>}

      {/* Recipient details */}
      <div className="grid gap-5 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-bold">
          Recipient name
          <input value={recipientName} onChange={e => setRecipientName(e.target.value)} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Email
          <input value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} type="email" className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Company
          <input value={companyName} onChange={e => setCompanyName(e.target.value)} className={inputClass} />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-bold">
          Phone
          <input value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          WhatsApp number <span className="text-[color:var(--text-faint)] font-normal">(if different)</span>
          <input value={recipientWhatsApp} onChange={e => setRecipientWhatsApp(e.target.value)} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Expiry / review date
          <DashboardDatePicker
            value={expiryDate ? new Date(expiryDate) : undefined}
            onChange={date => setExpiryDate(date ? date.toISOString().split("T")[0] : "")}
            className={inputClass}
          />
        </label>
      </div>

      {/* Sender info */}
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Sender name
          <input value={senderName} onChange={e => setSenderName(e.target.value)} className={inputClass} placeholder="Martin Mukoya" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Sender role
          <input value={senderRole} onChange={e => setSenderRole(e.target.value)} className={inputClass} placeholder="Managing Director" />
        </label>
      </div>

      {/* AI Writing Assistant */}
      <AiWritingAssistant
        title={title}
        content={contentMarkdown}
        onApplyContent={(value) => {
          setContentMarkdown(value);
          toast.success("AI content applied. Review before saving.");
        }}
        onApplyMetadata={() => {}}
      />

      {/* Markdown Editor */}
      <div className="grid gap-2 text-sm font-bold">
        <span>Content (Markdown)</span>
        <BlogEditor value={contentMarkdown} onChange={setContentMarkdown} />
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-5">
        <DashboardCheckbox
          label="Signature required"
          checked={signatureRequired}
          onChange={e => setSignatureRequired(e.target.checked)}
        />
      </div>

      {/* Internal notes */}
      <label className="grid gap-2 text-sm font-bold">
        Internal notes
        <textarea value={internalNotes} onChange={e => setInternalNotes(e.target.value)} rows={2} className={`${inputClass} min-h-[60px] py-3`} />
      </label>

      {/* Audit info */}
      {initial?.documentNumber && (
        <p className="text-xs text-[color:var(--text-faint)]">Document number: {initial.documentNumber}</p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> {isEdit ? "Save draft" : "Create draft"}</>}
        </Button>
        {isEdit && <Button variant="secondary" disabled={saving} onClick={handleSave}>Save & continue editing</Button>}
        <Button variant="secondary" onClick={() => router.push("/admin/business-documents")}>Cancel</Button>
      </div>
    </div>
  );
}
