"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { WhatsAppShareDialog } from "@/components/admin/whatsapp-share-dialog";
import { EmailShareDialog } from "@/components/admin/email-share-dialog";
import { findUnresolvedPlaceholders } from "@/lib/business-document-templates";

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
  contentMarkdown?: string;
};

export function BusinessDocumentActions({ doc, shortLink }: { doc: BusinessDoc; shortLink: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [unresolvedWarning, setUnresolvedWarning] = useState<string[] | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const getUnresolved = useCallback((): string[] => {
    if (!doc.contentMarkdown) return [];
    const content = `${doc.title}\n${doc.contentMarkdown}`;
    return findUnresolvedPlaceholders(content);
  }, [doc.contentMarkdown, doc.title]);

  const checkAndExecute = useCallback(async (action: string, success: string) => {
    const unresolved = getUnresolved();
    if (unresolved.length > 0) {
      setUnresolvedWarning(unresolved);
      setPendingAction(action);
      return;
    }
    await executeAction(action, success);
  }, [getUnresolved]);

  const executeAction = useCallback(async (action: string, success: string) => {
    setBusy(true);
    setUnresolvedWarning(null);
    setPendingAction(null);
    try {
      const url = action.startsWith("/") ? action : `/api/admin/business-documents/${doc.id}/${action}`;
      const response = await fetch(url, { method: "POST" });
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
      const unresolved = getUnresolved();
      if (unresolved.length > 0) {
        setUnresolvedWarning(unresolved);
        setPendingAction("copyLink");
        return;
      }
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
  }, [shortLink, doc.id, router, getUnresolved]);

  const handleProceedAnyway = useCallback(() => {
    if (pendingAction === "copyLink") {
      // Regenerate link without validation
      setUnresolvedWarning(null);
      setPendingAction(null);
      setBusy(true);
      fetch("/api/admin/shared-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: doc.id, documentType: "business" }),
      })
        .then(res => res.json())
        .then(data => {
          const baseUrl = window.location.origin;
          navigator.clipboard.writeText(`${baseUrl}/d/${data.shortCode}`);
          toast.success("Share link copied");
          router.refresh();
        })
        .catch(e => toast.error(e instanceof Error ? e.message : "Failed"))
        .finally(() => setBusy(false));
    } else if (pendingAction) {
      void executeAction(pendingAction, "Action completed");
    }
  }, [pendingAction, executeAction, doc.id, router]);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {doc.status === "DRAFT" ? (
          <>
            <Button onClick={() => checkAndExecute("issue", "")} disabled={busy}>Issue document</Button>
            <Button variant="secondary" onClick={copyLink} disabled={busy}>Create share link</Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={copyLink} disabled={busy}>
              {shortLink ? "Copy link" : "Create link"}
            </Button>
            <Button variant="secondary" onClick={() => setEmailOpen(true)} disabled={busy}>Email</Button>
            <Button variant="secondary" onClick={() => setWhatsappOpen(true)} disabled={busy}>WhatsApp</Button>
            {doc.status !== "DECLINED" && doc.status !== "REVOKED" && doc.status !== "ACCEPTED" && (
              <Button variant="secondary" onClick={() => checkAndExecute("revise", "Revision draft created")} disabled={busy}>Revise</Button>
            )}
            <Button variant="secondary" onClick={() => checkAndExecute("accept", "Document accepted")} disabled={busy}>Accept</Button>
          </>
        )}
      </div>

      {/* Unresolved placeholders warning */}
      {unresolvedWarning && unresolvedWarning.length > 0 && (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-black/45 p-4" role="alertdialog" aria-modal="true" aria-label="Unresolved template fields">
          <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--background)] p-6 shadow-xl">
            <h2 className="font-display text-xl font-black">Unresolved template fields</h2>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">
              The following placeholder fields still need to be resolved before sending or sharing this document:
            </p>
            <ul className="mt-3 min-h-0 flex-1 list-disc overflow-y-auto pl-5 pr-2 text-sm text-[color:var(--text-muted)]">
              {unresolvedWarning.map((key) => (
                <li key={key}>{key}</li>
              ))}
            </ul>
            <div className="mt-5 flex shrink-0 flex-wrap gap-3 border-t border-[color:var(--border-subtle)] pt-4">
              <Button variant="secondary" onClick={() => { setUnresolvedWarning(null); setPendingAction(null); }}>
                Return to document
              </Button>
              <Button onClick={handleProceedAnyway}>
                Proceed anyway
              </Button>
            </div>
          </div>
        </div>
      )}

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
    </>
  );
}
