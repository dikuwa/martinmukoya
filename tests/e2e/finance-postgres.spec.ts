import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./admin-auth";

async function query<T extends Record<string, unknown>>(text: string, values: unknown[] = []) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try { return (await client.query<T>(text, values)).rows; } finally { await client.end(); }
}

test.setTimeout(120_000);

test.beforeEach(async ({ page, baseURL }) => {
  // These tests create synthetic data and inspect the same disposable database as the app.
  expect(new URL(baseURL!).hostname).toMatch(/^(localhost|127\.0\.0\.1)$/);
  expect(new URL(process.env.DATABASE_URL!).hostname).toMatch(/^(localhost|127\.0\.0\.1)$/);
  expect(process.env.E2E_CONCURRENT_TRANSACTIONS).toBe("true");
  await loginAsAdmin(page);
});

test("concurrent invoice payments and reversals leave one void receipt and restore the balance", async ({ page }) => {
  const [site] = await query<{ id: string }>('SELECT id FROM "Site" WHERE slug = $1', ["flextech-media"]);
  const fixture = `Synthetic invoice ${randomUUID()}`;
  const booking = await page.request.post("/api/admin/bookings", { data: {
    siteId: site.id, customerName: fixture, projectDescription: fixture,
  } });
  expect(booking.status()).toBe(201);
  const bookingId = (await booking.json()).id;
  const draft = await page.request.post("/api/admin/documents", { data: {
    bookingId, customerName: fixture, type: "INVOICE",
    lines: [{ description: "Synthetic service", quantity: 1, unitPrice: "100" }],
  } });
  expect(draft.status()).toBe(201);
  const invoiceId = (await draft.json()).id;
  await expect(await page.request.post(`/api/admin/documents/${invoiceId}/issue`)).toBeOK();

  const submit = () => page.request.post("/api/admin/payments", {
    data: { invoiceId, amount: "60", method: "CASH" },
  });
  const payments = await Promise.all([submit(), submit()]);
  expect(payments.map(response => response.status()).sort()).toEqual([201, 409]);
  const payment = await payments.find(response => response.status() === 201)!.json();
  expect(Number((await query<{ count: string }>('SELECT COUNT(*)::text AS count FROM "Payment" WHERE "invoiceId" = $1', [invoiceId]))[0].count)).toBe(1);
  expect((await query<{ status: string; "siteId": string }>('SELECT status, "siteId" FROM "FinancialDocument" WHERE id = $1', [invoiceId]))[0]).toMatchObject({ status: "PARTIALLY_PAID", siteId: site.id });

  const reverse = () => page.request.post(`/api/admin/payments/${payment.id}/reverse`);
  const reversals = await Promise.all([reverse(), reverse()]);
  expect(reversals.map(response => response.status()).sort()).toEqual([200, 409]);
  expect(await reversals.find(response => response.status() === 200)!.json()).toEqual({ reversed: true });
  const reversed = (await query<{ "reversedAt": Date | null; "siteId": string }>('SELECT "reversedAt", "siteId" FROM "Payment" WHERE id = $1', [payment.id]))[0];
  expect(reversed).toMatchObject({ reversedAt: expect.anything(), siteId: site.id });
  const receipt = (await query<{ id: string; status: string; "siteId": string; "shareRevokedAt": Date | null }>('SELECT id, status, "siteId", "shareRevokedAt" FROM "FinancialDocument" WHERE "bookingId" = $1 AND type = $2', [bookingId, "RECEIPT"]));
  expect(receipt).toMatchObject([{ id: payment.receiptDocumentId, status: "VOID", siteId: site.id, shareRevokedAt: expect.anything() }]);
  expect((await query<{ status: string }>('SELECT status FROM "FinancialDocument" WHERE id = $1', [invoiceId]))[0]).toMatchObject({ status: "ISSUED" });
});

test("duplicate customer submissions and concurrent lead conversion preserve one shared customer", async ({ page }) => {
  const [site] = await query<{ id: string }>('SELECT id FROM "Site" WHERE slug = $1', ["martin-mukoya"]);
  const email = `synthetic-${randomUUID()}@example.invalid`;
  const submit = () => page.request.post("/api/admin/customers", {
    data: { name: "Synthetic PostgreSQL customer", email },
  });
  const customers = await Promise.all([submit(), submit()]);
  expect(customers.map(response => response.status()).sort()).toEqual([201, 409]);
  const customer = await customers.find(response => response.status() === 201)!.json();
  expect(await customers.find(response => response.status() === 409)!.json()).toMatchObject({
    existingId: customer.id,
  });
  expect(await query('SELECT id FROM "Contact" WHERE LOWER(email) = LOWER($1)', [email])).toEqual([{ id: customer.id }]);

  const lead = await page.request.post("/api/admin/leads", { data: {
    name: "Synthetic PostgreSQL lead", email: email.toUpperCase(),
    siteId: site.id, projectGoal: "Synthetic conversion",
  } });
  expect(lead.status()).toBe(201);
  const leadId = (await lead.json()).id;
  const convert = () => page.request.post("/api/admin/bookings/from-lead", { data: { leadId } });
  const bookings = await Promise.all([convert(), convert()]);
  expect(bookings.map(response => response.status())).toEqual([201, 201]);
  const [first, second] = await Promise.all(bookings.map(response => response.json()));
  expect(second.id).toBe(first.id);
  expect(await query('SELECT id, "contactId", "siteId" FROM "Booking" WHERE "leadId" = $1', [leadId])).toEqual([{ id: first.id, contactId: customer.id, siteId: site.id }]);
  expect(Number((await query<{ count: string }>('SELECT COUNT(*)::text AS count FROM "Contact" WHERE LOWER(email) = LOWER($1)', [email]))[0].count)).toBe(1);
});

