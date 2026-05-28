"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const COOKIE_CONSENT_KEY = "cookie-consent-v1";

type ConsentChoice = "accepted" | "declined" | null;

function getStoredConsent(): ConsentChoice {
  if (typeof window === "undefined") return null;
  try {
    const val = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (val === "accepted" || val === "declined") return val;
  } catch {}
  return null;
}

function storeConsent(choice: "accepted" | "declined") {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, choice);
  } catch {}
}

export function CookieBanner() {
  const [consent, setConsent] = useState<ConsentChoice>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConsent(getStoredConsent());
  }, []);

  const handleAccept = () => {
    storeConsent("accepted");
    setConsent("accepted");
  };

  const handleDecline = () => {
    storeConsent("declined");
    setConsent("declined");
  };

  // Don't render until hydration is complete
  if (!mounted) return null;

  // Don't show if already decided
  if (consent !== null) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-4 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--background-elevated)]/95 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.15)] backdrop-blur-xl sm:flex-row sm:items-center sm:gap-6 sm:p-5">
        <p className="text-xs leading-relaxed text-[color:var(--text-normal)] sm:text-sm">
          This site uses cookies for analytics and essential functionality.{" "}
          <Link href="/privacy" className="font-semibold text-[color:var(--primary)] underline underline-offset-2 transition hover:opacity-80">
            Learn more
          </Link>
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={handleDecline}
            className="rounded-full border border-[color:var(--border-subtle)] px-4 py-2 text-xs font-semibold text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)]"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="rounded-full bg-[#22C55E] px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(34,197,94,0.25)] transition hover:bg-[#16A34A]"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
