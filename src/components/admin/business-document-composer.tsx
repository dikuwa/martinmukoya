"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";
import { BlogEditor } from "@/components/admin/blog-editor";
import { AiWritingAssistant } from "@/components/admin/ai-writing-assistant";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/dialog";
import { DashboardSelect } from "@/components/ui/dashboard-select";
import { DashboardCheckbox } from "@/components/ui/dashboard-checkbox";
import { DashboardDatePicker } from "@/components/ui/date-picker";
import { ManualLeadForm, type LeadOption } from "@/components/admin/manual-lead-form";
import { buildDocumentTemplateContext, findUnresolvedPlaceholders, getTemplateMarkdown, resolveTemplatePlaceholders } from "@/lib/business-document-templates";
import { Card } from "@/components/ui/card";

type Template = {
  id: string; name: string; documentCategory: string; defaultTitle?: string | null;
  defaultBodyMarkdown?: string; defaultTone?: string; defaultStyle?: string; defaultLength?: string;
  defaultSubject?: string | null;
  signatureRequired?: boolean; senderName?: string | null; senderRole?: string | null;
};

type Lead = LeadOption & { phoneIsWhatsApp?: boolean; };
type Project = { id: string; title: string; slug: string; summary?: string; description?: string; outcome?: string | null; };
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

import { inputClass } from "@/components/ui/input";

type FinancialDoc = { id: string; number: string | null; type: string; total: unknown; customerName: string };

type InitialDoc = {
  id?: string;
  documentType?: string;
  title?: string;
  subject?: string;
  documentNumber?: string | null;
  contactId?: string | null;
  leadId?: string | null;
  projectId?: string | null;
  financialDocumentId?: string | null;
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
  financialDocuments: FinancialDoc[];
  sites: Site[];
  initial?: InitialDoc | null;
  business: { name: string; email: string; phone: string; address: string };
  currentUser: { name: string; roleTitle: string };
  generatedIssueDate: string;
};

