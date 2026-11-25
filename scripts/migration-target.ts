const PRODUCTION_SUPABASE_PROJECT = "ujuxpamgzerbksmqbxqj";

export type MigrationTargetEnvironment = "ci" | "staging" | "production";

export function validateMigrationTarget(input: {
  databaseUrl?: string;
  environment?: string;
  expectedHost?: string;
  expectedDatabase?: string;
}): void {
  const environment = input.environment?.trim();
  if (!environment || !["ci", "staging", "production"].includes(environment)) {
    throw new Error("DATABASE_ENV must be explicitly set to ci, staging, or production before migrations.");
  }

  if (!input.expectedHost?.trim() || !input.expectedDatabase?.trim()) {
    throw new Error("DATABASE_EXPECTED_HOST and DATABASE_EXPECTED_NAME are required before migrations.");
  }

  let parsed: URL;
  try {
    parsed = new URL(input.databaseUrl ?? "");
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL URL before migrations.");
  }

  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    throw new Error("DATABASE_URL must use PostgreSQL before migrations.");
  }

  const databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (parsed.hostname !== input.expectedHost.trim() || databaseName !== input.expectedDatabase.trim()) {
    throw new Error("DATABASE_URL does not match the explicitly expected migration target.");
  }

  const connectionIdentity = [parsed.username, parsed.hostname, parsed.pathname].join("/");
  if (environment !== "production" && (connectionIdentity.includes(PRODUCTION_SUPABASE_PROJECT) || parsed.hostname.endsWith(".supabase.com"))) {
    throw new Error("Non-production migrations cannot target the production Supabase database.");
  }
}
