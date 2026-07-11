"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { WhatsAppShareDialog } from "@/components/admin/whatsapp-share-dialog";
import { EmailShareDialog } from "@/components/admin/email-share-dialog";

type BusinessDoc = {
  id: string;
  documentNumber: string | null;
  documentType: string;
  status: string;
  title: string;
  recipientName: string | null;
  recipientEmail: string | null;
  recipientPhone: string | null;
  recipientWhatsApp: string | null;
};

export function BusinessDocumentActions({ doc, shortLink }: { doc: BusinessDoc; shortLink: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  const call = useCallback(async (action: string, success: string, method = "POST") => {
    setBusy(true);
    try {
      const url = action.startsWith("/") ? action : `/api/admin/business-documents/${doc.id}/${action}`;
      const response = await fetch(url, { method });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Action failed");
      toast.success(success);
      if (payload.id && payload.id !== doc.id) router.push(`/admin/business-documents/${payload.id}`);
      else router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }, [doc.id, router]);

  const copyLink = useCallback(async () => {
    if (!shortLink) {
      // Generate share link
      try {
        const res = await fetch("/api/admin/shared-documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId: doc.id, documentType: "business" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create link");
        const baseUrl = window.location.origin;
        await navigator.clipboard.writeText(`${baseUrl}/d/${data.shortCode}`);
        toast.success("Share link copied");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to create share link");
      }
      return;
    }
    await navigator.clipboard.writeText(shortLink);
    toast.success("Share link copied");
  }, [shortLink, doc.id, router]);

  if (doc.status === "DRAFT") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => call("issue", "Document issued")} disabled={busy}>Issue document</Button>
        <Button variant="secondary" onClick={copyLink} disabled={busy}>Create share link</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" onClick={copyLink} disabled={busy}>{shortLink ? "Copy link" : "Create link"}</Button>
      <Button variant="secondary" onClick={() => setEmailOpen(true)} disabled={busy}>Email</Button>
      <Button variant="secondary" onClick={() => setWhatsappOpen(true)} disabled={busy}>WhatsApp</Button>
      {doc.status !== "DECLINED" && doc.status !== "REVOKED" && doc.status !== "ACCEPTED" && (
        <Button variant="secondary" onClick={() => call("revise", "Revision draft created")} disabled={busy}>Revise</Button>
      )}
      <Button variant="secondary" onClick={() => call("accept", "Document accepted")} disabled={busy}>Accept</Button>

      <EmailShareDialog
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        doc={doc}
        shortLink={shortLink || ""}
        onSent={() => router.refresh()}
      />
      <WhatsAppShareDialog
        open={whatsappOpen}
        onClose={() => setWhatsappOpen(false)}
        doc={doc}
        shortLink={shortLink || ""}
      />
    </div>
  );
}
