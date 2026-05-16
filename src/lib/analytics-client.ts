type TrackEventInput = {
  eventType: string;
  page?: string;
  referrer?: string;
  source?: string;
  device?: string;
  country?: string;
  metadata?: Record<string, unknown>;
};

export function trackEvent(input: TrackEventInput) {
  const payload = JSON.stringify(input);

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
