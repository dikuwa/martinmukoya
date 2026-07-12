"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Download, Printer, Check, X } from "lucide-react";
import { DocumentPageBackdrop } from "@/components/documents/document-page-backdrop";

type BusinessDoc = {
  id: string;
  documentNumber: string | null;
  documentType: string;
  status: string;
  title: string;
  subject: string | null;
  recipientName: string | null;
  companyName: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  contentMarkdown: string;
  senderName: string | null;
  signatureRequired: boolean;
  acceptedAt: string | null;
  declinedAt: string | null;
};

type Props = {
  document: BusinessDoc;
  shortCode: string;
  shortLink?: string;
  /** When true, only the header bar and acceptance UI render (no document body) */
  hideDocumentContent?: boolean;
};

const docTypeLabels: Record<string, string> = {
  PROPOSAL: "Project Proposal", SERVICE_AGREEMENT: "Service Agreement", WEB_DESIGN_CONTRACT: "Web Design Contract",
  MAINTENANCE_AGREEMENT: "Maintenance Agreement", SCOPE_OF_WORK: "Scope of Work", CHANGE_REQUEST: "Change Request",
  PROJECT_HANDOVER: "Project Handover", BUSINESS_LETTER: "Business Letter", PAYMENT_REMINDER: "Payment Reminder",
  AUDIT_REPORT: "Audit Report", NDA: "Confidentiality Agreement", CUSTOM: "Document",
};

