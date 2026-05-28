"use client";

import Link from "next/link";
import { Cookie } from "lucide-react";
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
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomising, setIsCustomising] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    let entranceTimer: number | undefined;
    const hydrationTimer = window.setTimeout(() => {
      const storedConsent = getStoredConsent();
      setConsent(storedConsent);
      setMounted(true);

      if (storedConsent === null) {
        entranceTimer = window.setTimeout(() => setIsVisible(true), 140);
      }
    }, 0);

    return () => {
      window.clearTimeout(hydrationTimer);
      if (entranceTimer) window.clearTimeout(entranceTimer);
    };
  }, []);

  const handleAccept = () => {
    storeConsent("accepted");
    setConsent("accepted");
  };

  const handleSavePreferences = () => {
    const choice = analyticsEnabled ? "accepted" : "declined";
    storeConsent(choice);
    setConsent(choice);
  };

  const handleRejectOptional = () => {
    setAnalyticsEnabled(false);
    storeConsent("declined");
    setConsent("declined");
  };

  // Don't render until hydration is complete
  if (!mounted) return null;

  // Don't show if already decided
  if (consent !== null) return null;

  return (
    <div className="fixed inset-x-0 bottom-3 z-[60] px-3 pb-[env(safe-area-inset-bottom)] sm:bottom-5 sm:px-5">
      <div
        className={[
          "mx-auto max-w-[880px] rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--background-elevated)]/95 px-4 py-3 text-[color:var(--text-normal)] shadow-[0_10px_28px_rgba(65,23,130,0.14)] backdrop-blur-md transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-[18px] sm:py-3.5",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        ].join(" ")}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex min-w-0 items-start gap-3 sm:items-center">
            <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)]/70 text-[color:var(--accent-light)] sm:mt-0">
              <Cookie size={15} aria-hidden="true" />
            </span>
            <p className="text-[13px] leading-[1.4] text-[color:var(--text-normal)] sm:text-sm">
              We use cookies to improve your experience. By using this site, you agree to our{" "}
              <Link href="/privacy" className="font-semibold text-[color:var(--accent-light)] transition hover:underline hover:underline-offset-2">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="font-semibold text-[color:var(--accent-light)] transition hover:underline hover:underline-offset-2">
                Terms of Use
              </Link>
              .
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setIsCustomising((value) => !value)}
              aria-expanded={isCustomising}
              className="rounded-lg px-3 py-1.5 text-[13px] font-semibold text-[color:var(--accent-light)] transition hover:bg-[color:var(--surface-soft)]/70 hover:text-[color:var(--text-strong)]"
            >
              Customise
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="rounded-lg bg-[color:var(--primary)] px-3.5 py-1.5 text-[13px] font-bold text-[color:var(--primary-foreground)] shadow-[0_6px_16px_rgba(107,38,217,0.18)] transition hover:bg-[color:var(--primary-light)]"
            >
              Accept
            </button>
          </div>
        </div>

        {isCustomising && (
          <div className="mt-3 border-t border-[color:var(--border-subtle)] pt-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)]/45 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-bold text-[color:var(--text-strong)]">Essential cookies</p>
                    <p className="mt-1 text-xs leading-[1.4] text-[color:var(--text-muted)]">Required for core site functionality and saved consent choices.</p>
                  </div>
                  <span className="rounded-full bg-[color:var(--surface)] px-2 py-1 text-[11px] font-bold text-[color:var(--text-muted)]">Always on</span>
                </div>
              </div>
              <div className="rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)]/45 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-bold text-[color:var(--text-strong)]">Analytics cookies</p>
                    <p className="mt-1 text-xs leading-[1.4] text-[color:var(--text-muted)]">Help us understand visits and improve pages without changing essential features.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={analyticsEnabled}
                    onClick={() => setAnalyticsEnabled((value) => !value)}
                    className={[
                      "relative h-6 w-11 shrink-0 rounded-full border transition",
                      analyticsEnabled
                        ? "border-[color:var(--primary)] bg-[color:var(--primary)]"
                        : "border-[color:var(--border-subtle)] bg-[color:var(--surface)]"
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "absolute top-1 h-4 w-4 rounded-full bg-[color:var(--primary-foreground)] transition-transform",
                        analyticsEnabled ? "translate-x-5" : "translate-x-1"
                      ].join(" ")}
                    />
                    <span className="sr-only">Analytics cookies</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleRejectOptional}
                className="rounded-lg border border-[color:var(--border-subtle)] px-3 py-1.5 text-[13px] font-semibold text-[color:var(--text-muted)] transition hover:border-[color:var(--accent)]/40 hover:bg-[color:var(--surface-soft)]/70 hover:text-[color:var(--text-strong)]"
              >
                Reject optional
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="rounded-lg bg-[color:var(--surface-soft)] px-3 py-1.5 text-[13px] font-bold text-[color:var(--text-strong)] transition hover:bg-[color:var(--surface)]"
              >
                Save preferences
              </button>
              <button
                type="button"
                onClick={handleAccept}
                className="rounded-lg bg-[color:var(--primary)] px-3.5 py-1.5 text-[13px] font-bold text-[color:var(--primary-foreground)] shadow-[0_6px_16px_rgba(107,38,217,0.18)] transition hover:bg-[color:var(--primary-light)]"
              >
                Accept all
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
