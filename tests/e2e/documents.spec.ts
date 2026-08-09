import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./admin-auth";

test.setTimeout(120_000);

test.describe("Public shared document view", () => {
  test("should show not-found page for invalid share code", async ({ page }) => {
    await page.goto("/d/nonexistent-test-code", { waitUntil: "load" });
    // The page may return 200 with the shared not-found UI (both not-found.tsx and
    // SharedDocumentPage's notFound() render "Page not found" as an h1)
    await expect(page.locator("h1:has-text(\"Page not found\")")).toBeVisible({ timeout: 10000 });
    // Also verify the 404 indicator is present
    await expect(page.locator("text=404")).toBeVisible();
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
  test("should create a business document, preview it, and share it", async ({ page }) => {
    // ── Step 1: Login, then navigate separately (more reliable than login redirect) ──
    await loginAsAdmin(page);
    await page.goto("/admin/business-documents/new", { waitUntil: "networkidle" });

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

    await page.screenshot({ path: "test-results/e2e/composer-filled.png", fullPage: true });
    await saveBtn.click();
    await page.waitForURL(/\/admin\/business-documents\/(?!new)/, { timeout: 30000 });
    await page.waitForSelector("article", { timeout: 15000 });

    // ── Step 2: Verify preview ──
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

    // ── Step 3: Create share link via API and verify public view ──
    const currentUrl = page.url();
    const docId = currentUrl.match(/\/admin\/business-documents\/([a-zA-Z0-9]+)/)?.[1];
    if (!docId) throw new Error(`Could not extract document ID from URL: ${currentUrl}`);

    console.log(`Creating share link for document: ${docId}`);

    // Call the share API from within the browser (authenticated via session cookie)
    const shareResult = await page.evaluate(async (id) => {
      const res = await fetch("/api/admin/shared-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: id, documentType: "business" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Share API returned ${res.status}`);
      }
      return res.json();
    }, docId);

    console.log(`Share link created: ${JSON.stringify(shareResult)}`);
    expect(shareResult.shortCode).toBeDefined();
    expect(typeof shareResult.shortCode).toBe("string");

    // Register console listener BEFORE navigation to catch load-time errors
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    // Navigate to the public shared view
    await page.goto(`/d/${shareResult.shortCode}`, { waitUntil: "load" });
    console.log(`Public view URL: ${page.url()}`);

    // Verify the public view renders correctly
    const publicArticle = page.locator("article").first();
    await expect(publicArticle).toBeVisible({ timeout: 15000 });
    await expect(publicArticle.locator("p:has-text(\"TO\")").first()).toBeVisible();
    await expect(publicArticle.locator("p:has-text(\"PROPOSAL\")")).toBeVisible();

    await page.screenshot({ path: "test-results/e2e/public-document-view.png" });
    expect(consoleErrors.length).toBe(0);
  });

  test("should download PDF for a draft business document", async ({ page }) => {
    // Login first, then navigate to the new document page separately
    await loginAsAdmin(page);

    // Navigate directly to the new document page (more reliable than login redirect)
    await page.goto("/admin/business-documents/new", { waitUntil: "networkidle" });

    const titleInput = page.locator('input[placeholder*="e.g."]');
    await expect(titleInput).toBeVisible({ timeout: 30000 });
    await titleInput.fill("PDF Test Document");
    await page.locator('label:has-text("Recipient name")').locator("input").fill("PDF Client");
    await page.locator('label:has-text("Email")').first().locator("input").fill("pdf@example.com");

    const saveBtn = page.locator('button:has-text("Create draft")');
    await expect(saveBtn).toBeVisible({ timeout: 10000 });
    await saveBtn.click();
    await page.waitForURL(/\/admin\/business-documents\/(?!new)/, { timeout: 30000 });

    // Now on the detail page — use fetch to verify the PDF API works
    // Extract the document ID from the URL
    const currentUrl = page.url();
    const docId = currentUrl.match(/\/admin\/business-documents\/([a-zA-Z0-9]+)/)?.[1];
    if (!docId) throw new Error(`Could not extract document ID from URL: ${currentUrl}`);

    console.log(`Verifying PDF download for document: ${docId}`);

    // Fetch the PDF via the API (authenticated via session cookie)
    const pdfResult = await page.evaluate(async (id) => {
      const res = await fetch(`/api/admin/business-documents/${id}/pdf`);
      if (!res.ok) {
        throw new Error(`PDF API returned ${res.status}: ${await res.text().catch(() => "")}`);
      }
      // Check response headers
      const contentType = res.headers.get("content-type") || "";
      const contentDisposition = res.headers.get("content-disposition") || "";

      // Read the response body as ArrayBuffer and check the header
      const buffer = await res.arrayBuffer();
      const uint8 = new Uint8Array(buffer);

      return {
        contentType,
        contentDisposition,
        size: buffer.byteLength,
        startsWithPdf: uint8[0] === 0x25 && uint8[1] === 0x50 && uint8[2] === 0x44 && uint8[3] === 0x46, // %PDF
        headerBytes: Array.from(uint8.slice(0, 8)).map(b => b.toString(16).padStart(2, "0")).join(" "),
      };
    }, docId);

    console.log(`PDF result: ${JSON.stringify(pdfResult)}`);

    // Verify the PDF response is correct
    expect(pdfResult.contentType).toContain("application/pdf");
    expect(pdfResult.contentDisposition).toContain(".pdf");
    expect(pdfResult.contentDisposition).toContain("attachment");
    expect(pdfResult.startsWithPdf).toBe(true);
    expect(pdfResult.size).toBeGreaterThan(500);

    // Also verify the Download PDF link exists on the page
    const pdfLink = page.locator('a[href*="/pdf"]');
    await expect(pdfLink).toBeVisible({ timeout: 5000 });
    const pdfHref = await pdfLink.getAttribute("href");
    expect(pdfHref).toContain(docId);
    expect(pdfHref).toContain("/pdf");
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
