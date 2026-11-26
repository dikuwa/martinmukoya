import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./admin-auth";

test("financial registers expose readable dates, filters and invoice history", async ({ page }) => {
  await loginAsAdmin(page, "/admin/documents");
  await page.goto("/admin/documents?all=1");

  await expect(page.getByRole("heading", { name: "Document register" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Payment register" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Search documents and payments" })).toBeVisible();
  await expect(page.getByRole("button", { name: "From date" })).toBeVisible();
  await expect(page.getByRole("button", { name: "To date" })).toBeVisible();
  await expect(page.getByText(/Created \d{2} \w{3} \d{4}|Issued \d{2} \w{3} \d{4}/).first()).toBeVisible();
  await expect(page.getByText("PARTIALLY_PAID")).toHaveCount(0);

  const invoiceLink = page.locator('a[href^="/admin/documents/"]').filter({ hasText: /INV|Invoice/ }).first();
  if (await invoiceLink.count()) {
    await invoiceLink.click();
    await expect(page.getByRole("heading", { name: "Financial history" })).toBeVisible();
    await expect(page.getByText("Invoice total")).toBeVisible();
    await expect(page.getByText("Outstanding", { exact: true })).toBeVisible();
    await expect(page.getByText("Transactions")).toBeVisible();
  }
});

test("legacy admin login redirects to the canonical sign-in route", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page).toHaveURL(/\/auth\/sign-in\?redirect=%2Fadmin$/);
});
