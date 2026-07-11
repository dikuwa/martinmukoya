"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Copy, RefreshCw, XCircle, ExternalLink, TriangleAlert } from "lucide-react";

type Props = {
  shortCode: string;
  link: string;
  shareEnabled: boolean;
};

export function SharedDocumentActions({ shortCode, link, shareEnabled }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(link);
    toast.success("Link copied");
  }, [link]);

  const revokeLink = useCallback(async () => {
    setBusy(true);
    setConfirmRevoke(false);
    try {
      const res = await fetch(`/api/admin/shared-documents/${shortCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke" }),
      });
      if (!res.ok) throw new Error("Failed to revoke");
      toast.success("Link revoked");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to revoke");
    } finally {
      setBusy(false);
    }
  }, [shortCode, router]);

  const regenerateLink = useCallback(async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/shared-documents/${shortCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "regenerate" }),
      });
      if (!res.ok) throw new Error("Failed to regenerate");
      toast.success("New link generated");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to regenerate");
    } finally {
      setBusy(false);
    }
  }, [shortCode, router]);

  return (
    <div className="flex items-center gap-2 self-center">
      <button onClick={copyLink} disabled={busy} className="rounded-lg p-2 text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)] transition" title="Copy link">
        <Copy size={15} />
      </button>
      <a href={link} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)] transition" title="Open link">
        <ExternalLink size={15} />
      </a>
      {shareEnabled && (
        <>
          <button onClick={() => setConfirmRevoke(true)} disabled={busy} className="rounded-lg p-2 text-red-500 hover:bg-red-50 transition" title="Revoke link">
            <XCircle size={15} />
          </button>
          {confirmRevoke && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setConfirmRevoke(false)}>
              <div className="w-full max-w-sm rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <TriangleAlert size={20} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">Revoke share link?</h3>
                    <p className="text-xs text-[color:var(--text-muted)]">The document will no longer be accessible via this link.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={revokeLink} disabled={busy} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">Yes, revoke</button>
                  <button onClick={() => setConfirmRevoke(false)} className="rounded-xl border border-[color:var(--border-subtle)] px-4 py-2 text-sm font-bold hover:bg-[color:var(--surface-soft)]">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {!shareEnabled && (
        <button onClick={regenerateLink} disabled={busy} className="rounded-lg p-2 text-[color:var(--primary)] hover:bg-[rgba(107,38,217,0.1)] transition" title="Regenerate link">
          <RefreshCw size={15} />
        </button>
      )}
    </div>
  );
}
