/**
 * Preserve the API's explanatory Zod issue when it reports a validation failure.
 * Other failures (authorization, conflicts, server errors) keep their original text.
 */
export function financeErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const data = payload as { error?: unknown; issues?: unknown };
  if (data.error === "Validation failed" && Array.isArray(data.issues)) {
    const issue = data.issues.find(
      (entry): entry is { message: string } =>
        !!entry && typeof entry === "object" &&
        "message" in entry && typeof entry.message === "string" && !!entry.message.trim()
    );
    if (issue) return issue.message.trim();
  }
  return typeof data.error === "string" && data.error.trim() ? data.error : fallback;
}
