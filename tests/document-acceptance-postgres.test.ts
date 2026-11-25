import { randomUUID } from "node:crypto";
import { Client } from "pg";
import assert from "node:assert/strict";
import test from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { db } from "../src/lib/db";
import { acceptDocument, AcceptanceConflict } from "../src/lib/document-acceptance";

const url = process.env.ACCEPTANCE_TEST_DATABASE_URL ?? (process.env.CI === "true" ? process.env.DATABASE_URL : undefined);
if (url) {
  assert.match(new URL(url).hostname, /^(localhost|127\.0\.0\.1)$/);
  assert.match(new URL(url).pathname, /^\/(test|acceptance_fixture)$/);
  process.env.DATABASE_URL = url;
  process.env.E2E_CONCURRENT_TRANSACTIONS = "true";
}

async function fixture(kind: "financial" | "business"): Promise<{ kind: "financial" | "business"; id: string; shortCode: string }> {
  const id = randomUUID();
  const shortCode = randomUUID();
  if (kind === "financial") {
    const site = await db.site.create({ data: { slug: id, name: "Acceptance fixture", aliases: [] } });
    const booking = await db.booking.create({ data: { number: id, siteId: site.id, customerName: "Fixture", projectDescription: "Acceptance test" } });
    await db.financialDocument.create({ data: { id, siteId: site.id, bookingId: booking.id, type: "QUOTE", status: "ISSUED", customerName: "Fixture", issuerSnapshot: {} } });
  } else {
    await db.businessDocument.create({ data: { id, title: "Acceptance fixture", documentType: "PROPOSAL", status: "SENT" } });
  }
  await db.sharedDocument.create({ data: { shortCode, documentType: kind, ...(kind === "financial" ? { financialDocumentId: id } : { businessDocumentId: id }) } });
  return { kind, id, shortCode };
}

for (const kind of ["financial", "business"] as const) {
  test(`concurrent public ${kind} acceptance preserves exactly one signer's complete record`, { skip: !url }, async () => {
    const target = await fixture(kind);
    const signers = ["Alice", "Bob"].map((name, i) => ({ name, comment: `comment-${i}`, ip: `192.0.2.${i + 1}`, userAgent: `agent-${i}` }));
    const gate = new Client({ connectionString: process.env.DATABASE_URL });
    await gate.connect();
    let attempts: Promise<PromiseSettledResult<Awaited<ReturnType<typeof acceptDocument>>>[]>;
    try {
      await gate.query("BEGIN");
      await gate.query('SELECT id FROM "SharedDocument" WHERE "shortCode" = $1 FOR UPDATE', [target.shortCode]);
      attempts = Promise.allSettled(signers.map(signer => acceptDocument(target, signer)));
      // Prove both PostgreSQL sessions reached the write before releasing the fixture lock.
      const deadline = Date.now() + 4000;
      for (;;) {
        await gate.query("SELECT pg_stat_clear_snapshot()");
        const waiting = await gate.query("SELECT count(*) FROM pg_stat_activity WHERE datname = current_database() AND wait_event_type = 'Lock' AND query LIKE '%UPDATE%SharedDocument%'");
        if (Number(waiting.rows[0].count) === 2) break;
        assert.ok(Date.now() < deadline, "Both acceptance transactions must reach the locked share");
        await delay(25);
      }
    } finally {
      await gate.query("ROLLBACK");
      await gate.end();
    }
    const results = await attempts;
    assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
    const winner = results.findIndex(result => result.status === "fulfilled");
    const loser = results[1 - winner];
    assert.ok(loser.status === "rejected" && loser.reason instanceof AcceptanceConflict);
    await assert.rejects(acceptDocument(target, signers[1 - winner]), AcceptanceConflict);
    const signer = signers[winner];
    const share = await db.sharedDocument.findUniqueOrThrow({ where: { shortCode: target.shortCode } });
    assert.ok(share.acceptedAt instanceof Date);
    assert.deepEqual([share.acceptedName, share.acceptedComment, share.acceptedIp, share.acceptedUserAgent], [signer.name, signer.comment, signer.ip, signer.userAgent]);
    if (kind === "financial") {
      const doc = await db.financialDocument.findUniqueOrThrow({ where: { id: target.id } });
      assert.deepEqual([doc.status, doc.acceptedName, doc.acceptedAt], ["ACCEPTED", signer.name, share.acceptedAt]);
      assert.deepEqual(await db.notification.findMany({ where: { type: "quote_accepted", sourceId: target.id }, select: { detail: true } }), [{ detail: `Accepted by ${signer.name}` }]);
    } else {
      const doc = await db.businessDocument.findUniqueOrThrow({ where: { id: target.id } });
      assert.deepEqual([doc.status, doc.acceptedAt], ["ACCEPTED", share.acceptedAt]);
      assert.deepEqual(await db.businessDocumentAuditLog.findMany({ where: { documentId: target.id, action: "ACCEPTED" }, select: { detail: true } }), [{ detail: `Accepted by ${signer.name}` }]);
    }
  });
}

test("notification failure rolls back both quote and share, leaving acceptance retryable", { skip: !url }, async () => {
  const target = await fixture("financial");
  const duplicate = await db.notification.create({ data: { type: "quote_accepted", sourceId: target.id, title: "Synthetic conflict", detail: "", href: "/" } });
  await assert.rejects(acceptDocument(target, { name: "First" }), { code: "P2002" });
  const doc = await db.financialDocument.findUniqueOrThrow({ where: { id: target.id } });
  const share = await db.sharedDocument.findUniqueOrThrow({ where: { shortCode: target.shortCode } });
  assert.deepEqual([doc.status, doc.acceptedAt, doc.acceptedName, share.acceptedAt, share.acceptedName], ["ISSUED", null, null, null, null]);
  await db.notification.delete({ where: { id: duplicate.id } });
  assert.equal((await acceptDocument(target, { name: "Retry" })).status, "ACCEPTED");
});
