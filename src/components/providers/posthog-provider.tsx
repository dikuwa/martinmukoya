"use client";

import posthog from "posthog-js";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense, type ReactNode } from "react";

const COOKIE_CONSENT_KEY = "cookie-consent-v1";

const posthogKey =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ??
  process.env.NEXT_PUBLIC_POSTHOG_TOKEN;

if (typeof window !== "undefined" && posthogKey) {
  // Check for existing consent before initialising
  const hasConsented = (() => {
    try {
      return localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
    } catch {
      return false;
    }
  })();

  posthog.init(posthogKey, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false,
    persistence: "localStorage+cookie"
  });

  if (!hasConsented) {
    posthog.opt_out_capturing();
  }
}

function getStoredConsent(): boolean {
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Respect consent choice on each page view
    const consented = getStoredConsent();
    if (consented) {
      posthog.opt_in_capturing();
    } else {
      posthog.opt_out_capturing();
    }

    if (pathname && posthog.__loaded && consented) {
      let url = window.origin + pathname;
      if (searchParams?.toString()) {
        url += `?${searchParams.toString()}`;
      }
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </>
  );
}
