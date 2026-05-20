"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button
      type="button"
      aria-label="Copy code"
      onClick={copyCode}
      className="flex size-8 items-center justify-center rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--code-accent)]"
      style={{
        color: "var(--code-copy-icon)",
        backgroundColor: copied ? "var(--code-copy-icon-hover-bg)" : "transparent"
      }}
      onMouseEnter={(e) => { if (!copied) { e.currentTarget.style.backgroundColor = "var(--code-copy-icon-hover-bg)"; e.currentTarget.style.color = "var(--code-copy-icon-hover)"; } }}
      onMouseLeave={(e) => { if (!copied) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--code-copy-icon)"; } }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}
