"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

type Counts = {
  leads: number; contactMessages: number; chatSessions: number;
  chatMessages: number; analyticsEvents: number; notifications: number;
  bookings: number; financialDocuments: number; documentLineItems: number; payments: number;
};

const labels: Record<keyof Counts, string> = {
  leads: "Leads", contactMessages: "Contact messages", chatSessions: "Chat sessions",
  chatMessages: "Chat messages", analyticsEvents: "Analytics events", notifications: "Notifications",
  bookings: "Bookings", financialDocuments: "Financial documents", documentLineItems: "Document line items", payments: "Payments"
};
const confirmationPhrase = "RESET ALL ACTIVITY";

export function ActivityCleanup() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [preserved, setPreserved] = useState<string[]>([]);
  const [runId, setRunId] = useState<string | null>(null);
  const [cutoff, setCutoff] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState<"preview" | "export" | "cleanup" | null>(null);
  const [result, setResult] = useState<Counts | null>(null);

  const loadPreview = useCallback(async () => {
    setBusy(state => state === null ? "preview" : state);
    try {
      const response = await fetch("/api/admin/cleanup/preview", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load cleanup preview.");
      setCounts(data.counts); setPreserved(data.preserved);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not load cleanup preview."); }
    finally { setBusy(null); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial server preview fetch owns the loading state
  useEffect(() => { void loadPreview(); }, [loadPreview]);
  const total = useMemo(() => counts ? Object.values(counts).reduce((sum, count) => sum + count, 0) : 0, [counts]);

  async function exportBackup() {
    setBusy("export"); setRunId(null); setConfirmation(""); setResult(null);
    try {
      const response = await fetch("/api/admin/cleanup/export", { method: "POST" });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || "Backup failed."); }
      const id = response.headers.get("X-Cleanup-Run-Id");
      if (!id) throw new Error("Backup was created without a cleanup identifier.");
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const filename = disposition.match(/filename="([^"]+)"/)?.[1] || "activity-backup.xlsx";
      const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
      anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url);
      setRunId(id); setCutoff(response.headers.get("X-Cleanup-Cutoff"));
      toast.success("Backup downloaded. Cleanup is unlocked for 30 minutes.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Backup failed."); }
    finally { setBusy(null); }
  }

  async function executeCleanup() {
    if (!runId) return;
    setBusy("cleanup");
    try {
      const response = await fetch("/api/admin/cleanup/execute", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId, confirmation })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Cleanup failed.");
      setResult(data.counts); setRunId(null); setConfirmation("");
      await loadPreview();
      window.dispatchEvent(new Event("admin-activity-cleaned"));
      toast.success("Operational activity was cleared successfully.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Cleanup failed."); }
    finally { setBusy(null); }
  }

  return (
    <section className="rounded-[var(--radius)] border border-red-500/30 bg-red-500/[0.035] p-5 sm:p-6" aria-labelledby="activity-cleanup-title">
      <div className="flex items-start gap-3">
        <span className="rounded-full bg-red-500/10 p-2 text-red-500"><AlertTriangle size={20} /></span>
        <div><h2 id="activity-cleanup-title" className="font-display text-xl font-black text-[color:var(--text-strong)]">Activity Cleanup</h2>
          <p className="mt-1 text-sm text-[color:var(--text-muted)]">Permanently clear operational history across all sites after downloading a backup.</p></div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {counts ? Object.entries(counts).map(([key, value]) => <div key={key} className="rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-3"><p className="text-xs font-semibold text-[color:var(--text-muted)]">{labels[key as keyof Counts]}</p><p className="mt-1 text-2xl font-black text-[color:var(--text-strong)]">{value.toLocaleString()}</p></div>) : <p className="text-sm text-[color:var(--text-muted)]">Loading activity counts…</p>}
      </div>

      <div className="mt-5 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-emerald-600"><ShieldCheck size={16} />Always preserved</p>
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">{preserved.join(", ")}.</p>
      </div>

      {result && <div className="mt-4 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] p-4 text-sm"><p className="flex items-center gap-2 font-bold text-emerald-600"><CheckCircle2 size={16} />Cleanup complete</p><p className="mt-1 text-[color:var(--text-muted)]">Deleted {Object.values(result).reduce((sum, count) => sum + count, 0).toLocaleString()} operational records. Foundational data was preserved.</p></div>}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="button" variant="secondary" onClick={exportBackup} disabled={busy !== null || counts === null}><Download size={16} />{busy === "export" ? "Creating backup…" : `Download backup (${total.toLocaleString()} records)`}</Button>
        {busy === "preview" && <Loader2 size={16} className="animate-spin text-[color:var(--text-muted)]" />}
      </div>

      {runId && <div className="mt-5 border-t border-red-500/20 pt-5"><p className="text-sm font-bold text-red-600">Backup ready{cutoff ? ` through ${new Date(cutoff).toLocaleString()}` : ""}</p><label className="mt-3 block text-sm font-semibold text-[color:var(--text-normal)]">Type <code className="rounded bg-red-500/10 px-1.5 py-0.5 text-red-600">{confirmationPhrase}</code> to continue.</label><div className="mt-2 flex flex-col gap-3 sm:flex-row"><input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="min-h-10 flex-1 rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-3 text-sm text-[color:var(--text-strong)] outline-none focus:border-red-500" autoComplete="off" /><Button type="button" variant="danger" onClick={executeCleanup} disabled={confirmation !== confirmationPhrase || busy !== null}><Trash2 size={16} />{busy === "cleanup" ? "Clearing activity…" : "Permanently clear activity"}</Button></div></div>}
    </section>
  );
}
