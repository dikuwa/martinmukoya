"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <Button aria-label="Copy code" size="icon" variant="ghost" onClick={copyCode}>
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </Button>
  );
}
