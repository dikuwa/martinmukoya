/**
 * Fail closed on Vercel previews until an independently verified staging
 * PostgreSQL URL is configured. The Vercel project historically scoped the
 * production DATABASE_URL to both Production and Preview.
 *
 * The preview opt-in alone is not proof of isolation: reject the known
 * production Supabase project even if the flag was accidentally enabled.
 */
const PRODUCTION_SUPABASE_PROJECT = "ujuxpamgzerbksmqbxqj";

export function assertPreviewDatabaseIsolation(input: {
  vercelEnv?: string;
  databaseUrl?: string;
  isolationConfirmed?: string;
}): void {
  if (input.vercelEnv !== "preview") return;

  if (input.isolationConfirmed !== "true") {
    throw new Error("Preview database access is disabled until isolated staging is configured.");
  }

  let parsed: URL;
  try {
    parsed = new URL(input.databaseUrl ?? "");
  } catch {
    throw new Error("Preview database connection URL is not configured.");
  }

  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    throw new Error("Preview database must use PostgreSQL.");
  }

  const connectionIdentity = [parsed.username, parsed.hostname, parsed.pathname].join("/");
  if (connectionIdentity.includes(PRODUCTION_SUPABASE_PROJECT)) {
    throw new Error("Preview database cannot use the production Supabase project.");
  }
}
