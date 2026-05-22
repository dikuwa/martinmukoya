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
    const posthogPayload = {
      siteId: input.siteId,
      siteSlug: input.siteSlug,
      page: input.page,
      referrer: input.referrer,
      source: input.source,
      device: input.device,
      country: input.country,
      ...input.metadata
    };

    posthog.capture(input.eventType, posthogPayload);

    for (const eventType of posthogAliases(input)) {
      posthog.capture(eventType, posthogPayload);
    }
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

function posthogAliases(input: TrackEventInput) {
  const aliases = new Set<string>();

  if (input.eventType === "whatsapp_click") aliases.add("whatsapp_clicked");
  if (input.eventType === "email_click") aliases.add("email_clicked");
  if (input.eventType === "form_started" && input.source === "contact_form") aliases.add("contact_form_started");
  if (input.eventType === "form_submitted" && input.source === "contact_form") aliases.add("contact_form_submitted");
  if (input.eventType === "cta_click" && input.source?.includes("start_project")) aliases.add("book_project_clicked");
  if (input.eventType === "cta_click" && input.source === "hero_secondary") aliases.add("see_work_clicked");

  return aliases;
}
