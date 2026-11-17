// Share URLs are bearer credentials, including when embedded in referrers or event metadata.
export function redactShareUrls(value: unknown): unknown {
  if (typeof value === "string") return value.replace(/\/(?:d|documents\/share|api\/documents\/share)\/[^\s/?#"<>]+(?:[?#][^\s"<>]*)?/g, "/documents/[redacted]");
  if (Array.isArray(value)) return value.map(redactShareUrls);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, /^(?:shortCode|shareToken)$/i.test(key) ? "[redacted]" : redactShareUrls(item)]));
  return value;
}