export function BusinessDocumentComposer({ templates, leads: initialLeads, projects, financialDocuments, sites, initial, business, currentUser, generatedIssueDate }: Props) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [saving, setSaving] = useState(false);
  const [leads, setLeads] = useState(initialLeads);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [pendingLead, setPendingLead] = useState<Lead | null>(null);
  const [pendingTemplate, setPendingTemplate] = useState<Template | null>(null);
  const [unresolvedForSave, setUnresolvedForSave] = useState<string[]>([]);
  const [applyingTemplate, setApplyingTemplate] = useState(false);
  // Existing drafts are user-owned content, not an unchanged template result.
  // Only content applied during this composer session may be replaced silently.
  const lastAppliedContent = useRef("");
  const lastAppliedTitle = useRef(initial?.title || "");
  const lastAppliedSubject = useRef(initial?.subject || "");

  // Form state
  const [documentType, setDocumentType] = useState(initial?.documentType || "PROPOSAL");
  const [title, setTitle] = useState(initial?.title || "");
  const [subject, setSubject] = useState(initial?.subject || "");
  const [selectedTemplate, setSelectedTemplate] = useState(initial?.templateId || "");
  const [selectedLead, setSelectedLead] = useState(initial?.leadId || "");
  const [selectedProject, setSelectedProject] = useState(initial?.projectId || "");
  const [selectedFinancialDocument, setSelectedFinancialDocument] = useState(initial?.financialDocumentId || "");
  const [companyName, setCompanyName] = useState(initial?.companyName || "");
  const [recipientName, setRecipientName] = useState(initial?.recipientName || "");
  const [recipientEmail, setRecipientEmail] = useState(initial?.recipientEmail || "");
  const [recipientPhone, setRecipientPhone] = useState(initial?.recipientPhone || "");
  const [recipientWhatsApp, setRecipientWhatsApp] = useState(initial?.recipientWhatsApp || "");
  const [contentMarkdown, setContentMarkdown] = useState(initial?.contentMarkdown || "");
  const [internalNotes, setInternalNotes] = useState(initial?.internalNotes || "");
  const [expiryDate, setExpiryDate] = useState(initial?.expiryDate ? initial.expiryDate.slice(0, 10) : "");
  const [issueDate] = useState(initial?.issueDate ? initial.issueDate.slice(0, 10) : generatedIssueDate);
  const [reviewDate] = useState(initial?.reviewDate ? initial.reviewDate.slice(0, 10) : "");
  const [signatureRequired, setSignatureRequired] = useState(initial?.signatureRequired ?? false);
  const [senderName, setSenderName] = useState(initial?.senderName || "");
  const [senderRole, setSenderRole] = useState(initial?.senderRole || "");
  const [tone, setTone] = useState(initial?.aiTone || "Professional");
  const [style, setStyle] = useState(initial?.aiStyle || "Structured");
  const [docLength, setDocLength] = useState(initial?.aiLength || "Medium");
  const documentReference = initial?.documentNumber;

  // Find the selected template to pre-fill content
  const template = useMemo(() => templates.find((t) => t.id === selectedTemplate), [templates, selectedTemplate]);

  const applyTemplate = useCallback(async (tpl: Template) => {
    setApplyingTemplate(true);
    try {
      const response = await fetch(`/api/admin/business-templates/${tpl.id}`);
      const payload = await response.json().catch(() => null) as Record<string, unknown> | null;
      if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Unable to load the selected template.");
      if (!payload || typeof payload !== "object") throw new Error("The template response was invalid.");
      const markdown = getTemplateMarkdown(payload);
      if (!markdown) throw new Error("The selected template has no Markdown content.");
      const lead = leads.find((item) => item.id === selectedLead);
      const project = projects.find((item) => item.id === selectedProject);
      const context = buildDocumentTemplateContext({
        values: { title, subject, companyName, recipientName, recipientEmail, recipientPhone, recipientWhatsApp, senderName: senderName || tpl.senderName || "", senderRole: senderRole || tpl.senderRole || "", issueDate, expiryDate, reviewDate },
        lead, project, business, currentUser, documentReference,
      });
      const resolvedTitle = resolveTemplatePlaceholders(typeof payload.defaultTitle === "string" ? payload.defaultTitle : "", context);
      const contextWithTitle = { ...context, document_title: resolvedTitle || title, document: { ...(context.document as Record<string, unknown>), title: resolvedTitle || title } };
      const resolvedSubject = resolveTemplatePlaceholders(typeof payload.defaultSubject === "string" ? payload.defaultSubject : "", contextWithTitle);
      const resolvedContent = resolveTemplatePlaceholders(markdown, { ...contextWithTitle, document_subject: resolvedSubject || subject, document: { ...(contextWithTitle.document as Record<string, unknown>), subject: resolvedSubject || subject } });
      if (resolvedTitle.trim() && (!title.trim() || title === lastAppliedTitle.current)) { setTitle(resolvedTitle); lastAppliedTitle.current = resolvedTitle; }
      if (resolvedSubject.trim() && (!subject.trim() || subject === lastAppliedSubject.current)) { setSubject(resolvedSubject); lastAppliedSubject.current = resolvedSubject; }
      setContentMarkdown(resolvedContent);
      lastAppliedContent.current = resolvedContent;
      setTone(typeof payload.defaultTone === "string" ? payload.defaultTone : "Professional");
      setStyle(typeof payload.defaultStyle === "string" ? payload.defaultStyle : "Structured");
      setDocLength(typeof payload.defaultLength === "string" ? payload.defaultLength : "Medium");
      setSignatureRequired(typeof payload.signatureRequired === "boolean" ? payload.signatureRequired : false);
      if (!senderName && typeof payload.senderName === "string") setSenderName(payload.senderName);
      if (!senderRole && typeof payload.senderRole === "string") setSenderRole(payload.senderRole);
      toast.success("Template applied to the document.");
    } catch (error) {
      console.error("Failed to apply document template:", error);
      toast.error(error instanceof Error ? error.message : "Unable to apply the selected template.");
    } finally {
      setApplyingTemplate(false);
      setPendingTemplate(null);
    }
  }, [business, companyName, currentUser, documentReference, expiryDate, issueDate, leads, projects, recipientEmail, recipientName, recipientPhone, recipientWhatsApp, reviewDate, selectedLead, selectedProject, senderName, senderRole, subject, title]);

  const requestApplyTemplate = useCallback(() => {
    if (!template) { toast.error("Select a template first."); return; }
    if (contentMarkdown.trim() && contentMarkdown !== lastAppliedContent.current) setPendingTemplate(template);
    else void applyTemplate(template);
  }, [applyTemplate, contentMarkdown, template]);

  const fillFromLead = useCallback((ld: Lead) => {
    setRecipientName(ld.name);
    setRecipientEmail(ld.email);
    setRecipientPhone(ld.phone || "");
    setRecipientWhatsApp(ld.whatsAppNumber || "");
    setCompanyName(ld.company || "");
  }, []);
  const recipientHasValues = Boolean(recipientName || recipientEmail || recipientPhone || recipientWhatsApp || companyName);

  const handleSave = useCallback(async ({ allowUnresolved = false, navigate = true }: { allowUnresolved?: boolean; navigate?: boolean } = {}) => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    const unresolved = findUnresolvedPlaceholders(`${title}\n${subject}\n${contentMarkdown}`);
    if (unresolved.length && !allowUnresolved) { setUnresolvedForSave(unresolved); return; }
    setUnresolvedForSave([]);
    setSaving(true);
    try {
      const body = {
        documentType,
        title: title.trim(),
        subject: subject.trim() || undefined,
        templateId: selectedTemplate || null,
        leadId: selectedLead || null,
        projectId: selectedProject || null,
        financialDocumentId: selectedFinancialDocument || null,
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
      if (navigate) {
        router.push(`/admin/business-documents/${payload.id || initial!.id}`);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [title, subject, documentType, selectedTemplate, selectedLead, selectedProject, selectedFinancialDocument, companyName, recipientName, recipientEmail, recipientPhone, recipientWhatsApp, contentMarkdown, internalNotes, issueDate, expiryDate, reviewDate, signatureRequired, senderName, senderRole, tone, style, docLength, isEdit, initial, router]);

  return (
    <Card padding="lg" className="grid gap-6">
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
              <Button type="button" variant="secondary" size="sm" disabled={applyingTemplate} onClick={requestApplyTemplate}>
                {applyingTemplate ? <><Loader2 size={14} className="animate-spin" /> Applying…</> : "Apply"}
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

      {/* Link to quote/invoice */}
      {financialDocuments.length > 0 && (
        <label className="grid gap-2 text-sm font-bold">
          Link to quote/invoice <span className="text-[color:var(--text-faint)] font-normal">(optional cross-reference)</span>
          <DashboardSelect
            value={selectedFinancialDocument}
            onChange={e => setSelectedFinancialDocument(e.target.value)}
            options={[{ label: "None", value: "" }, ...financialDocuments.map((fd) => ({ label: `${fd.number || "Draft"} — ${fd.type} — ${fd.customerName} — N$${Number(String(fd.total)).toFixed(2)}`, value: fd.id }))]}
            className={inputClass}
          />
        </label>
      )}

      <Dialog open={showLeadForm} onOpenChange={setShowLeadForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create new lead</DialogTitle>
          </DialogHeader>
          <ManualLeadForm sites={sites.map(site => ({value:site.id,label:site.name}))} projects={projects.map(project => ({value:project.id,label:project.title}))} onCancel={() => setShowLeadForm(false)} onCreated={lead => { setLeads(current => [lead, ...current.filter(item => item.id !== lead.id)]); setSelectedLead(lead.id); if (recipientHasValues) setPendingLead(lead); else fillFromLead(lead); setShowLeadForm(false); toast.success("Lead created and selected"); }}/>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!pendingLead} onOpenChange={(open) => { if (!open) setPendingLead(null); }}>
        <AlertDialogContent>
          <AlertDialogTitle>Replace recipient details?</AlertDialogTitle>
          <AlertDialogDescription>You already entered recipient information. Replace it with details from {pendingLead?.name}?</AlertDialogDescription>
          <div className="mt-5 flex gap-3">
            <Button type="button" onClick={() => { if (pendingLead) { fillFromLead(pendingLead); setPendingLead(null); } }}>Replace details</Button>
            <Button type="button" variant="secondary" onClick={() => setPendingLead(null)}>Keep my edits</Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!pendingTemplate} onOpenChange={(open) => { if (!open) setPendingTemplate(null); }}>
        <AlertDialogContent>
          <AlertDialogTitle>Replace document content?</AlertDialogTitle>
          <AlertDialogDescription>Applying {pendingTemplate?.name} will replace your current document content. This cannot be undone after saving.</AlertDialogDescription>
          <div className="mt-5 flex gap-3">
            <Button type="button" onClick={() => { if (pendingTemplate) void applyTemplate(pendingTemplate); }}>Replace content</Button>
            <Button type="button" variant="secondary" onClick={() => setPendingTemplate(null)}>Cancel</Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={unresolvedForSave.length > 0} onOpenChange={(open) => { if (!open) setUnresolvedForSave([]); }}>
        <AlertDialogContent className="max-h-[calc(100vh-2rem)] flex-col">
          <AlertDialogTitle>Unresolved template fields</AlertDialogTitle>
          <AlertDialogDescription>Complete these fields before finalising the document:</AlertDialogDescription>
          <ul className="mt-3 min-h-0 flex-1 list-disc overflow-y-auto pl-5 pr-2 text-sm text-[color:var(--text-muted)]">
            {unresolvedForSave.map((key) => <li key={key}>{key}</li>)}
          </ul>
          <div className="mt-5 flex shrink-0 flex-wrap gap-3 border-t border-[color:var(--border-subtle)] pt-4">
            <Button type="button" variant="secondary" onClick={() => setUnresolvedForSave([])}>Return to document</Button>
            <Button type="button" onClick={() => void handleSave({ allowUnresolved: true })}>Save as draft anyway</Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

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
        surface="business-document"
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
        <Button onClick={() => void handleSave()} disabled={saving}>
          {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> {isEdit ? "Save draft" : "Create draft"}</>}
        </Button>
        {isEdit && <Button variant="secondary" disabled={saving} onClick={() => void handleSave({ navigate: false })}>Save & continue editing</Button>}
        <Button variant="secondary" onClick={() => router.push("/admin/business-documents")}>Cancel</Button>
      </div>
    </Card>
  );
}
