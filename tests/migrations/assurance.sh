#!/usr/bin/env bash
set -euo pipefail
export LC_ALL=C
cd "$(dirname "$0")/../.."

if [[ -e .env.local || -L .env.local || ! ${DATABASE_URL:-} =~ ^postgresql://[a-zA-Z0-9_:.-]+@127\.0\.0\.1:[0-9]+/migration_assurance$ ]]; then
  echo 'Use an empty disposable loopback database named migration_assurance and a checkout without .env.local.' >&2
  exit 1
fi
sql() { psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 "$@"; }
prisma() { ./node_modules/.bin/prisma "$@"; }
if [[ $(sql -Atc "SELECT count(*) FROM pg_class WHERE relnamespace = 'public'::regnamespace") != 0 ]]; then
  echo 'The migration assurance database must start empty.' >&2
  exit 1
fi

scratch=$(mktemp -d)
trap 'rm -r -- "$scratch"' EXIT
baseline=0aa349d6e1a7c00a12d12be6d69a9d9652caa9ec
if ! git cat-file -e "$baseline^{commit}" 2>/dev/null; then
  git fetch --quiet --no-tags --depth=1 origin "$baseline"
fi
git show "$baseline:prisma/schema.prisma" > "$scratch/baseline.prisma"
git ls-tree --name-only "$baseline:prisma/migrations" > "$scratch/history"

echo 'Reconstructing and populating the historical schema'
prisma migrate diff --from-empty --to-schema "$scratch/baseline.prisma" --script | sql -q
sql -q -f tests/migrations/baseline.sql
while IFS= read -r migration; do
  git show "$baseline:prisma/migrations/$migration/migration.sql" | cmp - "prisma/migrations/$migration/migration.sql"
  prisma migrate resolve --applied "$migration"
done < "$scratch/history"
sql -q -f prisma/migrations/20261117000000_secure_public_tables/migration.sql

# Freeze the pre-upgrade column projection so new columns cannot hide lost or changed values.
snapshot_queries() {
  sql -At <<'SQL'
SELECT format('SELECT %L, coalesce(jsonb_agg(to_jsonb(r) ORDER BY to_jsonb(r)), ''[]''::jsonb) FROM (SELECT %s FROM public.%I) AS r;',
              c.relname, string_agg(quote_ident(a.attname), ', ' ORDER BY a.attnum), c.relname)
FROM pg_class c JOIN pg_attribute a ON a.attrelid = c.oid
WHERE c.relnamespace = 'public'::regnamespace AND c.relkind = 'r'
  AND a.attnum > 0 AND NOT a.attisdropped
GROUP BY c.relname ORDER BY c.relname COLLATE "C";
SQL
}
snapshot_queries | sed '/^SELECT .*_prisma_migrations/d' > "$scratch/legacy.sql"
sql -Atf "$scratch/legacy.sql" > "$scratch/legacy.before"

echo 'Applying all pending migrations'
prisma migrate deploy
prisma migrate status
sql -Atf "$scratch/legacy.sql" > "$scratch/legacy.after"
diff -u "$scratch/legacy.before" "$scratch/legacy.after"
sql -q -f tests/migrations/verify.sql
prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code

for migration in prisma/migrations/*/migration.sql; do
  basename "$(dirname "$migration")"
done > "$scratch/expected-history"
sql -Atc 'SELECT migration_name FROM public."_prisma_migrations" WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL ORDER BY migration_name COLLATE "C"' > "$scratch/applied-history"
diff -u "$scratch/expected-history" "$scratch/applied-history"

echo 'Verifying a second deploy preserves rows, snapshots, and the migration ledger'
snapshot_queries > "$scratch/complete.sql"
sql -Atf "$scratch/complete.sql" > "$scratch/deploy.before"
prisma migrate deploy
prisma migrate status
snapshot_queries | diff -u "$scratch/complete.sql" -
sql -Atf "$scratch/complete.sql" > "$scratch/deploy.after"
diff -u "$scratch/deploy.before" "$scratch/deploy.after"
echo 'PASS: populated migration deploy, legacy preservation, schema and constraints, issuer snapshots, repeat deploy'
