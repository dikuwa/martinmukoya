/**
 * Pure utility functions used by BusinessDocumentPreview.
 * Extracted into a separate file so they can be imported by both
 * the React component and Node-based unit tests without needing jsdom.
 */

export type ContentElement =
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

/** Usable content height inside one A4 page (px) for the FIRST page. */
export const A4_CONTENT_HEIGHT = 860;

/** Usable content height for continuation pages (px) — more room since
 *  logo/contact, TO/DATE, and title area are not present. */
export const CONTINUATION_CONTENT_HEIGHT = 960;

export const docTypeLabels: Record<string, string> = {
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

/**
 * Approximate pixel heights for each element type (used for page splitting).
 * Values account for: line-height (leading-relaxed ≈ 1.625 × 14px ≈ 23px)
 * + margin-bottom (default mb-2 = 8px). Headings have larger font and margin. */
export function elementHeight(el: ContentElement): number {
  switch (el.type) {
    case "heading1": return 52;
    case "heading2": return 44;
    case "heading3": return 36;
    case "hr": return 36;
    case "checkbox-unchecked":
    case "checkbox-checked": return 32;
    case "list-item": return 32;
    case "table-row": return 24;
    case "paragraph": return 32;
    case "spacer": return 10;
    default: return 24;
  }
}

/**
 * Parse a Markdown-like string into an array of ContentElement.
 * Handles headings, horizontal rules, checkboxes, lists, tables, and paragraphs.
 * Blank lines become spacer elements. */
export function parseContentMarkdown(content: string): ContentElement[] {
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
    if (trimmed.startsWith("# ")) {
      elements.push({ type: "heading1", content: trimmed.slice(2).trim() });
      continue;
    }

    elements.push({ type: "paragraph", content: trimmed });
  }

  return elements;
}

/**
 * Split elements into pages based on estimated height.
 * Continuation pages get a larger budget (960px) since they lack
 * the logo/contact, TO/DATE, and title-area overhead. */
export function splitIntoPages(elements: ContentElement[]): ContentElement[][] {
  const pages: ContentElement[][] = [];
  let currentPage: ContentElement[] = [];
  let currentHeight = 0;

  for (const el of elements) {
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
