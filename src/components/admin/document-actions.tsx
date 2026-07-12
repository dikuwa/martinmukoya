"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Copy, ExternalLink, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppShareDialog } from "@/components/admin/whatsapp-share-dialog";

type Props = {
  id: string;
  type: string;
  status: string;
  number: string | null;
  customerName: string;
  customerPhone: string | null;
  email: string | null;
  shortLink?: string | null;
};

export function DocumentActions({ id, type, status, number, customerName, customerPhone, email, shortLink }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("");

  async function call(action: string, success: string) {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/documents/${id}/${action}`, { method: "POST" });
      const payload = await response.json();
      if (!response.ok) { toast.error(payload.error || "Action failed"); return; }
      toast.success(success);
      if (payload.id) router.push(`/admin/documents/${payload.id}`);
      else router.refresh();
    } catch {
      toast.error("Action failed");
    } finally {
      setBusy(false);
    }
  }

  async function issue() { await call("issue", "Document issued"); }

  async function send() {
    if (!email) { toast.error("Customer email is missing"); return; }
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/documents/${id}/email`, { method: "POST" });
      const payload = await response.json();
      if (!response.ok) { toast.error(payload.error || "Email failed"); return; }
      toast.success(payload.skipped ? "Email service is not configured" : "Document emailed");
    } catch {
      toast.error("Email failed");
    } finally {
      setBusy(false);
    }
  }

  async function createShareLink() {
    setGeneratingLink(true);
    try {
      const res = await fetch("/api/admin/shared-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: id, documentType: "financial" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create link");
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/d/${data.shortCode}`;
      setActiveLink(link);
      router.refresh();
      return link;
    } finally {
      setGeneratingLink(false);
    }
  }

  async function generateAndCopyLink() {
    try {
      const link = await createShareLink();
      if (!link) return;
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Share link copied");
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create share link");
    }
  }

  async function copyExistingLink() {
    const link = activeLink || shortLink;
    if (!link) { await generateAndCopyLink(); return; }
    const absoluteLink = new URL(link, window.location.origin).toString();
    setActiveLink(absoluteLink);
    await navigator.clipboard.writeText(absoluteLink);
    setCopied(true);
    toast.success("Share link copied");
    setTimeout(() => setCopied(false), 2500);
  }

  async function openWhatsApp() {
    try {
      if (!activeLink && shortLink) setActiveLink(new URL(shortLink, window.location.origin).toString());
      else if (!activeLink) await createShareLink();
      setWhatsappOpen(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create share link");
    }
  }

  if (status === "DRAFT") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="secondary">
          <a href={`/admin/documents/${id}/edit`}>Edit draft</a>
        </Button>
        <Button onClick={issue} disabled={busy}>
          {busy ? <><Loader2 size={15} className="animate-spin" /> Processing...</> : "Issue document"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild>
        <a href={`/api/admin/documents/${id}/pdf`} download>Download PDF</a>
      </Button>

      {/* Share link generation */}
      <Button
        variant="secondary"
        onClick={(activeLink || shortLink) ? copyExistingLink : generateAndCopyLink}
        disabled={generatingLink}
      >
        {generatingLink ? (
          <><Loader2 size={15} className="animate-spin" /> Generating…</>
        ) : copied ? (
          <><Check size={15} /> Copied</>
        ) : (activeLink || shortLink) ? (
          <><Copy size={15} /> Copy link</>
        ) : (
          <><Copy size={15} /> Create link</>
        )}
      </Button>

      {(activeLink || shortLink) && (
        <Button variant="secondary" onClick={() => window.open(activeLink || shortLink || "", "_blank")}>
          <ExternalLink size={15} /> Open
        </Button>
      )}

      {/* Email send */}
      {email && (
        <Button variant="secondary" onClick={send} disabled={busy}>
          Email
        </Button>
      )}

      <Button variant="secondary" onClick={openWhatsApp} disabled={generatingLink}>
        {generatingLink ? <><Loader2 size={15} className="animate-spin" /> Preparing…</> : "WhatsApp"}
      </Button>

      {/* Quote-specific: convert to invoice */}
      {type === "QUOTE" && status === "ISSUED" && (
        <Button variant="secondary" onClick={() => call("convert", "Invoice draft created")} disabled={busy}>
          Convert to invoice
        </Button>
      )}

      {/* Revise */}
      {type !== "RECEIPT" && !["VOID", "SUPERSEDED"].includes(status) && (
        <Button variant="secondary" onClick={() => call("revise", "Revision draft created")} disabled={busy}>
          Revise
        </Button>
      )}

      {/* Void */}
      {!["VOID", "SUPERSEDED"].includes(status) && (
        <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => call("void", "Document voided")} disabled={busy}>
          Void
        </Button>
      )}

      <WhatsAppShareDialog
        key={`${activeLink || shortLink || "no-link"}-${whatsappOpen ? "open" : "closed"}`}
        open={whatsappOpen}
        onClose={() => setWhatsappOpen(false)}
        doc={{
          id,
          documentNumber: number,
          documentType: type,
          recipientName: customerName,
          recipientPhone: customerPhone,
          recipientWhatsApp: null,
        }}
        shortLink={activeLink || shortLink || ""}
      />
    </div>
  );
}
