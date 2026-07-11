"use client";

import { useState } from "react";
import { X, Copy, ExternalLink, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { formatWhatsAppNumber, buildWhatsAppMessage, generateWhatsAppUrl } from "@/lib/whatsapp-utils";

type Doc = {
  id: string;
  documentNumber: string | null;
  documentType: string;
  title?: string;
  recipientName: string | null;
  recipientPhone: string | null;
  recipientWhatsApp: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  doc: Doc;
  shortLink: string;
};

export function WhatsAppShareDialog({ open, onClose, doc, shortLink }: Props) {
  const [whatsAppNumber, setWhatsAppNumber] = useState(() => {
    const formatted = formatWhatsAppNumber(doc.recipientPhone, doc.recipientWhatsApp);
    return formatted || "";
  });
  const [message, setMessage] = useState(() =>
    buildWhatsAppMessage({ recipientName: doc.recipientName, documentNumber: doc.documentNumber, documentType: doc.documentType, title: doc.title, shareLink: shortLink })
  );

  if (!open) return null;

  const waUrl = formatWhatsAppNumber(whatsAppNumber) ? generateWhatsAppUrl(formatWhatsAppNumber(whatsAppNumber)!, message) : null;

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message);
    toast.success("Message copied to clipboard");
  };

  const saveNumber = async () => {
    try {
      const res = await fetch(`/api/admin/business-documents/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientWhatsApp: whatsAppNumber }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("WhatsApp number saved");
    } catch {
      toast.error("Could not save number");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-black">Share via WhatsApp</h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-[color:var(--surface-soft)]"><X size={18} /></button>
        </div>

        <div className="grid gap-4">
          <div>
            <label className="text-sm font-bold block mb-1">Recipient</label>
            <p className="text-sm text-[color:var(--text-muted)]">{doc.recipientName || "Unknown"}</p>
          </div>

          <div>
            <label className="text-sm font-bold block mb-1">WhatsApp number</label>
            <div className="flex gap-2">
              <input
                value={whatsAppNumber}
                onChange={(e) => setWhatsAppNumber(e.target.value)}
                className="h-10 flex-1 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--background)] px-3 text-sm font-normal outline-none focus:border-[color:var(--primary)]"
                placeholder="+264812271574"
              />
              <button onClick={saveNumber} className="rounded-xl border border-[color:var(--border-subtle)] px-3 text-sm hover:bg-[color:var(--surface-soft)]"><Save size={16} /></button>
            </div>
            {!formatWhatsAppNumber(whatsAppNumber) && <p className="mt-1 text-xs text-[color:var(--destructive)]">Enter a valid international phone number</p>}
          </div>

          <div>
            <label className="text-sm font-bold block mb-1">Message preview</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--background)] px-3 py-2 text-sm outline-none focus:border-[color:var(--primary)]"
            />
          </div>

          {shortLink && <p className="text-xs text-[color:var(--text-muted)] truncate">Link: {shortLink}</p>}

          {!shortLink && <p className="text-xs text-amber-600">Issue the document to generate a share link first.</p>}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            disabled={!waUrl || !shortLink}
            onClick={() => waUrl && window.open(waUrl, "_blank")}
          >
            <ExternalLink size={15} /> Open WhatsApp
          </Button>
          <Button variant="secondary" onClick={copyMessage}>
            <Copy size={15} /> Copy message
          </Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
