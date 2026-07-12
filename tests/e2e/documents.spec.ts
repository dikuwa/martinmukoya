import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./admin-auth";

test.setTimeout(120_000);

test.describe("Public shared document view", () => {
  test("should show not-found page for invalid share code", async ({ page }) => {
    const response = await page.goto("/d/nonexistent-test-code", { waitUntil: "load" });
    // The page may return 200 with a "not found" UI instead of a 404 HTTP status
    const bodyText = await page.evaluate(() => document.body?.innerText || "");
    const isNotFound = response?.status() === 404 || bodyText.toLowerCase().includes("not found");
    expect(isNotFound).toBe(true);
  });
});

test.describe("Admin login page", () => {
  test("should show login form when accessing admin without auth", async ({ page }) => {
    await page.goto("/admin", { waitUntil: "load" });
    expect(page.url()).toContain("/auth/sign-in");
    await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[name="password"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });
});

test.describe("Business documents", () => {
  test("should create a business document and show full preview", async ({ page }) => {
    // Login with redirect-to-target approach + notification API blocking
    await loginAsAdmin(page, "/admin/business-documents/new");
    console.log(`URL after login: ${page.url()}`);

    // Debug: check page state
    const htmlLen = await page.evaluate(() => document.body?.innerHTML?.length || 0);
    console.log(`Body HTML length: ${htmlLen}`);

    // Verify we're on the right page
    if (!page.url().includes("/admin/business-documents/new")) {
      throw new Error(`Expected new document page but got: ${page.url()}`);
    }

    // Wait for the form to render (notification API is now blocked)
    const titleInput = page.locator('input[placeholder*="e.g."]');
    await expect(titleInput).toBeVisible({ timeout: 30000 });

    await titleInput.fill("E2E Test Proposal");

    // Fill recipient name
    await page.locator('label:has-text("Recipient name")').locator("input").fill("Test Client");
    await page.locator('label:has-text("Email")').first().locator("input").fill("test@example.com");

    // Save as draft
    const saveBtn = page.locator('button:has-text("Create draft")');
    if (!(await saveBtn.isVisible().catch(() => false))) {
      throw new Error("Create draft button not visible");
    }

    // Take a screenshot before saving
    await page.screenshot({ path: "test-results/e2e/composer-filled.png", fullPage: true });

    await saveBtn.click();
    await page.waitForURL(/\/admin\/business-documents\/(?!new)/, { timeout: 30000 });
    await page.waitForSelector("article", { timeout: 15000 });

    // Verify preview — use specific selectors to avoid strict-mode conflicts
    const article = page.locator("article").first();
    await expect(article).toBeVisible({ timeout: 10000 });
    await expect(article.locator('img[alt=""]')).toBeVisible();
    await expect(article.locator("header img").first()).toBeVisible();
    await expect(article.locator("p:has-text(\"CONTACT\")")).toBeVisible();
    await expect(article.locator("p:has-text(\"TO\")").first()).toBeVisible();
    await expect(article.locator("p:has-text(\"DATE\")")).toBeVisible();
    await expect(article.locator("p:has-text(\"PROPOSAL\")")).toBeVisible();
    expect(await article.locator("hr").count()).toBeGreaterThanOrEqual(2);

    await article.screenshot({ path: "test-results/e2e/business-document-preview.png" });
  });
});

test.describe("Homepage", () => {
  test("should load successfully", async ({ page }) => {
    const response = await page.goto("/", { waitUntil: "load" });
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: "test-results/e2e/homepage.png", fullPage: true });
  });
});
