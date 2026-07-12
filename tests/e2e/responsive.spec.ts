import { test, expect } from "@playwright/test";

test.setTimeout(60_000);

test.describe("Responsive layout", () => {
  const viewports = [
    { width: 375, height: 812, label: "mobile" },
    { width: 768, height: 1024, label: "tablet" },
    { width: 1280, height: 800, label: "desktop" },
  ];

  for (const vp of viewports) {
    test(`homepage renders without layout issues at ${vp.label} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize(vp);
      const response = await page.goto("/", { waitUntil: "networkidle" });
      expect(response?.status()).toBe(200);

      // Body is visible and has content
      const body = page.locator("body");
      await expect(body).toBeVisible({ timeout: 10000 });
      const text = await body.innerText();
      expect(text.length).toBeGreaterThan(50);

      // No horizontal scrollbar — page fits within viewport
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(vp.width + 5); // small tolerance for shadow DOM

      // At least one heading is present
      const headings = page.locator("h1, h2, h3");
      expect(await headings.count()).toBeGreaterThanOrEqual(1);

      await page.screenshot({
        path: `test-results/e2e/responsive-${vp.label}.png`,
        fullPage: true,
      });
    });
  }
});
