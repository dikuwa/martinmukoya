import type { ReactNode } from "react";

export type BlogHeading = { id: string; level: 2 | 3; text: string };

/**
 * Slugify a heading's plain text into a DOM id. Must stay in sync with the
 * ids assigned by `blog-markdown.tsx` — this single function is the source of
 * truth for both the rendered headings and the server-side TOC extraction.
 */
export function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

/** Flatten React children (strings, elements, fragments) into plain text. */
export function headingText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(headingText).join("");
  if (children && typeof children === "object" && "props" in children) {
    const props = children.props as { children?: ReactNode };
    return headingText(props.children);
  }
  return "";
}

/**
 * Extract `##`/`###` headings from raw markdown, mirroring the rendered text
 * so ids match the ones `blog-markdown.tsx` assigns. Fenced code blocks and
 * inline code are skipped so code that looks like a heading is not included.
 */
export function extractBlogHeadings(markdown: string): BlogHeading[] {
  const withoutFencedCode = markdown.replace(/```[\s\S]*?```/g, "");
  const headings: BlogHeading[] = [];

  for (const line of withoutFencedCode.split("\n")) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line);
    if (!match) continue;

    const level = match[1].length as 2 | 3;
    let text = match[2].trim();
    text = text
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // images → alt text
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links → label
      .replace(/[*_~`]/g, "") // inline emphasis/code markers
      .trim();

    const id = slugifyHeading(text);
    headings.push({ id, level, text });
  }

  return headings;
}