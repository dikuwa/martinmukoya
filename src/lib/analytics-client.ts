import posthog from "posthog-js";

type TrackEventInput = {
  eventType: string;
  siteId?: string;
  siteSlug?: string;
  page?: string;
  referrer?: string;
  source?: string;
  device?: string;
  country?: string;
  metadata?: Record<string, unknown>;
};

export function trackEvent(input: TrackEventInput) {
  const payload = JSON.stringify(input);

  if (typeof window !== "undefined") {
    posthog.capture(input.eventType, {
      siteId: input.siteId,
      siteSlug: input.siteSlug,
      page: input.page,
      referrer: input.referrer,
      source: input.source,
      device: input.device,
      country: input.country,
      ...input.metadata
    });
  }

  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/analytics-events", blob);
    return;
  }

  void fetch("/api/analytics-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true
  });
}
