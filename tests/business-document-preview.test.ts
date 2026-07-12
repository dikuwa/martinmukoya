import test from "node:test";
import assert from "node:assert/strict";

// Import the actual functions from the shared utility module.
import {
  parseContentMarkdown,
  elementHeight,
  splitIntoPages,
  docTypeLabels,
  A4_CONTENT_HEIGHT,
  CONTINUATION_CONTENT_HEIGHT,
} from "../src/lib/business-document-preview-utils";
import type { ContentElement } from "../src/lib/business-document-preview-utils";

// ── docTypeLabels ──

test("docTypeLabels maps every known document type to a display label", () => {
  assert.equal(docTypeLabels["PROPOSAL"], "PROPOSAL");
  assert.equal(docTypeLabels["NDA"], "CONFIDENTIALITY AGREEMENT");
  assert.equal(docTypeLabels["CUSTOM"], "DOCUMENT");
  assert.equal(docTypeLabels["UNKNOWN" as string], undefined);
});

// ── parseContentMarkdown ──

test("parseContentMarkdown returns a single spacer for empty string", () => {
  const result = parseContentMarkdown("");
  assert.equal(result.length, 1);
  assert.equal(result[0].type, "spacer");
});

test("parseContentMarkdown parses heading1 with # text", () => {
  const result = parseContentMarkdown("# Project Overview");
  assert.equal(result.length, 1);
  assert.equal(result[0].type, "heading1");
  assert.equal((result[0] as { content: string }).content, "Project Overview");
});

test("parseContentMarkdown parses heading2 and heading3", () => {
  const result = parseContentMarkdown("## Section\n### Subsection");
  assert.equal(result.length, 2);
  assert.equal(result[0].type, "heading2");
  assert.equal((result[0] as { content: string }).content, "Section");
  assert.equal(result[1].type, "heading3");
  assert.equal((result[1] as { content: string }).content, "Subsection");
});

test("parseContentMarkdown handles hr, checkbox, list-item, table-row, paragraph", () => {
  const result = parseContentMarkdown("---\n- [ ] unchecked\n- [x] checked\n- list item\n| col1 | col2 |\nplain paragraph");
  assert.equal(result.length, 6);
  assert.equal(result[0].type, "hr");
  assert.equal(result[1].type, "checkbox-unchecked");
  assert.equal(result[2].type, "checkbox-checked");
  assert.equal(result[3].type, "list-item");
  assert.equal(result[4].type, "table-row");
  assert.equal(result[5].type, "paragraph");
});

test("parseContentMarkdown properly extracts checkbox content", () => {
  const result = parseContentMarkdown("- [ ] Design review\n- [x] Final approval");
  assert.equal(result.length, 2);
  assert.equal((result[0] as { content: string }).content, "Design review");
  assert.equal((result[1] as { content: string }).content, "Final approval");
});

test("parseContentMarkdown extracts list content without dash prefix", () => {
  const result = parseContentMarkdown("- Item one\n- Item two");
  assert.equal((result[0] as { content: string }).content, "Item one");
  assert.equal((result[1] as { content: string }).content, "Item two");
});

test("parseContentMarkdown preserves table row as-is", () => {
  const result = parseContentMarkdown("| Name | Value |");
  assert.equal((result[0] as { content: string }).content, "| Name | Value |");
});

test("parseContentMarkdown treats blank lines as spacers", () => {
  const result = parseContentMarkdown("Para one\n\nPara two");
  assert.equal(result.length, 3);
  assert.equal(result[0].type, "paragraph");
  assert.equal(result[1].type, "spacer");
  assert.equal(result[2].type, "paragraph");
});

test("parseContentMarkdown removes markdown heading markers but preserves content", () => {
  assert.equal((parseContentMarkdown("# Title")[0] as { content: string }).content, "Title");
  assert.equal((parseContentMarkdown("## Sub")[0] as { content: string }).content, "Sub");
  assert.equal((parseContentMarkdown("### Subsub")[0] as { content: string }).content, "Subsub");
});

// ── elementHeight ──

