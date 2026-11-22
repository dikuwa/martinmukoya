import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./admin-auth";

test.use({ channel: "chrome" });
test.setTimeout(180_000);
test("customer, service, invoice, partial payment and reminder", async ({ page }) => {
  await loginAsAdmin(page, "/admin/customers");
  await page.locator('input[name="name"]').fill("Synthetic Browser Client");
  await page.locator('input[name="email"]').fill("synthetic-client@example.invalid");
  await page.locator('input[name="phone"]').fill("+264811111111");
  await page.getByRole("button", { name: "Add customer" }).click();
  await expect(page).toHaveURL(/\/admin\/customers\/[^/]+/);
  await page.getByRole("textbox", { name: "Description" }).fill("Synthetic computer repair");
  await page.getByRole("spinbutton", { name: "Price (N$)" }).fill("350");
  await page.getByRole("button", { name: "Create job & prepare quotation" }).click();
  await expect(page).toHaveURL(/\/admin\/documents\?booking=/);
  await expect(page.getByRole("spinbutton", { name: "Rate", exact: true })).toHaveValue("350");
  await page.getByRole("button", { name: "Quotation" }).click();
  await page.getByRole("option", { name: "Invoice" }).click();
  await page.getByRole("button", { name: "Create document" }).click();
  await expect(page).toHaveURL(/\/admin\/documents\/[^/]+/);
  await page.getByRole("button", { name: "Issue document" }).click();
  await expect(page.getByText(/Outstanding N\$ 350\.00/)).toBeVisible();
  await page.getByRole("link", { name: "Record payment against this invoice" }).click();
  await page.getByRole("spinbutton", { name: "Amount (N$)", exact: true }).fill("100");
  await page.getByRole("button", { name: "Record payment" }).click();
  await expect(page.getByText("Payment recorded and receipt issued")).toBeVisible();
  await page.goBack();
  await expect(page.getByText(/Outstanding N\$ 250\.00/)).toBeVisible();

  // Verify reminder preparation without contacting the customer or opening a messaging app.
  await expect(page.getByRole("heading", { name: "Payment reminder" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Payment reminder text" })).toHaveValue(/N\$ 250\.00/);
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "Copy", exact: true }).click();
  await expect(page.getByText("Reminder prepared (delivery not confirmed)")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Reminder history" })).toBeVisible();
  await expect(page.getByText(/COPY.*Prepared \(not confirmed sent\)/)).toBeVisible();

  const invoiceId = new URL(page.url()).pathname.split("/").at(-1);
  const payment = { invoiceId, amount: "200", method: "CASH" };
  const responses = await Promise.all([
    page.request.post("/api/admin/payments", { data: payment }),
    page.request.post("/api/admin/payments", { data: payment }),
  ]);
  const accepted = responses.filter(response => response.status() === 201);
  expect(accepted).toHaveLength(1);
  const rejected = responses.find(response => response.status() !== 201)!;
  expect(rejected.status()).toBe(409);
  expect((await rejected.json()).error).toMatch(/exceed the outstanding balance/);
  await page.reload();
  await expect(page.getByText(/Outstanding N\$ 50\.00/)).toBeVisible();

  const voidAttempt = await page.request.post(`/api/admin/documents/${invoiceId}/void`);
  expect(voidAttempt.status()).toBe(409);

  const result = await accepted[0].json();
  const reversal = await page.request.post(`/api/admin/payments/${result.id}/reverse`);
  expect(reversal.ok()).toBe(true);
  await page.reload();
  await expect(page.getByText(/Outstanding N\$ 250\.00/)).toBeVisible();
});
