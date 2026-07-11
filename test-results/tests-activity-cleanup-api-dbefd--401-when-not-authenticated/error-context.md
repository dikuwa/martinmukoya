# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/activity-cleanup-api.spec.ts >> Activity Cleanup API >> POST /api/admin/cleanup/export >> returns 401 when not authenticated
- Location: tests/activity-cleanup-api.spec.ts:51:9

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 401
Received: 500
```

# Test source

```ts
  1   | /**
  2   |  * End-to-end API tests for the Activity Cleanup feature.
  3   |  *
  4   |  * These tests verify the preview, export, and execute endpoints work
  5   |  * correctly with a live database.
  6   |  *
  7   |  * Prerequisites:
  8   |  * 1. Database must be running and migration applied
  9   |  * 2. .env.local must have a valid DATABASE_URL
  10  |  * 3. Admin user must exist (run `pnpm db:seed-admin` first)
  11  |  * 4. Start the dev server: `pnpm dev`
  12  |  * 5. Run: `npx playwright test tests/activity-cleanup-api.spec.ts`
  13  |  */
  14  | 
  15  | import { test, expect } from "@playwright/test";
  16  | 
  17  | const BASE_URL = "http://localhost:3000";
  18  | 
  19  | test.describe("Activity Cleanup API", () => {
  20  |   test.describe("GET /api/admin/cleanup/preview", () => {
  21  |     test("returns 401 when not authenticated", async ({ request }) => {
  22  |       const response = await request.get(`${BASE_URL}/api/admin/cleanup/preview`);
  23  |       expect(response.status()).toBe(401);
  24  |     });
  25  | 
  26  |     test("returns counts and preserved resources when authenticated", async ({ request }) => {
  27  |       // Note: This test requires being logged in as admin.
  28  |       // In CI, you'd set up auth cookies/session first.
  29  |       // For local testing, use: playwright test --auth=admin-auth.json
  30  |       const response = await request.get(`${BASE_URL}/api/admin/cleanup/preview`);
  31  |       if (response.status() === 200) {
  32  |         const data = await response.json();
  33  |         expect(data).toHaveProperty("counts");
  34  |         expect(data.counts).toHaveProperty("leads");
  35  |         expect(data.counts).toHaveProperty("contactMessages");
  36  |         expect(data.counts).toHaveProperty("chatSessions");
  37  |         expect(data.counts).toHaveProperty("chatMessages");
  38  |         expect(data.counts).toHaveProperty("analyticsEvents");
  39  |         expect(data.counts).toHaveProperty("notifications");
  40  |         expect(typeof data.counts.leads).toBe("number");
  41  |         expect(typeof data.counts.contactMessages).toBe("number");
  42  |         expect(data).toHaveProperty("preserved");
  43  |         expect(Array.isArray(data.preserved)).toBe(true);
  44  |         expect(data.preserved.length).toBeGreaterThan(0);
  45  |       }
  46  |       // If not authenticated, this is expected in local dev without auth setup
  47  |     });
  48  |   });
  49  | 
  50  |   test.describe("POST /api/admin/cleanup/export", () => {
  51  |     test("returns 401 when not authenticated", async ({ request }) => {
  52  |       const response = await request.post(`${BASE_URL}/api/admin/cleanup/export`);
> 53  |       expect(response.status()).toBe(401);
      |                                 ^ Error: expect(received).toBe(expected) // Object.is equality
  54  |     });
  55  | 
  56  |     test("returns xlsx file with correct headers when authenticated", async ({ request }) => {
  57  |       const response = await request.post(`${BASE_URL}/api/admin/cleanup/export`);
  58  |       if (response.status() === 200) {
  59  |         expect(response.headers()["content-type"]).toContain("spreadsheetml.sheet");
  60  |         expect(response.headers()["content-disposition"]).toContain("attachment");
  61  |         expect(response.headers()["content-disposition"]).toContain(".xlsx");
  62  |         expect(response.headers()).toHaveProperty("x-cleanup-run-id");
  63  |         expect(response.headers()).toHaveProperty("x-cleanup-cutoff");
  64  |         expect(response.headers()).toHaveProperty("x-cleanup-counts");
  65  |         expect(response.headers()["cache-control"]).toContain("no-store");
  66  | 
  67  |         const runId = response.headers()["x-cleanup-run-id"];
  68  |         expect(runId).toBeTruthy();
  69  |         expect(typeof runId).toBe("string");
  70  | 
  71  |         const body = await response.body();
  72  |         expect(body.length).toBeGreaterThan(0);
  73  |         // .xlsx files start with PK (ZIP header)
  74  |         expect(new Uint8Array(body.slice(0, 2))).toEqual(new Uint8Array([0x50, 0x4B]));
  75  |       }
  76  |     });
  77  |   });
  78  | 
  79  |   test.describe("POST /api/admin/cleanup/execute", () => {
  80  |     const CONFIRMATION = "RESET ALL ACTIVITY";
  81  | 
  82  |     test("returns 401 when not authenticated", async ({ request }) => {
  83  |       const response = await request.post(`${BASE_URL}/api/admin/cleanup/execute`, {
  84  |         data: { runId: "test-run-id", confirmation: CONFIRMATION }
  85  |       });
  86  |       expect(response.status()).toBe(401);
  87  |     });
  88  | 
  89  |     test("returns 400 for missing runId", async ({ request }) => {
  90  |       const response = await request.post(`${BASE_URL}/api/admin/cleanup/execute`, {
  91  |         data: { confirmation: CONFIRMATION }
  92  |       });
  93  |       expect(response.status()).toBe(400);
  94  |     });
  95  | 
  96  |     test("returns 400 for wrong confirmation phrase", async ({ request }) => {
  97  |       const response = await request.post(`${BASE_URL}/api/admin/cleanup/execute`, {
  98  |         data: { runId: "some-id", confirmation: "wrong phrase" }
  99  |       });
  100 |       expect(response.status()).toBe(400);
  101 |     });
  102 | 
  103 |     test("returns 404 for non-existent run", async ({ request }) => {
  104 |       const response = await request.post(`${BASE_URL}/api/admin/cleanup/execute`, {
  105 |         data: { runId: "non-existent-run-id", confirmation: CONFIRMATION }
  106 |       });
  107 |       // 404 because the run doesn't exist
  108 |       expect([400, 401, 404]).toContain(response.status());
  109 |     });
  110 |   });
  111 | });
  112 | 
```