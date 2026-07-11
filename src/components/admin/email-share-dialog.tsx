"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardCheckbox } from "@/components/ui/dashboard-checkbox";
import toast from "react-hot-toast";

type Doc = {
  id: string;
  documentNumber: string | null;
  documentType: string;
  title?: string;
  recipientName: string | null;
  recipientEmail: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  doc: Doc;
  shortLink: string;
  onSent?: () => void;
};

export function EmailShareDialog({ open, onClose, doc, shortLink, onSent }: Props) {
  const [to, setTo] = useState(doc.recipientEmail || "");
  const [subject, setSubject] = useState(`${doc.documentType.toLowerCase().replace(/_/g, " ")} ${doc.documentNumber || ""} from FlexTech Media`);
  const [body, setBody] = useState(
    `Hello ${doc.recipientName || "client"},\n\nPlease find the ${doc.documentType.toLowerCase().replace(/_/g, " ")} below.\n\n${shortLink}\n\nRegards,\nMartin Mukoya`
  );
  const [includePdf, setIncludePdf] = useState(true);
  const [includeLink, setIncludeLink] = useState(true);
  const [sending, setSending] = useState(false);

  if (!open) return null;

  const sendEmail = async () => {
    if (!to.trim()) { toast.error("Recipient email is required"); return; }
    setSending(true);
    try {
      const response = await fetch(`/api/admin/business-documents/${doc.id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body, includePdf, includeLink, shortLink }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Email failed");
      toast.success("Email sent");
      onSent?.();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Email failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-black">Send via email</h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-[color:var(--surface-soft)]"><X size={18} /></button>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-1 text-sm font-bold">
            To
            <input value={to} onChange={(e) => setTo(e.target.value)} type="email" className="h-10 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--background)] px-3 text-sm font-normal outline-none focus:border-[color:var(--primary)]" />
          </label>

          <label className="grid gap-1 text-sm font-bold">
            Subject
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="h-10 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--background)] px-3 text-sm font-normal outline-none focus:border-[color:var(--primary)]" />
          </label>

          <label className="grid gap-1 text-sm font-bold">
            Message
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} className="w-full rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--background)] px-3 py-2 text-sm outline-none focus:border-[color:var(--primary)]" />
          </label>

          <div className="flex gap-4 text-sm">
            <DashboardCheckbox
              label="Include share link"
              checked={includeLink}
              onChange={(e) => setIncludeLink(e.target.checked)}
            />
            <DashboardCheckbox
              label="Attach PDF"
              checked={includePdf}
              onChange={(e) => setIncludePdf(e.target.checked)}
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <Button onClick={sendEmail} disabled={sending || !to.trim()}>
            {sending ? "Sending..." : <><Send size={15} /> Send email</>}
          </Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}