test("concurrent payment retries with one idempotency key create one payment", async ({ page }) => {
  const [site] = await query<{ id: string }>('SELECT id FROM "Site" WHERE slug = $1', ["flextech-media"]);
  const fixture = `Synthetic idempotent invoice ${randomUUID()}`;
  const booking = await page.request.post("/api/admin/bookings", { data: { siteId: site.id, customerName: fixture, projectDescription: fixture } });
  expect(booking.status()).toBe(201);
  const bookingId = (await booking.json()).id;
  const draft = await page.request.post("/api/admin/documents", { data: { bookingId, customerName: fixture, type: "INVOICE", lines: [{ description: "Synthetic service", quantity: 1, unitPrice: "100" }] } });
  expect(draft.status()).toBe(201);
  const invoiceId = (await draft.json()).id;
  await expect(await page.request.post(`/api/admin/documents/${invoiceId}/issue`)).toBeOK();
  const idempotencyKey = `e2e-${randomUUID()}`;
  const payload = { invoiceId, amount: "60", method: "CASH", paidAt: "2026-11-01T08:00:00Z", reference: "fixture-reference", notes: "fixture-notes" };
  const submit = (data: Partial<typeof payload> & { idempotencyKey?: string } = {}) => page.request.post("/api/admin/payments", {
    headers: { "Idempotency-Key": idempotencyKey },
    data: { ...payload, ...data },
  });
  const responses = await Promise.all([submit(), submit({ amount: "60.00", paidAt: "2026-11-01T10:00:00+02:00", idempotencyKey })]);
  expect(responses.map(response => response.status()).sort()).toEqual([201, 201]);
  const payments = await Promise.all(responses.map(response => response.json()));
  expect(payments[1]).toMatchObject({ id: payments[0].id, receiptDocument: { id: payments[0].receiptDocumentId } });
  expect(payments[0]).not.toHaveProperty("idempotencyFingerprint");

  for (const change of [{ amount: "61" }, { method: "CARD" }, { paidAt: undefined }, { reference: "changed" }, { notes: "changed" }]) {
    const conflict = await submit(change);
    expect(conflict.status()).toBe(409);
    expect(await conflict.json()).toEqual({ error: "This idempotency key is already in use for another payment request." });
  }
  expect((await submit({ idempotencyKey: `e2e-${randomUUID()}` })).status()).toBe(400);
  expect((await submit({ paidAt: "invalid" })).status()).toBe(400);
  const depositWithInvoiceKey = await page.request.post("/api/admin/payments", {
    data: { ...payload, invoiceId: undefined, bookingId, idempotencyKey },
  });
  expect(depositWithInvoiceKey.status()).toBe(409);
  expect(await query('SELECT id FROM "Payment" WHERE "invoiceId" = $1', [invoiceId])).toEqual([{ id: payments[0].id }]);
  expect(await query('SELECT id FROM "FinancialDocument" WHERE "bookingId" = $1 AND type = $2', [bookingId, "RECEIPT"])).toEqual([{ id: payments[0].receiptDocumentId }]);

  await query('UPDATE "Payment" SET "idempotencyFingerprint" = NULL WHERE id = $1', [payments[0].id]);
  expect((await submit()).status()).toBe(409);
});

test("concurrent deposits for different business identities cannot reuse a payment key", async ({ page }) => {
  const sites = await query<{ id: string }>('SELECT id FROM "Site" WHERE slug IN ($1, $2)', ["flextech-media", "martin-mukoya"]);
  expect(sites).toHaveLength(2);
  const bookingIds = await Promise.all(sites.map(async ({ id: siteId }) => {
    const fixture = `Synthetic deposit ${randomUUID()}`;
    const booking = await page.request.post("/api/admin/bookings", {
      data: { siteId, customerName: fixture, projectDescription: fixture, contractAmount: "100" },
    });
    expect(booking.status()).toBe(201);
    return (await booking.json()).id as string;
  }));
  const idempotencyKey = `e2e-${randomUUID()}`;
  const submit = (bookingId: string, paidAt?: string) => page.request.post("/api/admin/payments", {
    data: { bookingId, amount: "60", method: "CASH", idempotencyKey, paidAt },
  });
  const responses = await Promise.all(bookingIds.map(id => submit(id)));
  expect(responses.map(response => response.status()).sort()).toEqual([201, 409]);
  const winner = responses.findIndex(response => response.status() === 201);
  const payment = await responses[winner].json();
  expect(payment).toMatchObject({ bookingId: bookingIds[winner], siteId: sites[winner].id });
  expect(await responses[1 - winner].json()).toEqual({ error: "This idempotency key is already in use for another payment request." });

  const replay = await submit(bookingIds[winner]);
  expect(replay.status()).toBe(201);
  expect(await replay.json()).toMatchObject({ id: payment.id, receiptDocument: { id: payment.receiptDocumentId } });
  expect((await submit(bookingIds[winner], payment.paidAt)).status()).toBe(409);
  expect(await query('SELECT id FROM "Payment" WHERE "bookingId" IN ($1, $2)', bookingIds)).toEqual([{ id: payment.id }]);
  expect(await query('SELECT id FROM "FinancialDocument" WHERE "bookingId" IN ($1, $2) AND type = $3', [...bookingIds, "RECEIPT"])).toEqual([{ id: payment.receiptDocumentId }]);
});
