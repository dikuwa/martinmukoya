import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./admin-auth";

test.setTimeout(90_000);

test("business document composer keeps lead modal and selector interactions usable", async ({ page }) => {
  await loginAsAdmin(page, "/admin/business-documents/new");
  await expect(page.getByRole("heading", { name: "New business document" })).toBeVisible();
  await page.getByRole("button", { name: "Create new lead" }).click();
  const dialog = page.getByRole("dialog", { name: "Create new lead" });
  await expect(dialog).toBeVisible();
  const preferredContact = dialog.locator("label").filter({ hasText: /^Preferred contact/ });
  await preferredContact.getByRole("button").click();
  await expect(dialog.getByRole("option", { name: "PHONE", exact: true })).toBeVisible();
  await dialog.getByRole("option", { name: "PHONE", exact: true }).click();
  await expect(preferredContact.getByRole("button", { name: "PHONE", exact: true })).toBeVisible();
  await page.screenshot({ path: "test-results/e2e/pr26-composer-desktop-light.png", fullPage: true });
});

test("finance and business registers expose live search on mobile dark presentation", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.setViewportSize({ width: 375, height: 812 });
  await loginAsAdmin(page, "/admin/business-documents");
  const businessSearch = page.getByRole("textbox", { name: "Search by title, number, recipient…" });
  await expect(businessSearch).toBeVisible();
  await businessSearch.fill("synthetic");
  await expect(page).toHaveURL(/search=synthetic/);
  await page.goto("/admin/documents");
  await expect(page.getByRole("textbox", { name: "Search documents and payments" })).toBeVisible();
  await page.screenshot({ path: "test-results/e2e/pr26-register-mobile-dark.png", fullPage: true });
});
