#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
container="martin-rls-test-$$"
cleanup() { docker rm -f "$container" >/dev/null 2>&1 || true; }
trap cleanup EXIT
docker run --rm -d --name "$container" --user postgres --entrypoint /bin/sh "${RLS_TEST_IMAGE:-postgres:17}" -c 'initdb -D /tmp/rls-db -A trust >/dev/null && exec postgres -D /tmp/rls-db -k /tmp' >/dev/null
for i in $(seq 1 60); do
  if docker exec "$container" pg_isready -h /tmp -U postgres >/dev/null 2>&1; then break; fi
  sleep 1
done
psql_test() { docker exec -i "$container" psql -h /tmp -X -U postgres -v ON_ERROR_STOP=1 "$@"; }
# All model/implicit relation tables are represented without touching a real database.
node --input-type=module - <<'JS' | psql_test >/dev/null
import fs from 'node:fs';
const schema=fs.readFileSync('prisma/schema.prisma','utf8');
const sql=fs.readFileSync('prisma/migrations/20261117000000_secure_public_tables/migration.sql','utf8');
const models=[...schema.matchAll(/^model (\w+) \{/gm)].map(m=>m[1]);
for(const name of models) if(!sql.includes(`'${name}'`)) throw new Error(`Unprotected Prisma model ${name}`);
const names=[...sql.matchAll(/'([A-Za-z_][A-Za-z_0-9]*)'/g)].map(m=>m[1]).filter(n=>models.includes(n)||n.startsWith('_'));
console.log('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE trusted LOGIN BYPASSRLS; CREATE ROLE inherited_api;');
for(const name of new Set(names)) console.log(`CREATE TABLE public."${name}" (id int PRIMARY KEY, secret text); INSERT INTO public."${name}" VALUES (1, 'synthetic'); GRANT ALL ON public."${name}" TO PUBLIC, anon, authenticated, trusted; GRANT SELECT(secret) ON public."${name}" TO anon;`);
console.log(`ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY; CREATE POLICY existing_open_policy ON public."User" FOR ALL TO PUBLIC USING (true) WITH CHECK (true);`);
JS
migration=prisma/migrations/20261117000000_secure_public_tables/migration.sql
psql_test < "$migration" >/dev/null
psql_test < "$migration" >/dev/null
psql_test <<'SQL' >/dev/null
DO $$ DECLARE t record; r text; BEGIN
 FOR t IN SELECT oid,relname,relrowsecurity FROM pg_class WHERE relnamespace='public'::regnamespace AND relkind='r' LOOP
  ASSERT t.relrowsecurity, 'RLS missing';
  FOREACH r IN ARRAY ARRAY['anon','authenticated'] LOOP
   ASSERT NOT has_table_privilege(r,t.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN'), 'API privilege remains';
   ASSERT NOT has_any_column_privilege(r,t.oid,'SELECT,INSERT,UPDATE,REFERENCES'), 'Column grant remains';
  END LOOP;
 END LOOP;
END $$;
SET ROLE trusted;
SELECT * FROM public."User";
INSERT INTO public."User" VALUES (2,'trusted');
UPDATE public."User" SET secret='changed' WHERE id=2;
DELETE FROM public."User" WHERE id=2;
RESET ROLE;
-- Even an accidental re-grant and existing open policy must not defeat deny policy.
GRANT SELECT,INSERT,UPDATE,DELETE ON public."User" TO anon,authenticated;
SET ROLE anon;
DO $$ BEGIN ASSERT (SELECT count(*) FROM public."User")=0, 'Restrictive policy bypassed'; END $$;
UPDATE public."User" SET secret='bad';
DELETE FROM public."User";
RESET ROLE;
DO $$ BEGIN ASSERT (SELECT secret FROM public."User" WHERE id=1)='synthetic', 'API modified protected row'; END $$;
SET ROLE authenticated;
DO $$ BEGIN ASSERT (SELECT count(*) FROM public."User")=0, 'Restrictive policy bypassed'; END $$;
UPDATE public."User" SET secret='bad';
DELETE FROM public."User";
RESET ROLE;
DO $$ BEGIN ASSERT (SELECT secret FROM public."User" WHERE id=1)='synthetic', 'API modified protected row'; END $$;
SQL
for role in anon authenticated; do
 for statement in 'INSERT INTO public."User" VALUES (3, '\''bad'\'')' 'TRUNCATE public."User"'; do
  if printf 'SET ROLE %s; %s;\n' "$role" "$statement" | psql_test >/dev/null 2>&1; then
   echo "FAIL: $role could execute $statement" >&2; exit 1
  fi
 done
done
psql_test <<'SQL' >/dev/null
GRANT TRUNCATE ON public."User" TO inherited_api;
GRANT inherited_api TO anon;
SQL
if psql_test < "$migration" >/dev/null 2>&1; then
 echo 'FAIL: inherited TRUNCATE was accepted' >&2; exit 1
fi
psql_test <<'SQL' >/dev/null
REVOKE inherited_api FROM anon;
DROP TABLE public."FAQ";
SQL
psql_test < "$migration" >/dev/null
echo 'PASS: model coverage, absent tables, idempotence, grants/column grants, permissive policy defense, trusted access, API denial, inherited TRUNCATE fail-closed'
