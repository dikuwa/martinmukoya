const PRODUCTION_SUPABASE_PROJECT = "ujuxpamgzerbksmqbxqj";
const ENVIRONMENTS = new Set(["ci", "staging", "production"]);
const REVIEWED_CONNECTION_PARAMETERS = new Set([
  "application_name",
  "channel_binding",
  "connect_timeout",
  "connection_limit",
  "pgbouncer",
  "pool_timeout",
  "schema",
  "sslaccept",
  "sslmode",
  "sslrootcert",
]);

export type MigrationTargetEnvironment = "ci" | "staging" | "production";

function parseDatabaseUrl(databaseUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL URL before database mutations.");
  }
  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    throw new Error("DATABASE_URL must use PostgreSQL before database mutations.");
  }
  const databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (!parsed.hostname || !parsed.username || !databaseName || databaseName.includes("/")) {
    throw new Error("DATABASE_URL must include an unambiguous PostgreSQL host and database name.");
  }
  for (const parameter of parsed.searchParams.keys()) {
    if (!REVIEWED_CONNECTION_PARAMETERS.has(parameter.toLowerCase())) {
      throw new Error(`DATABASE_URL parameter ${parameter} is not reviewed and may redirect the database destination.`);
    }
  }
  return parsed;
}

function isProductionSupabase(parsed: URL): boolean {
  const host = parsed.hostname.toLowerCase();
  const identity = [decodeURIComponent(parsed.username), host, decodeURIComponent(parsed.pathname)].join("/");
  return identity.includes(PRODUCTION_SUPABASE_PROJECT) || host.endsWith(".supabase.com") || host.endsWith(".supabase.co");
}

export function assertNoDatasourceOverride(args: readonly string[]): void {
  for (const arg of args) {
    if (["--url", "--db", "--config"].includes(arg) || ["--url=", "--db=", "--config="].some((prefix) => arg.startsWith(prefix))) {
      throw new Error(`Datasource override ${arg.split("=")[0]} is not allowed for guarded database mutations.`);
    }
  }
}

export function validateMigrationTarget(input: {
  databaseUrl?: string;
  environment?: string;
  expectedHost?: string;
  expectedDatabase?: string;
  productionApproved?: string;
}): void {
  const environment = input.environment?.trim();
  if (!environment || !ENVIRONMENTS.has(environment)) {
    throw new Error("DATABASE_ENV must be explicitly set to ci, staging, or production before database mutations.");
  }
  if (!input.expectedHost?.trim() || !input.expectedDatabase?.trim()) {
    throw new Error("DATABASE_EXPECTED_HOST and DATABASE_EXPECTED_NAME are required before database mutations.");
  }
  const parsed = parseDatabaseUrl(input.databaseUrl ?? "");
  const databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (parsed.hostname !== input.expectedHost.trim() || databaseName !== input.expectedDatabase.trim()) {
    throw new Error("DATABASE_URL does not match the explicitly expected database target.");
  }
  if (environment === "production" && input.productionApproved !== "true") {
    throw new Error("Production database mutations require DATABASE_PRODUCTION_MIGRATION_APPROVED=true.");
  }
  if (environment !== "production" && isProductionSupabase(parsed)) {
    throw new Error("Non-production database mutations cannot target the production Supabase database.");
  }
}

export function validatePrismaMutationArgs(args: readonly string[], input: Parameters<typeof validateMigrationTarget>[0]): void {
  assertNoDatasourceOverride(args);
  validateMigrationTarget(input);
}
