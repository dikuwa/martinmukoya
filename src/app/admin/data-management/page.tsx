"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Database, Download, Upload, Trash2, RotateCcw, AlertTriangle, Shield, FileJson, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const DELETABLE_MODELS = [
  { key: "projects", label: "Projects", description: "Portfolio projects and case studies", icon: Database },
  { key: "blogPosts", label: "Blog posts", description: "Technical blog articles and tutorials", icon: Database },
  { key: "leads", label: "Leads", description: "Project requests from start-project form", icon: Database },
  { key: "contactMessages", label: "Contact messages", description: "Contact form submissions", icon: Database },
  { key: "testimonials", label: "Testimonials", description: "Client quotes and social proof", icon: Database },
  { key: "faqs", label: "FAQs", description: "Frequently asked questions", icon: Database },
  { key: "chatSessions", label: "Chat sessions", description: "AI chat conversations and handovers", icon: Database },
  { key: "analyticsEvents", label: "Analytics events", description: "Page views, CTA clicks, conversion tracking", icon: Database },
  { key: "siteSettings", label: "Site settings", description: "Contact info, availability, hero content, footer", icon: Database },
  { key: "financialDocuments", label: "Financial documents", description: "Quotes, invoices, receipts, payments", icon: Database },
  { key: "bookings", label: "Bookings", description: "Booking records linked to financial documents", icon: Database },
  { key: "businessDocuments", label: "Business documents", description: "Proposals, contracts, agreements, SOWs", icon: Database },
  { key: "businessTemplates", label: "Document templates", description: "Reusable templates for business documents", icon: Database },
  { key: "sharedDocuments", label: "Shared documents", description: "Public share links for documents", icon: Database },
  { key: "notifications", label: "Notifications", description: "Admin notification records", icon: Database },
];

const PROTECTED_MODELS = [
  { label: "Admin user", description: "Your admin account (email, role, sessions)" },
  { label: "Sites", description: "Martin Mukoya & FlexTech Media site configs" },
  { label: "Accounts & Sessions", description: "Authentication records" },
];

