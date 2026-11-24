"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

type Props = {
  invoiceId: string;
  message: string;
  phone: string | null;
  email: string | null;
  shareLink: string | null;
  balance: number;
};
export function InvoiceReminderActions({ invoiceId, message: initial, phone, email, shareLink, balance }: Props) {
  const [message, setMessage] = useState(initial);
  const [invoiceLink, setInvoiceLink] = useState(shareLink || "");
  const [busy, setBusy] = useState(false);
  async function attachInvoiceLink() {
    if (invoiceLink || busy) return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/shared-documents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ documentId: invoiceId, documentType: "financial" }),
      });
      const data = await response.json();
      if (!response.ok || !data.shortCode) throw new Error(data.error || "Unable to create invoice link");
      const link = `${window.location.origin}/d/${data.shortCode}`;
      setInvoiceLink(link);
      toast.success("Invoice link included");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to create invoice link"); }
    finally { setBusy(false); }
  }
  async function prepare(channel: "COPY" | "WHATSAPP" | "EMAIL") {
    if (busy) return;
    if (channel === "WHATSAPP" && !phone) return toast.error("No customer WhatsApp/phone number.");
    if (channel === "EMAIL" && !email) return toast.error("No customer email address.");
    const composer = channel === "WHATSAPP" ? window.open("about:blank", "_blank") : null;
    if (composer) composer.opener = null;
    if (channel === "WHATSAPP" && !composer) return toast.error("Allow pop-ups to open WhatsApp.");
    setBusy(true);
    try {
      const response = await fetch("/api/admin/invoice-reminders", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ invoiceId, channel, includeLink: Boolean(invoiceLink) }),
      });
      const prepared = await response.json();
      if (!response.ok) throw new Error(prepared.error || "Reminder could not be prepared");
      setMessage(prepared.message);
      if (composer) {
        composer.location.href = `https://wa.me/${prepared.destination}?text=${encodeURIComponent(prepared.message)}`;
      } else if (channel === "EMAIL") {
        window.location.href = `mailto:${encodeURIComponent(prepared.destination)}?subject=Payment%20reminder&body=${encodeURIComponent(prepared.message)}`;
      } else {
        await navigator.clipboard.writeText(prepared.message);
      }
      toast.success("Reminder prepared (delivery not confirmed)");
    } catch (error) {
      composer?.close();
      toast.error(error instanceof Error ? error.message : "Reminder could not be prepared");
    }
    finally { setBusy(false); }
  }
  return <div className="grid gap-3 rounded-md border border-[color:var(--border-subtle)] p-4">
    <div><h3 className="text-sm font-semibold">Payment reminder</h3>
      <p className="text-xs text-[color:var(--text-muted)]">Outstanding N$ {balance.toFixed(2)} · review before sharing</p>
    </div>
    <textarea aria-label="Payment reminder text" value={message}
      readOnly rows={5}
      className="w-full rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-3 text-sm"/>
    {!invoiceLink && <Button variant="secondary" size="sm" disabled={busy}
      onClick={attachInvoiceLink}>Include invoice link</Button>}
    <div className="flex flex-wrap gap-2">
      <Button size="sm" onClick={() => prepare("WHATSAPP")} disabled={busy || !phone}>WhatsApp</Button>
      <Button size="sm" variant="secondary" onClick={() => prepare("EMAIL")} disabled={busy || !email}>Email</Button>
      <Button size="sm" variant="secondary" onClick={() => prepare("COPY")} disabled={busy}>Copy</Button>
    </div>
    <p className="text-xs text-[color:var(--text-muted)]">Opens your messaging app. Sending is completed there.</p>
  </div>;
}