import { test, expect } from "@playwright/test";
import { config as dotenvConfig } from "dotenv";

dotenvConfig({ path: ".env.local" });

const baseUrl = process.env.TEST_BASE_URL ?? "http://localhost:3000";

test.setTimeout(120000);

test("dashboard date picker renders a complete opaque calendar and submits the date", async ({ page }) => {
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/admin/documents`);
  if (page.url().includes("/auth/sign-in")) {
    const signIn = await page.request.post(`${baseUrl}/api/auth/sign-in/email`, {
      headers: { origin: baseUrl },
      data: {
        email: process.env.ADMIN_EMAIL ?? "",
        password: process.env.ADMIN_PASSWORD ?? "",
      },
    });
    expect(signIn.ok()).toBe(true);
    await page.goto(`${baseUrl}/admin/documents`, { waitUntil: "domcontentloaded" });
  }

  const trigger = page.getByRole("button", { name: "Select date" }).first();
  await trigger.click();

  const calendar = page.locator(".dashboard-calendar");
  const popup = calendar.locator("xpath=..");
  await expect(calendar).toBeVisible();
  await expect(calendar.locator("thead th")).toHaveCount(7);
  const dayCount = await calendar.locator(".dashboard-calendar-day").count();
  expect([35, 42]).toContain(dayCount);

  const popupStyle = await popup.evaluate((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      backgroundColor: style.backgroundColor,
      left: rect.left,
      right: rect.right,
      viewportWidth: window.innerWidth,
    };
  });
  expect(popupStyle.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(popupStyle.left).toBeGreaterThanOrEqual(0);
  expect(popupStyle.right).toBeLessThanOrEqual(popupStyle.viewportWidth);

  const monthLabel = calendar.locator("span").first();
  const originalMonth = await monthLabel.textContent();
  await calendar.getByRole("button", { name: "Next month" }).click();
  await expect(monthLabel).not.toHaveText(originalMonth ?? "");

  const selectableDays = calendar.locator(".dashboard-calendar-day:not(:disabled)");
  const labels = await selectableDays.evaluateAll((buttons) =>
    buttons.map((button) => button.getAttribute("aria-label") ?? "")
  );
  const chosenIndex = labels.findIndex((label) => label && !label.startsWith("Sunday"));
  expect(chosenIndex).toBeGreaterThanOrEqual(0);
  const chosenLabel = labels[chosenIndex];
  await selectableDays.nth(chosenIndex).click();

  await expect(calendar).toBeHidden();
  await expect(trigger).not.toHaveText("Select date");
  await expect(page.locator('input[name="validUntil"]')).not.toHaveValue("");
  expect(chosenLabel).toBeTruthy();

  await page.evaluate(() => {
    document.documentElement.classList.toggle("dark");
    document.documentElement.classList.toggle("light");
  });
  await trigger.click();
  await expect(calendar).toBeVisible();
  await expect.poll(() => popup.evaluate((element) => getComputedStyle(element).backgroundColor))
    .not.toBe("rgba(0, 0, 0, 0)");
  expect(consoleErrors).toEqual([]);
});
