#!/usr/bin/env bash
set -euo pipefail
export LC_ALL=C LANG=C
cd "$(dirname "$0")/.."
if [[ -f .env.local ]]; then echo "Refusing isolated test while .env.local exists in this worktree" >&2; exit 1; fi
root="$(mktemp -d /tmp/martin-finance-pg.XXXXXX)"
port=55481
cleanup() { if [[ -f "$root/server.log" ]]; then echo "Server diagnostic:"; tail -30 "$root/server.log"; fi; pg_ctl -D "$root/data" -m immediate -w stop >/dev/null 2>&1 || :; rm -rf "$root"; }
trap cleanup EXIT
if pg_isready -h 127.0.0.1 -p "$port" >/dev/null 2>&1; then echo "Port $port in use, refusing non-disposable database" >&2; exit 1; fi
initdb -D "$root/data" -U postgres -A trust --locale=C --encoding=UTF8 --no-instructions > "$root/init.log"
pg_ctl -D "$root/data" -l "$root/server.log" -o "-h 127.0.0.1 -p $port -k $root" -w start >/dev/null
psql_test() { psql -X -h 127.0.0.1 -p "$port" -U postgres -d postgres -v ON_ERROR_STOP=1 "$@"; }
psql_test -c 'CREATE ROLE anon;' -c 'CREATE ROLE authenticated;'
export DATABASE_URL="postgresql://postgres@127.0.0.1:${port}/postgres"
# This repository's historical migrations do not bootstrap an empty database.
# Recreate the exact committed baseline schema and its existing security rollout,
# then apply only this feature migration. No live DB connection is used.
# Pin the schema before customer-finance columns were introduced; HEAD already has them.
git show 0aa349d6e1a7c00a12d12be6d69a9d9652caa9ec:prisma/schema.prisma > "$root/baseline.prisma"
./node_modules/.bin/prisma db push --schema "$root/baseline.prisma"
psql_test < prisma/migrations/20261117000000_secure_public_tables/migration.sql
psql_test < prisma/migrations/20261120000000_customer_finance_workflows/migration.sql
psql_test < scripts/secure-client-finance-tables.sql
psql_test <<'SQL'
DO $$ DECLARE rel text; oid_ oid; role_name text; BEGIN
 FOR rel IN SELECT unnest(ARRAY['ServiceCatalogItem','InvoiceReminder']) LOOP
  oid_ := to_regclass(format('public.%I',rel));
  ASSERT oid_ IS NOT NULL, 'New table missing';
  ASSERT (SELECT relrowsecurity FROM pg_class WHERE oid=oid_), 'RLS disabled';
  FOREACH role_name IN ARRAY ARRAY['anon','authenticated'] LOOP
   ASSERT NOT has_table_privilege(role_name,oid_,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'), 'Public API retains table privilege';
   ASSERT NOT has_any_column_privilege(role_name,oid_,'SELECT,INSERT,UPDATE,REFERENCES'), 'Public API retains column privilege';
  END LOOP;
 END LOOP;
 ASSERT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='Contact' AND column_name='address'), 'Contact address missing';
 ASSERT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='Booking' AND column_name='contactId'), 'Booking contact link missing';
 ASSERT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='Booking_contactId_fkey'), 'Foreign key missing';
END $$;
INSERT INTO "Contact" (id,name,email,"createdAt","updatedAt") VALUES ('test-contact','Synthetic Customer','test@example.invalid',now(),now());
INSERT INTO "ServiceCatalogItem" (id,name,price,"createdAt","updatedAt") VALUES ('test-service','Computer service',250,now(),now());
SQL
for role in anon authenticated; do
 if printf 'SET ROLE %s; SELECT * FROM "ServiceCatalogItem";\n' "$role" | psql_test >/dev/null 2>&1; then echo "FAIL: $role can read private table" >&2; exit 1; fi
done
printf 'PASS isolated local PostgreSQL migration and API-role security\n'
