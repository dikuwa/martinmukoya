"use client";

import { useMemo } from "react";
import { Allura } from "next/font/google";
import { DocumentPageBackdrop } from "@/components/documents/document-page-backdrop";
import { formatDocumentDate } from "@/lib/business-document-templates";

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

const docTypeLabels: Record<string, string> = {
  PROPOSAL: "PROPOSAL", SERVICE_AGREEMENT: "SERVICE AGREEMENT",
  WEB_DESIGN_CONTRACT: "WEB DESIGN CONTRACT", MAINTENANCE_AGREEMENT: "MAINTENANCE AGREEMENT",
  HOSTING_AGREEMENT: "HOSTING AGREEMENT", SCOPE_OF_WORK: "SCOPE OF WORK",
  PROJECT_BRIEF: "PROJECT BRIEF", CHANGE_REQUEST: "CHANGE REQUEST",
  PROJECT_HANDOVER: "PROJECT HANDOVER", CLIENT_ACCEPTANCE: "CLIENT ACCEPTANCE",
  BUSINESS_LETTER: "BUSINESS LETTER", PAYMENT_REMINDER: "PAYMENT REMINDER",
  OVERDUE_NOTICE: "OVERDUE NOTICE", MEETING_SUMMARY: "MEETING SUMMARY",
  PROGRESS_REPORT: "PROGRESS REPORT", AUDIT_REPORT: "AUDIT REPORT",
  MAINTENANCE_REPORT: "MAINTENANCE REPORT", NDA: "CONFIDENTIALITY AGREEMENT",
  CUSTOM: "DOCUMENT",
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

// ── Parsed content elements ─────────────────────────────────────

type ContentElement =
  | { type: "heading1"; content: string }
  | { type: "heading2"; content: string }
  | { type: "heading3"; content: string }
  | { type: "hr" }
  | { type: "checkbox-unchecked"; content: string }
  | { type: "checkbox-checked"; content: string }
  | { type: "list-item"; content: string }
  | { type: "table-row"; content: string }
  | { type: "paragraph"; content: string }
  | { type: "spacer" };

/**
 * Approximate pixel heights for each element type (used for page splitting).
 * Values account for: line-height (leading-relaxed ≈ 1.625 × 14px ≈ 23px)
 * + margin-bottom (default mb-2 = 8px). Headings have larger font and margin. */
function elementHeight(el: ContentElement): number {
  switch (el.type) {
    case "heading1": return 52;   // text-xl (20px) × 1.2 + mb-3 (12px) + mt-2 (8px)
    case "heading2": return 44;   // text-base (16px) × 1.3 + mb-2 (8px) + mt-5 (20px)
    case "heading3": return 36;   // text-sm (14px) × 1.4 + mb-1 (4px) + mt-4 (16px)
    case "hr": return 36;        // my-4 = 16px top + 1px border + 16px bottom ≈ 33px
    case "checkbox-unchecked":
    case "checkbox-checked": return 32;  // 23px line + 8px mb-1 + gap
    case "list-item": return 32;         // same as paragraph
    case "table-row": return 24;         // tighter font-mono line
    case "paragraph": return 32;         // 23px leading-relaxed + 8px mb-2
    case "spacer": return 10;            // h-2
    default: return 24;
  }
}

/**
 * Usable content height inside one A4 page (px).
 * A4 ratio at 900px width ≈ 1273px total height.
 * Subtract: padding (80px top+bottom), header row (~60px), first divider (16px),
 * TO/DATE row (~50px), title area (~80px), second divider (16px),
 * signature area (~60px bottom), page number (16px) ≈ 378px
 * Result: 1273 - 378 ≈ 895px for first page.
 * Continuation pages have the "Continued" header (~36px) → 895 - 36 = 859px.
 */
/**
 * Usable content height inside one A4 page (px) for the FIRST page.
 * A4 ratio at 900px width ≈ 1273px total height.
 * Subtract overhead: padding 80px + logo/contact 60px + divider 16px
 * + TO/DATE 50px + title area 96px + divider 16px + signature 60px
 * + page number 16px + buffer 16px ≈ 410px.
 * First page content ≈ 1273 - 410 = 863px ≈ 860px.
 */
const A4_CONTENT_HEIGHT = 860;

/**
 * Continuation pages (page 2+) have much less overhead:
 * No logo/contact, TO/DATE, or title area. Just padding 80px +
 * continuation header 56px + footer 40px + page number 16px ≈ 192px.
 * Continuation page content ≈ 1273 - 192 = 1081px.
 * Use 960px for some margin. */
const CONTINUATION_CONTENT_HEIGHT = 960;

function parseContentMarkdown(content: string): ContentElement[] {
  const lines = content.split("\n");
  const elements: ContentElement[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { elements.push({ type: "spacer" }); continue; }

    if (/^##\s/.test(trimmed)) {
      elements.push({ type: "heading2", content: trimmed.replace(/^##\s+/, "").trim() });
      continue;
    }
    if (/^###\s/.test(trimmed)) {
      elements.push({ type: "heading3", content: trimmed.replace(/^###\s+/, "").trim() });
      continue;
    }
    if (trimmed === "---") { elements.push({ type: "hr" }); continue; }
    if (/^- \[ \] /.test(trimmed)) {
      elements.push({ type: "checkbox-unchecked", content: trimmed.replace(/^- \[ \] +/, "") });
      continue;
    }
    if (/^- \[x\] /.test(trimmed)) {
      elements.push({ type: "checkbox-checked", content: trimmed.replace(/^- \[x\] +/, "") });
      continue;
    }
    if (/^- /.test(trimmed)) {
      elements.push({ type: "list-item", content: trimmed.replace(/^- +/, "") });
      continue;
    }
    if (/^\| /.test(trimmed)) {
      elements.push({ type: "table-row", content: trimmed });
      continue;
    }
    // heading 1 with markdown-style
    if (trimmed.startsWith("# ")) {
      elements.push({ type: "heading1", content: trimmed.slice(2).trim() });
      continue;
    }

    elements.push({ type: "paragraph", content: trimmed });
  }

  return elements;
}

/** Split elements into pages based on estimated height.
 * Continuation pages have less usable space due to the "Continued" header. */
function splitIntoPages(elements: ContentElement[]): ContentElement[][] {
  const pages: ContentElement[][] = [];
  let currentPage: ContentElement[] = [];
  let currentHeight = 0;

  for (const el of elements) {
    // Continuation pages (2+) have no title-area overhead so they get a larger budget
    const pageBudget = pages.length === 0 ? A4_CONTENT_HEIGHT : CONTINUATION_CONTENT_HEIGHT;
    const h = elementHeight(el);
    if (currentHeight + h > pageBudget && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [el];
      currentHeight = h;
    } else {
      currentPage.push(el);
      currentHeight += h;
    }
  }

  if (currentPage.length > 0) pages.push(currentPage);
  return pages;
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
            <img src={business.logo} alt={business.name} className="h-14 max-w-52 object-contain object-left" />
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
                <img src={business.signatureImage} alt={`${business.signerName} signature`} className="ml-auto -mb-1 h-10 w-36 -rotate-3 object-contain object-right" />
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
