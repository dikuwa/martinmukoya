"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Copy, ExternalLink, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  id: string;
  type: string;
  status: string;
  number: string | null;
  email: string | null;
  shareToken: string | null;
  shortLink?: string | null;
  shortCode?: string | null;
};

export function DocumentActions({ id, type, status, number, email, shareToken, shortLink, shortCode }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [copied, setCopied] = useState(false);

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

  async function generateAndCopyLink() {
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
      await navigator.clipboard.writeText(`${baseUrl}/d/${data.shortCode}`);
      setCopied(true);
      toast.success("Share link copied");
      setTimeout(() => setCopied(false), 2500);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create share link");
    } finally {
      setGeneratingLink(false);
    }
  }

  async function copyExistingLink() {
    if (!shortLink) { await generateAndCopyLink(); return; }
    await navigator.clipboard.writeText(shortLink);
    setCopied(true);
    toast.success("Share link copied");
    setTimeout(() => setCopied(false), 2500);
  }

  async function shareNative() {
    const url = shortLink || `${window.location.origin}/admin/documents/${id}`;
    if (navigator.share) {
      await navigator.share({ title: number || "FlexTech document", url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
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
        onClick={shortLink ? copyExistingLink : generateAndCopyLink}
        disabled={generatingLink}
      >
        {generatingLink ? (
          <><Loader2 size={15} className="animate-spin" /> Generating…</>
        ) : copied ? (
          <><Check size={15} /> Copied</>
        ) : shortLink ? (
          <><Copy size={15} /> Copy link</>
        ) : (
          <><Copy size={15} /> Create link</>
        )}
      </Button>

      {shortLink && (
        <Button variant="secondary" onClick={() => window.open(shortLink, "_blank")}>
          <ExternalLink size={15} /> Open
        </Button>
      )}

      {/* Email send */}
      {email && (
        <Button variant="secondary" onClick={send} disabled={busy}>
          Email
        </Button>
      )}

      {/* Native share fallback */}
      <Button variant="secondary" onClick={shareNative}>
        Share
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
    </div>
  );
}
