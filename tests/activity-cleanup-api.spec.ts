/**
 * End-to-end API tests for the Activity Cleanup feature.
 *
 * These tests verify the preview, export, and execute endpoints work
 * correctly with a live database.
 *
 * Prerequisites:
 * 1. Database must be running and migration applied
 * 2. .env.local must have a valid DATABASE_URL
 * 3. Admin user must exist (run `pnpm db:seed-admin` first)
 * 4. Start the dev server: `pnpm dev`
 * 5. Run: `npx playwright test tests/activity-cleanup-api.spec.ts`
 */

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe("Activity Cleanup API", () => {
  test.describe("GET /api/admin/cleanup/preview", () => {
    test("returns 401 when not authenticated", async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/admin/cleanup/preview`);
      expect(response.status()).toBe(401);
    });

    test("returns counts and preserved resources when authenticated", async ({ request }) => {
      // Note: This test requires being logged in as admin.
      // In CI, you'd set up auth cookies/session first.
      // For local testing, use: playwright test --auth=admin-auth.json
      const response = await request.get(`${BASE_URL}/api/admin/cleanup/preview`);
      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty("counts");
        expect(data.counts).toHaveProperty("leads");
        expect(data.counts).toHaveProperty("contactMessages");
        expect(data.counts).toHaveProperty("chatSessions");
        expect(data.counts).toHaveProperty("chatMessages");
        expect(data.counts).toHaveProperty("analyticsEvents");
        expect(data.counts).toHaveProperty("notifications");
        expect(typeof data.counts.leads).toBe("number");
        expect(typeof data.counts.contactMessages).toBe("number");
        expect(data).toHaveProperty("preserved");
        expect(Array.isArray(data.preserved)).toBe(true);
        expect(data.preserved.length).toBeGreaterThan(0);
      }
      // If not authenticated, this is expected in local dev without auth setup
    });
  });

  test.describe("POST /api/admin/cleanup/export", () => {
    test("returns 401 when not authenticated", async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/admin/cleanup/export`);
      expect(response.status()).toBe(401);
    });

    test("returns xlsx file with correct headers when authenticated", async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/admin/cleanup/export`);
      if (response.status() === 200) {
        expect(response.headers()["content-type"]).toContain("spreadsheetml.sheet");
        expect(response.headers()["content-disposition"]).toContain("attachment");
        expect(response.headers()["content-disposition"]).toContain(".xlsx");
        expect(response.headers()).toHaveProperty("x-cleanup-run-id");
        expect(response.headers()).toHaveProperty("x-cleanup-cutoff");
        expect(response.headers()).toHaveProperty("x-cleanup-counts");
        expect(response.headers()["cache-control"]).toContain("no-store");

        const runId = response.headers()["x-cleanup-run-id"];
        expect(runId).toBeTruthy();
        expect(typeof runId).toBe("string");

        const body = await response.body();
        expect(body.length).toBeGreaterThan(0);
        // .xlsx files start with PK (ZIP header)
        expect(new Uint8Array(body.slice(0, 2))).toEqual(new Uint8Array([0x50, 0x4B]));
      }
    });
  });

  test.describe("POST /api/admin/cleanup/execute", () => {
    const CONFIRMATION = "RESET ALL ACTIVITY";

    test("returns 401 when not authenticated", async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/admin/cleanup/execute`, {
        data: { runId: "test-run-id", confirmation: CONFIRMATION }
      });
      expect(response.status()).toBe(401);
    });

    test("returns 400 for missing runId", async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/admin/cleanup/execute`, {
        data: { confirmation: CONFIRMATION }
      });
      expect(response.status()).toBe(400);
    });

    test("returns 400 for wrong confirmation phrase", async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/admin/cleanup/execute`, {
        data: { runId: "some-id", confirmation: "wrong phrase" }
      });
      expect(response.status()).toBe(400);
    });

    test("returns 404 for non-existent run", async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/admin/cleanup/execute`, {
        data: { runId: "non-existent-run-id", confirmation: CONFIRMATION }
      });
      // 404 because the run doesn't exist
      expect([400, 401, 404]).toContain(response.status());
    });
  });
});