export default function DataManagementPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<"idle" | "backup" | "delete" | "full-reset" | "restore">("idle");
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string; counts?: Record<string, number> } | null>(null);

  useEffect(() => {
    fetchCounts();
  }, []);

  async function fetchCounts() {
    try {
      const res = await fetch("/api/admin/data-management?action=counts");
      if (res.ok) {
        const data = await res.json();
        const countMap: Record<string, number> = {};
        data.counts.forEach((c: { key: string; count: number }) => {
          countMap[c.key] = c.count;
        });
        setCounts(countMap);
      }
    } catch (error) {
      console.error("Failed to fetch counts:", error);
    }
  }

  function toggleModel(key: string) {
    setSelectedModels((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function selectAll() {
    setSelectedModels(DELETABLE_MODELS.map((m) => m.key));
  }

  function selectNone() {
    setSelectedModels([]);
  }

  async function downloadBackup() {
    setAction("backup");
    try {
      const res = await fetch("/api/admin/data-management?action=backup&format=download");
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Backup downloaded");
        setLastResult({ success: true, message: "Backup downloaded successfully" });
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      toast.error("Failed to download backup");
      setLastResult({ success: false, message: "Failed to download backup" });
    } finally {
      setAction("idle");
    }
  }

  async function handleDelete() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/data-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", selectedModels }),
      });
      const data = await res.json();
      if (data.success) {
        const totalDeleted = Object.values(data.deletedCounts as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
        toast.success(`Deleted ${totalDeleted} records`);
        setLastResult({ success: true, message: "Selective delete completed", counts: data.deletedCounts as Record<string, number> });
        setSelectedModels([]);
        fetchCounts();
      } else {
        throw new Error(data.error || "Delete failed");
      }
    } catch (error) {
      toast.error("Delete failed");
      setLastResult({ success: false, message: String(error) });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFullReset() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/data-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "full-reset" }),
      });
      const data = await res.json();
      if (data.success) {
        const totalDeleted = Object.values(data.deletedCounts as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
        toast.success(`Full reset: ${totalDeleted} records deleted`);
        setLastResult({ success: true, message: "Full reset completed", counts: data.deletedCounts as Record<string, number> });
        fetchCounts();
      } else {
        throw new Error(data.error || "Full reset failed");
      }
    } catch (error) {
      toast.error("Full reset failed");
      setLastResult({ success: false, message: String(error) });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRestore() {
    if (!restoreFile) return;
    setIsLoading(true);
    setAction("restore");
    try {
      const text = await restoreFile.text();
      const backupData = JSON.parse(text);
      const res = await fetch("/api/admin/data-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", backupData }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Restore completed");
        setLastResult({ success: true, message: "Restore completed", counts: data.restoredCounts });
        fetchCounts();
      } else {
        throw new Error(data.error || "Restore failed");
      }
    } catch (error) {
      toast.error("Restore failed");
      setLastResult({ success: false, message: String(error) });
    } finally {
      setIsLoading(false);
      setAction("idle");
      setRestoreFile(null);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setRestoreFile(file);
  }

  const totalSelected = selectedModels.length;
  const totalSelectedCount = selectedModels.reduce((sum: number, key: string) => sum + (counts[key] || 0), 0);

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Data management"
        description="Backup, selectively reset, or restore database content. Protected entities are never affected."
      />

      {/* Protected entities notice */}
      <Card className="border-[color:var(--primary)]/30 bg-[rgba(107,38,217,0.03)]">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 shrink-0 text-[color:var(--primary)]" size={20} />
          <div className="flex-1">
            <h3 className="font-bold text-[color:var(--text-strong)]">Always preserved (cannot be deleted)</h3>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">
              These core entities are protected from all reset operations:
            </p>
            <ul className="mt-2 grid gap-1 sm:grid-cols-3 text-sm text-[color:var(--text-muted)]">
              {PROTECTED_MODELS.map((p) => (
                <li key={p.label} className="flex items-center gap-2">
                  <CheckCircle2 className="text-[color:var(--success)]" size={14} />
                  <span>
                    <strong>{p.label}</strong> — {p.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Backup section */}
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold">Full backup</h3>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">Download a complete JSON export of all deletable and protected data.</p>
          </div>
          <Button onClick={downloadBackup} disabled={isLoading} className="gap-2">
            <Download size={16} />
            {action === "backup" ? <Loader2 className="animate-spin" size={16} /> : "Download backup"}
          </Button>
        </div>
      </Card>

      {/* Selective reset section */}
      <Card>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold">Selective reset</h3>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">
              Choose which data types to delete. {totalSelected} selected · {totalSelectedCount} total records
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={selectAll} disabled={totalSelected === DELETABLE_MODELS.length}>Select all</Button>
            <Button variant="ghost" size="sm" onClick={selectNone} disabled={totalSelected === 0}>Select none</Button>
          </div>
        </div>

        <div className="grid gap-2 max-h-[400px] overflow-y-auto">
          {DELETABLE_MODELS.map((model) => {
            const count = counts[model.key] ?? 0;
            const isSelected = selectedModels.includes(model.key);
            const Icon = model.icon;
            return (
              <label
                key={model.key}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 transition",
                  isSelected
                    ? "border-[color:var(--primary)]/30 bg-[rgba(107,38,217,0.05)]"
                    : "border-[color:var(--border-subtle)] hover:border-[color:var(--primary)]/20"
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleModel(model.key)}
                  className="h-4 w-4 rounded border-[color:var(--border-subtle)] text-[color:var(--primary)] focus:ring-[color:var(--primary)]"
                />
                <Icon className="shrink-0 text-[color:var(--text-muted)]" size={18} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{model.label}</p>
                  <p className="text-xs text-[color:var(--text-muted)] truncate">{model.description}</p>
                </div>
                <span className={cn(
                  "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  count > 0 ? "bg-[color:var(--primary)]/10 text-[color:var(--primary)]" : "bg-[color:var(--surface-soft)] text-[color:var(--text-faint)]"
                )}>
                  {count}
                </span>
              </label>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-[color:var(--border-subtle)]">
          <Button
            onClick={handleDelete}
            variant="danger"
            disabled={isLoading || totalSelected === 0}
            className="gap-2"
          >
            <Trash2 size={16} />
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : `Delete selected (${totalSelectedCount} records)`}
          </Button>
        </div>
      </Card>

      {/* Full reset section */}
      <Card className="border-red-500/30 bg-red-500/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 shrink-0 text-red-500" size={20} />
          <div className="flex-1">
            <h3 className="font-bold text-red-500">Full reset (dangerous)</h3>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">
              Deletes ALL data from all {DELETABLE_MODELS.length} categories above. Protected entities are preserved.
              <strong> Always download a backup first.</strong>
            </p>
            <Button
              onClick={handleFullReset}
              variant="danger"
              disabled={isLoading}
              className="mt-3 gap-2"
            >
              <Trash2 size={16} />
              {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Full reset — delete everything"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Restore section */}
      <Card>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold">Restore from backup</h3>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">Upload a previously downloaded backup JSON to restore data.</p>
          </div>
          <Button onClick={() => document.getElementById("restore-file")?.click()} variant="secondary" disabled={isLoading}>
            <Upload size={16} /> Select backup file
          </Button>
        </div>
        <input
          id="restore-file"
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="sr-only"
        />
        {restoreFile && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-3">
            <div className="flex items-center gap-3">
              <FileJson className="text-[color:var(--primary)]" size={20} />
              <div>
                <p className="font-semibold">{restoreFile.name}</p>
                <p className="text-xs text-[color:var(--text-muted)]">{(restoreFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <Button onClick={handleRestore} variant="primary" disabled={isLoading} className="gap-2">
              <RotateCcw size={16} />
              {action === "restore" ? <Loader2 className="animate-spin" size={16} /> : "Restore"}
            </Button>
          </div>
        )}
      </Card>

      {/* Last result */}
      {lastResult && (
        <Card className={cn("gap-3", lastResult.success ? "border-[color:var(--success)]/30 bg-[color:var(--success)]/5" : "border-red-500/30 bg-red-500/5")}>
          <div className="flex gap-3">
            {lastResult.success ? <CheckCircle2 className="shrink-0 mt-0.5 text-[color:var(--success)]" size={20} /> : <XCircle className="shrink-0 mt-0.5 text-red-500" size={20} />}
            <div className="flex-1">
              <p className="font-semibold">{lastResult.success ? "Success" : "Error"}</p>
              <p className="text-sm text-[color:var(--text-muted)]">{lastResult.message}</p>
              {lastResult.counts && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(lastResult.counts).map(([key, count]) => (
                    <span key={key} className="rounded-full bg-[color:var(--surface-soft)] px-2 py-0.5 text-xs font-mono">
                      {key}: {count}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}