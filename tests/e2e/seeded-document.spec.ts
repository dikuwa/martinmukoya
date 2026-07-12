import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./admin-auth";

test.setTimeout(120_000);

test.describe("Seeded business document", () => {
  const docUrl = "/admin/business-documents/e2e-test-biz-doc";

  test("navigates to existing document and verifies preview", async ({ page }) => {
    await loginAsAdmin(page, docUrl);

    // Wait for the article preview to render
    const article = page.locator("article").first();
    await expect(article).toBeVisible({ timeout: 15000 });

    // Verify key preview elements
    await expect(article.locator("img[alt=\"\"]")).toBeVisible();
    await expect(article.locator("p:has-text(\"CONTACT\")")).toBeVisible();
    await expect(article.locator("p:has-text(\"TO\")").first()).toBeVisible();
    await expect(article.locator("p:has-text(\"DATE\")")).toBeVisible();
    await expect(article.locator("p:has-text(\"PROPOSAL\")").first()).toBeVisible();

    // The document title should be visible
    await expect(page.locator("h1, h2").first()).toBeVisible();

    // Divider and bold content should be present
    expect(await article.locator("hr").count()).toBeGreaterThanOrEqual(1);
    const bodyText = await article.evaluate((el) => el.textContent || "");
    expect(bodyText).toContain("E2E Test Client");

    await page.screenshot({ path: "test-results/e2e/seeded-doc-preview.png" });
  });

  test("downloads PDF for existing document", async ({ page }) => {
    await loginAsAdmin(page, docUrl);

    // Wait for the PDF link to appear
    const pdfLink = page.locator('a[href*="/pdf"]');
    await expect(pdfLink).toBeVisible({ timeout: 15000 });

    // Fetch the PDF via the API (authenticated via session cookie)
    const pdfResult = await page.evaluate(async () => {
      const res = await fetch("/api/admin/business-documents/e2e-test-biz-doc/pdf");
      if (!res.ok) {
        throw new Error(`PDF API returned ${res.status}: ${await res.text().catch(() => "")}`);
      }
      const contentType = res.headers.get("content-type") || "";
      const contentDisposition = res.headers.get("content-disposition") || "";
      const buffer = await res.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      return {
        contentType,
        contentDisposition,
        size: buffer.byteLength,
        startsWithPdf: uint8[0] === 0x25 && uint8[1] === 0x50 && uint8[2] === 0x44 && uint8[3] === 0x46,
      };
    });

    expect(pdfResult.contentType).toContain("application/pdf");
    expect(pdfResult.contentDisposition).toContain(".pdf");
    expect(pdfResult.contentDisposition).toContain("attachment");
    expect(pdfResult.startsWithPdf).toBe(true);
    expect(pdfResult.size).toBeGreaterThan(500);

    console.log(`PDF: ${JSON.stringify(pdfResult)}`);
  });

  test("shares existing document and opens public view", async ({ page }) => {
    await loginAsAdmin(page, docUrl);

    // Wait for page to load
    await expect(page.locator("article").first()).toBeVisible({ timeout: 15000 });

    // Create (or reuse) a share link via the API.
    // SharedDocument.businessDocumentId has a @unique constraint, so the
    // POST may return 409 if a share already exists from a previous run.
    const shareResult = await page.evaluate(async () => {
      let shortCode: string | null = null;

      // Try creating a new share link
      const res = await fetch("/api/admin/shared-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: "e2e-test-biz-doc", documentType: "business" }),
      });

      if (res.ok) {
        const data = await res.json() as { shortCode: string };
        shortCode = data.shortCode;
      } else if (res.status === 409) {
        // Share already exists — fetch it from the public view via a fallback
        // The sidebar should show the existing share code on the page
        const sidebarText = document.body.innerText;
        const match = sidebarText.match(/\/d\/([a-zA-Z0-9]+)/);
        if (match) shortCode = match[1];
      }

      if (!shortCode) {
        throw new Error(`Could not create or find share link (API returned ${res.status})`);
      }
      return { shortCode };
    });

    expect(shareResult.shortCode).toBeDefined();
    expect(typeof shareResult.shortCode).toBe("string");

    // Register console listener before navigating
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    // Navigate to the public shared view
    await page.goto(`/d/${shareResult.shortCode}`, { waitUntil: "load" });

    // Verify the public view renders
    const publicArticle = page.locator("article").first();
    await expect(publicArticle).toBeVisible({ timeout: 15000 });
    await expect(publicArticle.locator("p:has-text(\"TO\")").first()).toBeVisible();

    await page.screenshot({ path: "test-results/e2e/seeded-doc-shared.png" });
    expect(consoleErrors.length).toBe(0);
  });
});
