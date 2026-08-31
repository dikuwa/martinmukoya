"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Allura } from "next/font/google";
import { DocumentPageBackdrop } from "@/components/documents/document-page-backdrop";
import { formatDocumentDate } from "@/lib/business-document-templates";
import { docTypeLabels, parseContentMarkdown, splitIntoPages } from "@/lib/business-document-preview-utils";
import type { ContentElement } from "@/lib/business-document-preview-utils";

const allura = Allura({ weight: "400", subsets: ["latin"], display: "swap" });

export type BusinessPreviewDocument = {
  id: string;
  documentNumber: string | null;
  documentType: string;
  status: string;
  title: string;
  subject: string | null;
  recipientName: string | null;
  companyName: string | null;
  recipientEmail: string | null;
  recipientPhone: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  contentMarkdown: string;
  senderName: string | null;
  senderRole: string | null;
  signatureRequired: boolean;
  recipientWhatsApp?: string | null;
};

export type BusinessIdentity = {
  name: string;
  logo: string;
  phone: string;
  email: string;
  address: string;
  companyDetails: string;
  signerName: string;
  signerTitle: string;
  signatureMode: "text" | "image";
  signatureImage: string;
  showSignature: boolean;
  registration?: string;
};

// ── Inline bold parser ──────────────────────────────────────────

