"use client";

import { useState } from "react";
import { Check, Copy, Download, Printer } from "lucide-react";
import toast from "react-hot-toast";

type Props = {
  shortCode: string;
  documentNumber: string | null;
  documentType: string;
};

export function PublicFinancialDocumentActions({ shortCode, documentNumber, documentType }: Props) {
  const [copied, setCopied] = useState(false);

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

      <div className="mt-5 flex flex-wrap gap-2 md:mt-0 md:justify-end">
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
