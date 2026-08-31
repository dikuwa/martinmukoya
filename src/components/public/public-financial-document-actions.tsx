"use client";

import { useState } from "react";
import { Check, Copy, Download, Printer } from "lucide-react";
import toast from "react-hot-toast";

type Props = {
  shortCode: string;
  documentNumber: string | null;
  documentType: string;
  documentStatus?: string;
  acceptedAt?: string | null;
  acceptedName?: string | null;
  declinedAt?: string | null;
};

export function PublicFinancialDocumentActions({
  shortCode,
  documentNumber,
  documentType,
  documentStatus,
  acceptedAt,
  acceptedName,
  declinedAt,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [showAcceptForm, setShowAcceptForm] = useState(false);
  const [acceptName, setAcceptName] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [localStatus, setLocalStatus] = useState(documentStatus);

  const isQuote = documentType === "QUOTE";
  const canAct = isQuote && localStatus === "ISSUED";
  const isAccepted = localStatus === "ACCEPTED" || !!acceptedAt;
  const isDeclined = localStatus === "DECLINED" || !!declinedAt;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Share link copied");
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy the link");
    }
  }

  async function handleAccept() {
    if (!acceptName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    setAccepting(true);
    try {
      const res = await fetch(`/api/documents/share/${shortCode}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: acceptName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Acceptance failed");
      setLocalStatus("ACCEPTED");
      setShowAcceptForm(false);
      toast.success("Quote accepted successfully");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Acceptance failed");
    } finally {
      setAccepting(false);
    }
  }

  async function handleDecline() {
    if (!confirm("Are you sure you want to decline this quote?")) return;
    setDeclining(true);
    try {
      const res = await fetch(`/api/documents/share/${shortCode}/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Declined via share link" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Decline failed");
      setLocalStatus("DECLINED");
      toast.success("Quote declined");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Decline failed");
    } finally {
      setDeclining(false);
    }
  }

  return (
    <section className="action-bar mx-auto mt-10 w-full max-w-[900px] rounded-[22px] border border-white/70 bg-white/90 px-5 py-5 shadow-[0_18px_50px_rgba(44,32,23,0.10)] backdrop-blur-sm md:mt-14 md:flex md:items-center md:justify-between md:gap-6 md:px-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[color:var(--text-faint)]">
          {documentType}
        </p>
        <h1 className="mt-1 font-display text-lg font-black text-[color:var(--text)]">
          {documentNumber || "Financial document"}
        </h1>
        <button
          type="button"
          onClick={copyLink}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--primary)] hover:underline"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Link copied" : "Copy shareable link"}
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 md:mt-0 md:justify-end">
        {/* Quote acceptance status */}
        {isAccepted && (
          <p className="text-sm font-bold text-green-700">
            Accepted by {acceptedName} on {new Date(acceptedAt!).toLocaleDateString("en-GB")}
          </p>
        )}
        {isDeclined && (
          <p className="text-sm font-bold text-red-600">
            Declined on {new Date(declinedAt!).toLocaleDateString("en-GB")}
          </p>
        )}

        {/* Accept/Decline buttons for ISSUED quotes */}
        {canAct && !showAcceptForm && (
          <>
            <button
              type="button"
              onClick={() => setShowAcceptForm(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700"
            >
              <Check size={16} /> Accept this quote
            </button>
            <button
              type="button"
              onClick={handleDecline}
              disabled={declining}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {declining ? "Declining…" : "Decline"}
            </button>
          </>
        )}

        {/* Accept form */}
        {canAct && showAcceptForm && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={acceptName}
              onChange={(e) => setAcceptName(e.target.value)}
              placeholder="Your full name"
              className="h-10 rounded-xl border border-[color:var(--border-subtle)] bg-white px-3 text-sm outline-none focus:border-[color:var(--primary)]"
              autoFocus
            />
            <button
              type="button"
              onClick={handleAccept}
              disabled={accepting || !acceptName.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {accepting ? "Accepting…" : "Confirm"}
            </button>
            <button
              type="button"
              onClick={() => { setShowAcceptForm(false); setAcceptName(""); }}
              className="text-sm font-bold text-[color:var(--text-muted)] hover:underline"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Print + Download */}
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--border-subtle)] bg-white px-4 py-2.5 text-sm font-bold text-[color:var(--text)] hover:bg-[color:var(--surface-soft)]"
        >
          <Printer size={16} /> Print
        </button>
        <a
          href={`/api/documents/share/${shortCode}/download`}
          className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--primary)] px-4 py-2.5 text-sm font-bold text-white hover:opacity-90"
        >
          <Download size={16} /> Download PDF
        </a>
      </div>
    </section>
  );
}
