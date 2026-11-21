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
  // Dates must survive both an unchanged draft save and a subsequent calendar edit.
  const date = new Date();
  date.setDate(15);
  const dateLabel = (day: Date) => day.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
  const dateValue = (day: Date) => `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
  await page.getByRole("button", { name: "Select date" }).click();
  await page.getByRole("button", { name: dateLabel(date) }).click();
  await expect(page.locator('input[name="dueDate"]')).toHaveValue(dateValue(date));
  await page.getByRole("button", { name: "Create document" }).click();
  await expect(page).toHaveURL(/\/admin\/documents\/[^/]+/);
  const invoiceUrl = page.url();
  await page.getByRole("link", { name: "Edit draft" }).click();
  await expect(page.locator('input[name="dueDate"]')).toHaveValue(dateValue(date));
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page).toHaveURL(invoiceUrl);
  await page.getByRole("link", { name: "Edit draft" }).click();
  await expect(page.locator('input[name="dueDate"]')).toHaveValue(dateValue(date));
  const changedDate = new Date(date);
  changedDate.setDate(16);
  await page.getByRole("button", { name: "Select date" }).nth(1).click();
  await page.getByRole("button", { name: dateLabel(changedDate) }).click();
  await expect(page.locator('input[name="dueDate"]')).toHaveValue(dateValue(changedDate));
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page).toHaveURL(invoiceUrl);
  await page.getByRole("link", { name: "Edit draft" }).click();
  await expect(page.locator('input[name="dueDate"]')).toHaveValue(dateValue(changedDate));
  await page.goto(invoiceUrl);
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
});
