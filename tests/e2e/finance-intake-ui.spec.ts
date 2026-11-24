import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./admin-auth";

test.use({ channel: "chrome" });
test.setTimeout(180_000);

test("manual referral booking becomes a customer and supports switching financial inputs", async ({ page }, testInfo) => {
  await loginAsAdmin(page, "/admin/bookings/new");
  await expect(page.getByRole("heading", { name: "New booking" })).toBeVisible();

  // A business identity controls the invoice letterhead, not how the order arrived.
  await page.getByRole("button", { name: "Walk-in", exact: true }).click();
  await page.getByRole("option", { name: "Referral", exact: true }).click();
  await expect(page.getByRole("button", { name: "Referral", exact: true })).toBeVisible();
  await page.locator('input[name="customerName"]').fill("Synthetic Referral Walk-in Test");
  const phone = `081994930${testInfo.retry + 1}`;
  await page.locator('input[name="customerPhone"]').fill(phone);
  await page.locator('input[name="contractAmount"]').fill("350");
  await page.locator('textarea[name="projectDescription"]').fill("Synthetic referral laptop repair");
  await page.getByRole("button", { name: "Create booking" }).click();
  // /admin/bookings/new also matches a generic ID regex; ensure navigation finishes.
  await expect(page).toHaveURL(/\/admin\/bookings\/(?!new$)[^/]+$/);
  await expect(page.getByText("referral", { exact: true })).toBeVisible();
  const bookingUrl = page.url();

  await page.getByRole("link", { name: "Add customer" }).click();
  await expect(page).toHaveURL(/\/admin\/customers\?booking=/);
  await expect(page.locator('input[name="name"]')).toHaveValue("Synthetic Referral Walk-in Test");
  await expect(page.locator('input[name="phone"]')).toHaveValue(phone);
  const bookingId = bookingUrl.split("/").at(-1);
  const responsePromise = page.waitForResponse(response =>
    response.url().endsWith("/api/admin/customers") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Add customer", exact: true }).click();
  const response = await responsePromise;
  expect(response.status()).toBe(201);
  const sent = response.request().postDataJSON();
  expect(sent.bookingId).toBe(bookingId);
  expect((await response.json()).linkedBookingId).toBe(bookingId);
  await expect(page).toHaveURL(/\/admin\/customers\/[^/]+$/);

  await page.goto(bookingUrl);
  await expect(page.getByRole("link", { name: "View customer" })).toBeVisible();
  await page.getByRole("link", { name: "Create document" }).click();
  await expect(page).toHaveURL(/\/admin\/documents\?booking=/);
  await page.getByRole("button", { name: "Choose a lead or booking" }).click();
  const search = page.getByRole("searchbox", { name: "Search options" });
  await expect(search).toBeVisible();
  await search.fill("Synthetic Referral Walk-in Test");
  await expect(page.getByRole("option", { name: /Synthetic Referral Walk-in Test/ })).toBeVisible();
  await page.getByRole("option", { name: /Synthetic Referral Walk-in Test/ }).click();

  await page.getByRole("button", { name: "Quotation", exact: true }).click();
  await page.getByRole("option", { name: "Invoice", exact: true }).click();
  await page.getByRole("spinbutton", { name: "Rate", exact: true }).fill("350");
  await page.getByRole("button", { name: "Create document" }).click();
  await expect(page).toHaveURL(/\/admin\/documents\/[^/]+$/);
  const invoiceId = page.url().split("/").at(-1);
  await page.getByRole("button", { name: "Issue document" }).click();

  await page.goto(`/admin/documents?invoice=${invoiceId}`);
  await page.getByRole("button", { name: "Choose an unpaid invoice or project" }).click();
  await expect(page.getByRole("searchbox", { name: "Search options" })).toBeVisible();
  await page.getByRole("option", { name: /Synthetic Referral Walk-in Test/ }).first().click();
  await expect(page.locator('input[name="amount"]')).toHaveValue("350.00");

  await page.getByRole("button", { name: "Cash", exact: true }).click();
  await page.getByRole("option", { name: "Bank transfer", exact: true }).click();
  await expect(page.getByRole("button", { name: "Bank transfer", exact: true })).toBeVisible();
  await page.locator('input[name="amount"]').fill("100");
  await page.locator('input[name="reference"]').fill("Synthetic EFT reference");
  await page.getByRole("button", { name: "Record payment", exact: true }).click();
  await expect(page.getByText("Payment recorded and receipt issued")).toBeVisible();

  // Remaining balance is recalculated from the actual invoice's active payments.
  await page.reload();
  await expect(page.getByText(/Outstanding balance: N\$250\.00/)).toBeVisible();
});

test("lead editor dropdown remains interactive inside a modal dialog", async ({ page }) => {
  await loginAsAdmin(page, "/admin/business-documents/new");
  await page.getByRole("button", { name: "Create new lead" }).click();
  const dialog = page.getByRole("dialog", { name: "Create new lead" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "EMAIL", exact: true }).first().click();
  await expect(dialog.getByRole("option", { name: "PHONE", exact: true })).toBeVisible();
  await dialog.getByRole("option", { name: "PHONE", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "PHONE", exact: true })).toBeVisible();
  await expect(dialog).toBeVisible();
});