/** Renders a string with **bold** markers into inline <strong> spans */
function InlineBold({ text }: { text: string }) {
  const parts = text.split(/(\*\*.+?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ── Element renderers ───────────────────────────────────────────

function ElementRenderer({ el }: { el: ContentElement }) {
  switch (el.type) {
    case "heading1":
      return <h1 className="mb-3 mt-2 text-xl font-black text-[#242424]"><InlineBold text={el.content} /></h1>;
    case "heading2":
      return <h2 className="mb-2 mt-5 text-base font-bold text-[#333]"><InlineBold text={el.content} /></h2>;
    case "heading3":
      return <h3 className="mb-1 mt-4 text-sm font-semibold text-[#444]"><InlineBold text={el.content} /></h3>;
    case "hr":
      return <hr className="my-4 border-[#ded9cf]" />;
    case "checkbox-unchecked":
      return (
        <div className="mb-1 flex items-center gap-2 text-sm">
          <span className="inline-block h-3.5 w-3.5 rounded border border-[#999] bg-white shrink-0" />
          <InlineBold text={el.content} />
        </div>
      );
    case "checkbox-checked":
      return (
        <div className="mb-1 flex items-center gap-2 text-sm">
          <span className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border border-[#999] bg-[color:var(--primary)]">
            <svg viewBox="0 0 14 14" className="h-3 w-3 text-white">
              <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </span>
          <InlineBold text={el.content} />
        </div>
      );
    case "list-item":
      return (
        <div className="mb-1 ml-4 flex items-start gap-2 text-sm">
          <span className="mt-0.5 text-[#777] shrink-0">•</span>
          <InlineBold text={el.content} />
        </div>
      );
    case "table-row":
      return <p className="mb-1 font-mono text-[11px] text-[#555]">{el.content}</p>;
    case "paragraph":
      return <p className="mb-2 leading-relaxed text-[#242424]"><InlineBold text={el.content} /></p>;
    case "spacer":
      return <div className="h-2" />;
  }
}

// ── Single page renderer ────────────────────────────────────────

type PageProps = {
  pageNumber: number;
  totalPages: number;
  elements: ContentElement[];
  doc: BusinessPreviewDocument;
  business: BusinessIdentity;
  showDraftMark: boolean;
  issueDate: string;
  typeLabel: string;
};

function DocumentPage({ pageNumber, totalPages, elements, doc, business, showDraftMark, issueDate, typeLabel }: PageProps) {
  const isFirstPage = pageNumber === 1;

  return (
    <article
      className="relative isolate mx-auto w-full max-w-[900px] overflow-hidden rounded-sm border border-[#ddd8cf] bg-[#fffdf8] p-6 text-[#242424] shadow-sm [&>*:not(img)]:relative [&>*:not(img)]:z-10 md:p-10"
    >
      <DocumentPageBackdrop />

      {/* DRAFT watermark — only on first page */}
      {isFirstPage && doc.status === "DRAFT" && showDraftMark && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-7xl font-black tracking-widest text-black/[0.045] -rotate-12 select-none">
          DRAFT
        </div>
      )}

      {/* FIRST ROW: Logo left, Contact right — only on first page */}
      {isFirstPage && (
        <header className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <Image src={business.logo} alt={business.name} width={208} height={56} unoptimized className="h-14 max-w-52 object-contain object-left" />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#777]">CONTACT</p>
            <p className="mt-1 text-xs text-[#242424]">{business.phone}</p>
            <p className="text-xs text-[#242424]">{business.email}</p>
          </div>
        </header>
      )}

      {/* First divider */}
      {isFirstPage && <hr className="my-4 border-[#ded9cf]" />}

      {/* SECOND ROW: TO left, DATE right — only on first page */}
      {isFirstPage && (
        <section className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#777]">TO</p>
            {doc.recipientName && <p className="mt-1 text-sm font-bold text-[#242424]">{doc.recipientName}</p>}
            {doc.companyName && <p className="text-xs text-[#666]">{doc.companyName}</p>}
            {doc.recipientEmail && <p className="text-xs text-[#666]">{doc.recipientEmail}</p>}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#777]">DATE</p>
            <p className="mt-1 text-sm text-[#242424]">{issueDate || new Date().toLocaleDateString("en-GB")}</p>
          </div>
        </section>
      )}

      {/* THIRD AREA: Document type, title, reference, subtitle — only on first page */}
      {isFirstPage && (
        <div className="mt-6">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#777]">{typeLabel}</p>
          <h1 className="mt-1 text-2xl font-extrabold text-[#242424]">{doc.title}</h1>
          {doc.documentNumber && <p className="mt-1 text-xs text-[#777]">Ref: {doc.documentNumber}</p>}
          {doc.subject && <p className="mt-2 text-sm font-semibold text-[#555]">{doc.subject}</p>}
          {doc.expiryDate && <p className="mt-1 text-xs text-[#777]">Valid until: {formatDocumentDate(doc.expiryDate)}</p>}
        </div>
      )}

      {/* Second divider */}
      {isFirstPage && <hr className="my-4 border-[#ded9cf]" />}

      {/* Continuation header on subsequent pages */}
      {!isFirstPage && (
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#777]">
            {doc.title} · Continued
          </p>
          <hr className="mt-2 border-[#ded9cf]" />
        </div>
      )}

      {/* Content */}
      <div className="mt-4">
        {elements.map((el, idx) => <ElementRenderer key={idx} el={el} />)}
      </div>

      {/* Signature — only on last page */}
      {pageNumber === totalPages && (
        <footer className="mt-6 flex items-end justify-between gap-5 border-t border-[#ded9cf] pt-4">
          <p className="max-w-[55%] whitespace-pre-line text-[10px] leading-[13px] text-[#777]">{business.companyDetails}</p>
          {business.showSignature && doc.senderName && (
            <div className="min-w-44 text-right">
              {business.signatureMode === "image" && business.signatureImage ? (
                <Image src={business.signatureImage} alt={`${business.signerName} signature`} width={144} height={40} unoptimized className="ml-auto -mb-1 h-10 w-36 -rotate-3 object-contain object-right" />
              ) : (
                <div className={`${allura.className} -mb-1 -rotate-3 text-[23px] leading-[22px]`}>{doc.senderName || business.signerName}</div>
              )}
              <p className="text-xs font-semibold">{doc.senderName || business.signerName}</p>
              {doc.senderRole && <p className="text-[10px] text-[#777]">{doc.senderRole}</p>}
            </div>
          )}
        </footer>
      )}

      {/* Footer with company details on continuation pages */}
      {pageNumber < totalPages && (
        <footer className="mt-6 border-t border-[#ded9cf] pt-4">
          <p className="whitespace-pre-line text-[10px] leading-[13px] text-[#777]">{business.companyDetails}</p>
        </footer>
      )}

      {/* Page number */}
      <div className="mt-2 text-center">
        <p className="text-[9px] text-[#bbb]">{pageNumber} / {totalPages}</p>
      </div>
    </article>
  );
}

// ── Main preview component ──────────────────────────────────────

type Props = {
  document: BusinessPreviewDocument;
  business: BusinessIdentity;
  showDraftMark?: boolean;
};

export function BusinessDocumentPreview({ document: doc, business, showDraftMark = true }: Props) {
  const issueDate = doc.issueDate ? formatDocumentDate(doc.issueDate) : "";
  const typeLabel = docTypeLabels[doc.documentType] || doc.documentType;

  // Parse content once
  const elements = useMemo(() => parseContentMarkdown(doc.contentMarkdown), [doc.contentMarkdown]);

  // Split into pages based on estimated element heights
  const pages = useMemo(() => splitIntoPages(elements), [elements]);
  const totalPages = pages.length;

  return (
    <div className="grid gap-6 print:gap-0 print:block">
      {pages.map((pageElements, idx) => (
        <div key={idx} className={idx > 0 ? "print:page-break-before print:pt-0" : ""}>
          <DocumentPage
            pageNumber={idx + 1}
            totalPages={totalPages}
            elements={pageElements}
            doc={doc}
            business={business}
            showDraftMark={showDraftMark}
            issueDate={issueDate}
            typeLabel={typeLabel}
          />
        </div>
      ))}
    </div>
  );
}
