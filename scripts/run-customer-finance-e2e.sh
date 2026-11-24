#!/usr/bin/env bash
set -euo pipefail
export LC_ALL=C LANG=C
cd "$(dirname "$0")/.."
if [[ -f .env.local ]]; then echo "Refusing isolated test while .env.local exists in this worktree" >&2; exit 1; fi
root="$(mktemp -d /tmp/martin-finance-browser.XXXXXX)"
db_port=55482
app_port=3109
app_pid=""
cleanup() {
  if [[ -n "$app_pid" ]]; then kill "$app_pid" >/dev/null 2>&1 || :; fi
  pg_ctl -D "$root/data" -m immediate -w stop >/dev/null 2>&1 || :
  rm -rf "$root"
}
trap cleanup EXIT

if pg_isready -h 127.0.0.1 -p "$db_port" >/dev/null 2>&1; then
  echo "Database test port in use; refusing non-isolated execution" >&2
  exit 1
fi
if curl --silent --max-time 2 "http://localhost:$app_port/auth/sign-in" >/dev/null; then
  echo "Application test port already occupied; refusing to reuse it" >&2
  exit 1
fi
initdb -D "$root/data" -U postgres -A trust --locale=C --encoding=UTF8 --no-instructions > "$root/init.log"
pg_ctl -D "$root/data" -l "$root/postgres.log" -o "-h 127.0.0.1 -p $db_port -k $root" -w start >/dev/null
psql_test() { psql -X -h 127.0.0.1 -p "$db_port" -U postgres -d postgres -v ON_ERROR_STOP=1 "$@"; }
psql_test -c 'CREATE ROLE anon;' -c 'CREATE ROLE authenticated;' > /dev/null

export DATABASE_URL="postgresql://postgres@127.0.0.1:$db_port/postgres"
# The disposable database must start from the pre-finance baseline before migrations.
baseline_commit=0aa349d6e1a7c00a12d12be6d69a9d9652caa9ec
if ! git cat-file -e "$baseline_commit^{commit}" 2>/dev/null; then
  # CI checkout defaults to depth 1; fetch only the pinned historical commit.
  git fetch --quiet --no-tags --depth=1 origin "$baseline_commit"
fi
git show "$baseline_commit:prisma/schema.prisma" > "$root/baseline.prisma"
./node_modules/.bin/prisma db push --schema "$root/baseline.prisma"
psql_test < prisma/migrations/20261117000000_secure_public_tables/migration.sql > /dev/null
psql_test < prisma/migrations/20261120000000_customer_finance_workflows/migration.sql > /dev/null

export ADMIN_EMAIL="synthetic-admin@example.invalid"
export ADMIN_PASSWORD="synthetic-local-browser-test-only"
export BETTER_AUTH_SECRET="synthetic-browser-only-auth-secret-20261120"
export BETTER_AUTH_URL="http://localhost:$app_port"
export NEXT_PUBLIC_APP_URL="http://localhost:$app_port"
export BASE_URL="http://localhost:$app_port"

./node_modules/.bin/tsx prisma/seed-admin.ts
./node_modules/.bin/tsx scripts/seed-customer-finance-e2e.ts

./node_modules/.bin/next start -p "$app_port" > "$root/next.log" 2>&1 &
app_pid=$!
for i in $(seq 1 50); do
  if curl --silent --fail "http://localhost:$app_port/auth/sign-in" >/dev/null; then break; fi
  sleep 1
done
if ! curl --silent --fail "http://localhost:$app_port/auth/sign-in" >/dev/null; then
  tail -80 "$root/next.log"
  exit 1
fi
./node_modules/.bin/playwright test tests/e2e/customer-finance.spec.ts --reporter=line || {
  tail -90 "$root/next.log"
  exit 1
}
echo "PASS: synthetic customer-finance browser workflow"
