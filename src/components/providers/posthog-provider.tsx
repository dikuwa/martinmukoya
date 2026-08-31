"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense, type ReactNode } from "react";

const COOKIE_CONSENT_KEY = "cookie-consent-v1";

const posthogKey =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ??
  process.env.NEXT_PUBLIC_POSTHOG_TOKEN;

let posthogModule: typeof import("posthog-js").default | null = null;

async function getPostHog(): Promise<typeof import("posthog-js").default> {
  if (posthogModule) return posthogModule;
  const mod = await import("posthog-js");
  posthogModule = mod.default;
  return posthogModule;
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
    if (!posthogKey) return;

    const consented = getStoredConsent();

    getPostHog().then((ph) => {
      if (!ph.__loaded) {
        ph.init(posthogKey, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
          capture_pageview: false,
          persistence: "localStorage+cookie",
        });
      }

      if (!consented) {
        ph.opt_out_capturing();
      } else {
        ph.opt_in_capturing();
      }

      if (pathname && ph.__loaded && consented) {
        let url = window.origin + pathname;
        if (searchParams?.toString()) {
          url += `?${searchParams.toString()}`;
        }
        ph.capture("$pageview", { $current_url: url });
      }
    });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {posthogKey ? (
        <Suspense fallback={null}>
          <PostHogPageView />
        </Suspense>
      ) : null}
      {children}
    </>
  );
}