test("elementHeight returns expected values per type", () => {
  assert.equal(elementHeight({ type: "heading1", content: "x" }), 52);
  assert.equal(elementHeight({ type: "heading2", content: "x" }), 44);
  assert.equal(elementHeight({ type: "heading3", content: "x" }), 36);
  assert.equal(elementHeight({ type: "hr" }), 36);
  assert.equal(elementHeight({ type: "checkbox-unchecked", content: "x" }), 32);
  assert.equal(elementHeight({ type: "checkbox-checked", content: "x" }), 32);
  assert.equal(elementHeight({ type: "list-item", content: "x" }), 32);
  assert.equal(elementHeight({ type: "table-row", content: "x" }), 24);
  assert.equal(elementHeight({ type: "paragraph", content: "x" }), 32);
  assert.equal(elementHeight({ type: "spacer" }), 10);
});

// ── splitIntoPages ──

test("splitIntoPages returns empty array for empty content", () => {
  assert.equal(splitIntoPages([]).length, 0);
});

test("splitIntoPages keeps all elements on one page if they fit within A4_CONTENT_HEIGHT", () => {
  // 20 paragraphs × 32px = 640px (< 860)
  const elements: ContentElement[] = Array(20).fill(null).map(() => ({ type: "paragraph", content: "Short text" }));
  assert.equal(splitIntoPages(elements).length, 1);
});

test("splitIntoPages splits into multiple pages when content exceeds budget", () => {
  // 30 paragraphs × 32px = 960px (> 860 for first page)
  const elements: ContentElement[] = Array(30).fill(null).map(() => ({ type: "paragraph", content: "Text" }));
  const pages = splitIntoPages(elements);
  assert.ok(pages.length >= 2, `Expected ≥2 pages but got ${pages.length}`);
});

test("splitIntoPages uses larger budget for continuation pages", () => {
  // 55 paragraphs × 32 = 1760px total
  // First page: ⌊860/32⌋ = 26 elements → 26×32 = 832px ≤ 860
  // Remaining: 29 elements → 29×32 = 928px ≤ 960 → fits on page 2
  const elements: ContentElement[] = Array(55).fill(null).map(() => ({ type: "paragraph", content: "Text" }));
  const pages = splitIntoPages(elements);
  assert.equal(pages.length, 2);
  // Verify both pages stay within their budgets
  const firstPageH = pages[0].reduce((sum, e) => sum + elementHeight(e), 0);
  assert.ok(firstPageH <= A4_CONTENT_HEIGHT);
  const secondPageH = pages[1].reduce((sum, e) => sum + elementHeight(e), 0);
  assert.ok(secondPageH <= CONTINUATION_CONTENT_HEIGHT);
});

test("splitIntoPages ensures no page exceeds its budget", () => {
  const elements: ContentElement[] = Array(100).fill(null).map((_, i) => ({ type: "paragraph", content: `Line ${i}` }));
  const pages = splitIntoPages(elements);
  for (let i = 0; i < pages.length; i++) {
    const budget = i === 0 ? A4_CONTENT_HEIGHT : CONTINUATION_CONTENT_HEIGHT;
    const totalH = pages[i].reduce((sum, e) => sum + elementHeight(e), 0);
    assert.ok(totalH <= budget, `Page ${i + 1} height ${totalH} exceeds budget ${budget}`);
  }
});

test("splitIntoPages handles a single element correctly", () => {
  assert.equal(splitIntoPages([{ type: "heading1", content: "Big Title" }]).length, 1);
});

test("splitIntoPages mixed content types distribute correctly", () => {
  const elements: ContentElement[] = [
    { type: "heading1", content: "Title" },
    { type: "paragraph", content: "Intro text" },
    { type: "heading2", content: "Section" },
    { type: "paragraph", content: "Detail" },
    { type: "list-item", content: "Point one" },
    { type: "list-item", content: "Point two" },
    { type: "paragraph", content: "More detail" },
    { type: "hr" },
    { type: "paragraph", content: "After divider" },
  ];
  // Total: 52+32+44+32+32+32+32+36+32 = 324 < 860 → single page
  assert.equal(splitIntoPages(elements).length, 1);
});