export function PublicBusinessDocument({ document: doc, shortCode, hideDocumentContent }: Props) {
  const [accepting, setAccepting] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [acceptName, setAcceptName] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [declineComment, setDeclineComment] = useState("");
  const [isAccepted, setIsAccepted] = useState(!!doc.acceptedAt);
  const [isDeclined, setIsDeclined] = useState(!!doc.declinedAt);

  const canAccept = !isAccepted && !isDeclined && doc.status !== "REVOKED" && doc.signatureRequired;

  const handleAccept = async () => {
    if (!acceptName.trim()) { toast.error("Please enter your full name"); return; }
    setAccepting(true);
    try {
      const res = await fetch(`/api/documents/share/${shortCode}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: acceptName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to accept");
      setIsAccepted(true);
      toast.success("Document accepted. Thank you!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to accept");
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) { toast.error("Please provide a reason"); return; }
    try {
      const res = await fetch(`/api/documents/share/${shortCode}/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: declineReason.trim(), comment: declineComment.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to decline");
      setIsDeclined(true);
      setShowDecline(false);
      toast.success("Feedback received.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit");
    }
  };

  return (
    <div className="mx-auto max-w-[900px]">
      {/* Header bar */}
      <div className={`action-bar mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white/80 px-5 py-3 shadow-sm backdrop-blur-sm ${hideDocumentContent ? "mt-10 md:mt-14" : ""}`}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[color:var(--text-faint)]">
            {docTypeLabels[doc.documentType] || doc.documentType}
          </p>
          <h1 className="font-display text-lg font-black">{doc.title}</h1>
          {doc.documentNumber && <p className="text-xs text-[color:var(--text-muted)]">Ref: {doc.documentNumber}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-2 rounded-xl border border-[color:var(--border-subtle)] bg-white px-4 py-2 text-xs font-bold hover:bg-[color:var(--surface-soft)]">
            <Printer size={14} /> Print
          </button>
          <button onClick={() => window.open(`/api/documents/share/${shortCode}/download`, "_blank")} className="flex items-center gap-2 rounded-xl bg-[color:var(--primary)] px-4 py-2 text-xs font-bold text-white">
            <Download size={14} /> Download PDF
          </button>
        </div>
      </div>

      {/* Document body - only shown when hideDocumentContent is false */}
      {!hideDocumentContent && (
        <article className="relative isolate overflow-hidden rounded-sm border border-[#ddd8cf] bg-[#fffdf8] p-6 text-[#242424] shadow-sm md:p-10">
          <DocumentPageBackdrop />
          <div className="relative z-10">
            {/* Header info */}
            <div className="mb-6 border-b border-[#ded9cf] pb-5">
              {doc.recipientName && (
                <div className="text-sm mb-1">
                  <span className="text-[#777]">To: </span>
                  <span className="font-semibold">{doc.recipientName}</span>
                  {doc.companyName && <span className="text-[#777]">, {doc.companyName}</span>}
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-[#777]">
                {doc.issueDate && <span>Date: {new Date(doc.issueDate).toLocaleDateString("en-GB")}</span>}
                {doc.expiryDate && <span>Valid until: {new Date(doc.expiryDate).toLocaleDateString("en-GB")}</span>}
                {doc.documentNumber && <span>Ref: {doc.documentNumber}</span>}
              </div>
              {doc.subject && <p className="mt-3 text-sm font-semibold">{doc.subject}</p>}
            </div>

            {/* Content */}
            <div className="prose prose-sm max-w-none">
              {doc.contentMarkdown.split("\n").map((line, i) => {
                if (line.startsWith("# ")) return <h1 key={i} className="text-2xl font-black mb-4">{line.slice(2)}</h1>;
                if (line.startsWith("## ")) return <h2 key={i} className="text-xl font-bold mt-6 mb-3">{line.slice(3)}</h2>;
                if (line.startsWith("### ")) return <h3 key={i} className="text-lg font-semibold mt-4 mb-2">{line.slice(4)}</h3>;
                if (line.startsWith("---")) return <hr key={i} className="my-6 border-[#ded9cf]" />;
                if (line.startsWith("- [ ] ")) return <div key={i} className="flex items-center gap-2 text-sm"><input type="checkbox" disabled className="accent-[color:var(--primary)]" /><span>{line.slice(6)}</span></div>;
                if (line.startsWith("- [x] ")) return <div key={i} className="flex items-center gap-2 text-sm"><input type="checkbox" disabled checked className="accent-[color:var(--primary)]" /><span>{line.slice(6)}</span></div>;
                if (line.startsWith("- ")) return <li key={i} className="text-sm ml-4">{line.slice(2)}</li>;
                if (line.startsWith("| ")) return <p key={i} className="text-xs font-mono">{line}</p>;
                if (line.trim()) return <p key={i} className="leading-7 mb-2 text-sm">{line}</p>;
                return <br key={i} />;
              })}
            </div>

            {/* Signature */}
            {doc.senderName && (
              <div className="mt-10 border-t border-[#ded9cf] pt-5">
                <p className="text-sm font-semibold">{doc.senderName}</p>
              </div>
            )}
          </div>
        </article>
      )}

      {/* Acceptance section */}
      {isAccepted && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
          <Check size={24} className="mx-auto mb-2 text-emerald-600" />
          <p className="font-bold text-emerald-800">Document Accepted</p>
          <p className="text-sm text-emerald-600">Thank you for your review and acceptance.</p>
        </div>
      )}

      {isDeclined && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-center">
          <X size={24} className="mx-auto mb-2 text-amber-600" />
          <p className="font-bold text-amber-800">Document Declined</p>
          <p className="text-sm text-amber-600">Your feedback has been received.</p>
        </div>
      )}

      {canAccept && !showDecline && (
        <div className="mt-6 grid gap-4 rounded-xl border border-[color:var(--border-subtle)] bg-white p-5 shadow-sm">
          <h3 className="font-bold text-sm">Document Acceptance</h3>
          <p className="text-xs text-[color:var(--text-muted)]">By accepting, you confirm that you have reviewed this document and agree to its terms. This serves as a record of acknowledgement.</p>
          <div className="flex flex-wrap gap-3">
            <input
              value={acceptName}
              onChange={(e) => setAcceptName(e.target.value)}
              placeholder="Your full name"
              className="h-10 flex-1 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--background)] px-3 text-sm outline-none focus:border-[color:var(--primary)] min-w-[200px]"
            />
            <button onClick={handleAccept} disabled={accepting} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
              {accepting ? "Processing..." : "Accept"}
            </button>
            <button onClick={() => setShowDecline(true)} className="rounded-xl border border-red-300 px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50">
              Decline
            </button>
          </div>
        </div>
      )}

      {canAccept && showDecline && (
        <div className="mt-6 grid gap-4 rounded-xl border border-red-200 bg-white p-5 shadow-sm">
          <h3 className="font-bold text-sm text-red-600">Decline Document</h3>
          <p className="text-xs text-[color:var(--text-muted)]">Please let us know why you are declining this document.</p>
          <input
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="Reason for declining"
            className="h-10 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--background)] px-3 text-sm outline-none focus:border-red-400"
          />
          <textarea
            value={declineComment}
            onChange={(e) => setDeclineComment(e.target.value)}
            placeholder="Additional comments (optional)"
            rows={3}
            className="rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--background)] px-3 py-2 text-sm outline-none focus:border-red-400"
          />
          <div className="flex gap-2">
            <button onClick={handleDecline} className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700">Submit</button>
            <button onClick={() => setShowDecline(false)} className="rounded-xl border border-[color:var(--border-subtle)] px-5 py-2.5 text-sm font-bold hover:bg-[color:var(--surface-soft)]">Cancel</button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-[color:var(--text-faint)]">
          {doc.senderName ? `From ${doc.senderName} · ` : ""}
          Powered by FlexTech Media
        </p>
      </div>
    </div>
  );
}
