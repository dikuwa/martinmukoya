"use client";

import { Check, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";
import { trackEvent } from "@/lib/analytics-client";

function detectLanguage(className?: string): string {
  if (!className) return "";
  const match = className.match(/language-(\w+)/);
  return match ? match[1] : "";
}

function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join("");
  }
  if (node && typeof node === "object" && "props" in node) {
    return extractText((node as { props: { children: ReactNode } }).props.children);
  }
  return "";
}

interface CodeBlockProps {
  children: ReactNode;
  className?: string;
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const language = detectLanguage(className);
  const codeText = extractText(children);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(codeText);
      trackEvent({
        eventType: "code_block_copied",
        page: window.location.pathname,
        source: "markdown_code_block",
        metadata: { language: language || "code" }
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard API unavailable — silently fail
    }
  }

  return (
    <div
      className="group relative mb-5 overflow-hidden rounded-[calc(var(--radius,1rem))] border last:mb-0"
      style={{
        backgroundColor: "var(--code-bg)",
        borderColor: "var(--code-border)",
      }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between border-b px-4 py-2.5"
        style={{
          backgroundColor: "var(--code-header-bg)",
          borderColor: "var(--code-border)",
        }}
      >
        <span
          className="truncate text-xs font-medium tracking-wide"
          style={{ color: "var(--code-muted)" }}
        >
          {language || "code"}
        </span>
        <button
          type="button"
          aria-label={copied ? "Copied" : "Copy code"}
          aria-live="polite"
          onClick={handleCopy}
          className="flex size-7 shrink-0 items-center justify-center rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--code-accent)]"
          style={{
            color: "var(--code-copy-icon)",
            backgroundColor: copied ? "var(--code-copy-icon-hover-bg)" : "transparent",
          }}
          onMouseEnter={(e) => {
            if (!copied) {
              e.currentTarget.style.backgroundColor = "var(--code-copy-icon-hover-bg)";
              e.currentTarget.style.color = "var(--code-copy-icon-hover)";
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--code-copy-icon)";
            }
          }}
        >
          {copied ? (
            <Check size={13} className="transition-transform duration-200" />
          ) : (
            <Copy size={13} className="transition-transform duration-200" />
          )}
        </button>
      </div>
      {/* Code area */}
      <pre
        className="overflow-x-auto p-4 text-[0.925rem] leading-7 font-mono"
        style={{
          color: "var(--code-text)",
          scrollbarWidth: "thin",
          scrollbarColor: "var(--code-border) transparent",
        }}
      >
        <code>{children}</code>
      </pre>
    </div>
  );
}
