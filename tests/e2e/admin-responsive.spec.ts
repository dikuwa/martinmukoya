import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./admin-auth";

test.setTimeout(120_000);

test.describe("Admin responsive layout", () => {
  const viewports = [
    { width: 375, height: 812, label: "mobile" },
    { width: 768, height: 1024, label: "tablet" },
    { width: 1280, height: 800, label: "desktop" },
  ];

  for (const vp of viewports) {
    test(`dashboard renders without layout issues at ${vp.label} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize(vp);
      await loginAsAdmin(page, "/admin");

      // Wait for the dashboard content to render
      await expect(page.locator("h1")).toBeVisible({ timeout: 20000 });
      const body = page.locator("body");
      await expect(body).toBeVisible();

      // Text content is present (dashboard has loaded data)
      const text = await body.innerText();
      expect(text.length).toBeGreaterThan(30);

      // No horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(vp.width + 5);

      await page.screenshot({
        path: `test-results/e2e/admin-dashboard-${vp.label}.png`,
        fullPage: true,
      });
    });

    test(`business documents list at ${vp.label} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize(vp);
      await loginAsAdmin(page, "/admin/business-documents");

      // Wait for the page to load
      await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 20000 });

      // No horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(vp.width + 5);

      // Filter form is visible (search input, type, status selects)
      await expect(page.locator('input[name="search"]')).toBeVisible();

      await page.screenshot({
        path: `test-results/e2e/admin-business-docs-${vp.label}.png`,
        fullPage: true,
      });
    });

    test(`financial documents list at ${vp.label} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize(vp);
      await loginAsAdmin(page, "/admin/documents");

      // Wait for the page to load
      await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 20000 });

      // No horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(vp.width + 5);

      // Filter form is present
      await expect(page.locator('input[name="search"]').first()).toBeVisible();

      await page.screenshot({
        path: `test-results/e2e/admin-financial-docs-${vp.label}.png`,
        fullPage: true,
      });
    });
  }
});
