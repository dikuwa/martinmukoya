"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { DashboardSelect } from "@/components/ui/dashboard-select";
import { DashboardDatePicker } from "@/components/ui/date-picker";

export type LeadOption = { id: string; name: string; email: string; phone?: string | null; company?: string | null; whatsAppNumber?: string | null; source?: string };
type Option = { value: string; label: string };
type Props = { sites: Option[]; projects: Option[]; onCreated?: (lead: LeadOption) => void; onCancel?: () => void };

const field = "h-11 w-full rounded-[calc(var(--radius)*0.75)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-4 text-sm outline-none focus:border-[color:var(--primary)]";
const sources = ["manual", "referral", "phone", "WhatsApp", "email", "walk-in", "other"].map(value => ({ value, label: value.replace(/-/g, " ") }));
const statuses = ["NEW", "REVIEWING", "CONTACTED", "QUALIFIED", "WON", "LOST", "ARCHIVED"].map(value => ({ value, label: value.replace(/_/g, " ") }));
const services = ["WEB_APP", "BOOKING_SYSTEM", "ECOMMERCE", "AI_AUTOMATION", "OTHER"].map(value => ({ value, label: value.replace(/_/g, " ") }));
const contacts = ["EMAIL", "PHONE", "WHATSAPP"].map(value => ({ value, label: value }));

export function ManualLeadForm({ sites, projects, onCreated, onCancel }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [duplicate, setDuplicate] = useState<LeadOption[] | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState({ name: "", company: "", email: "", phone: "", whatsAppNumber: "", preferredContact: "EMAIL", source: "manual", serviceType: "OTHER", projectGoal: "", message: "", internalNotes: "", status: "NEW", siteId: sites[0]?.value || "", linkedProjectId: "", followUpAt: "" });
  const set = (key: keyof typeof values, value: string) => setValues(current => ({ ...current, [key]: value }));

  async function submit(createAnyway = false) {
    if (busy) return;
    setBusy(true); setErrors({});
    try {
      const response = await fetch("/api/admin/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, createAnyway }) });
      const payload = await response.json();
      if (response.status === 409) { setDuplicate(payload.duplicates); return; }
      if (!response.ok) {
        if (payload.issues) setErrors(Object.fromEntries(payload.issues.map((issue: { path: string[]; message: string }) => [issue.path[0], issue.message])));
        throw new Error(payload.error || "Lead could not be created");
      }
      toast.success("Lead created");
      onCreated?.(payload);
      if (!onCreated) { router.push(`/admin/leads/${payload.id}`); router.refresh(); }
    } catch (error) { toast.error(error instanceof Error ? error.message : "Lead could not be created"); }
    finally { setBusy(false); }
  }

  const input = (key: keyof typeof values, label: string, type = "text") => <label className="grid gap-2 text-sm font-bold">{label}<input type={type} value={values[key]} onChange={e => set(key, e.target.value)} className={field}/>{errors[key] && <span className="text-xs text-red-600">{errors[key]}</span>}</label>;
  return <div className="grid gap-5">
    {duplicate && <div role="alertdialog" aria-label="Possible duplicate lead" className="grid gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"><p className="font-bold">A lead with similar contact information already exists.</p>{duplicate.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 text-sm"><span>{item.name} · {item.email || item.phone}</span><Button type="button" size="sm" variant="secondary" onClick={() => onCreated ? onCreated(item) : router.push(`/admin/leads/${item.id}`)}>{onCreated ? "Use existing lead" : "Open existing lead"}</Button></div>)}<div className="flex gap-2"><Button type="button" size="sm" onClick={() => submit(true)}>Create anyway</Button><Button type="button" size="sm" variant="secondary" onClick={() => setDuplicate(null)}>Cancel</Button></div></div>}
    <div className="grid gap-5 md:grid-cols-2">{input("name", "Contact name *")}{input("company", "Company or organization")}{input("email", "Email", "email")}{input("phone", "Phone number")}{input("whatsAppNumber", "WhatsApp number")}<label className="grid gap-2 text-sm font-bold">Preferred contact<DashboardSelect value={values.preferredContact} onChange={e => set("preferredContact", e.target.value)} options={contacts}/></label><label className="grid gap-2 text-sm font-bold">Lead source<DashboardSelect value={values.source} onChange={e => set("source", e.target.value)} options={sources}/></label><label className="grid gap-2 text-sm font-bold">Status<DashboardSelect value={values.status} onChange={e => set("status", e.target.value)} options={statuses}/></label><label className="grid gap-2 text-sm font-bold">Service interest<DashboardSelect value={values.serviceType} onChange={e => set("serviceType", e.target.value)} options={services}/></label><label className="grid gap-2 text-sm font-bold">Site<DashboardSelect value={values.siteId} onChange={e => set("siteId", e.target.value)} options={sites}/></label><label className="grid gap-2 text-sm font-bold">Linked project<DashboardSelect value={values.linkedProjectId} onChange={e => set("linkedProjectId", e.target.value)} options={[{value:"",label:"None"}, ...projects]}/></label><label className="grid gap-2 text-sm font-bold">Follow-up date<DashboardDatePicker value={values.followUpAt ? new Date(values.followUpAt) : undefined} onChange={date => set("followUpAt", date?.toISOString() || "")}/></label></div>
    <label className="grid gap-2 text-sm font-bold">Enquiry summary *<textarea value={values.projectGoal} onChange={e => set("projectGoal", e.target.value)} className={`${field} min-h-24 py-3`}/>{errors.projectGoal && <span className="text-xs text-red-600">{errors.projectGoal}</span>}</label>
    <label className="grid gap-2 text-sm font-bold">Message or enquiry details<textarea value={values.message} onChange={e => set("message", e.target.value)} className={`${field} min-h-24 py-3`}/></label>
    <label className="grid gap-2 text-sm font-bold">Internal notes<textarea value={values.internalNotes} onChange={e => set("internalNotes", e.target.value)} className={`${field} min-h-20 py-3`}/></label>
    <div className="flex flex-wrap gap-3"><Button type="button" disabled={busy} onClick={() => submit()}>{busy ? "Creating lead…" : "Create lead"}</Button>{onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}</div>
  </div>;
}
