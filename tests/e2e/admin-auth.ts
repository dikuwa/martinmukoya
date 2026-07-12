import type { Page, Route } from "@playwright/test";

/**
 * Log in to the admin dashboard and optionally land on a specific page.
 *
 * Navigates directly to the sign-in page with the target URL as the
 * redirect parameter. After successful login, NextAuth redirects to
 * the target URL directly — no additional navigation needed.
 *
 * Also intercepts slow notification API calls that can block React
 * hydration for 10-20 seconds each.
 */
export async function loginAsAdmin(page: Page, redirectTo?: string) {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set. " +
      "Run: ADMIN_EMAIL=user@example.com ADMIN_PASSWORD=yourpassword npx playwright test"
    );
  }

  const target = redirectTo || "/admin";

  // Block slow notification API calls that block React hydration
  await page.route("**/api/admin/notifications/**", (route: Route) => {
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) }).catch(() => {});
  });

  // Navigate to the sign-in page with the desired redirect
  await page.goto(`/auth/sign-in?redirect=${encodeURIComponent(target)}`, { waitUntil: "load" });

  // Wait for the sign-in form
  await page.waitForSelector('input[name="email"]', { timeout: 15000 });
  await page.waitForSelector('input[name="password"]', { timeout: 5000 });

  // Fill credentials
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);

  // Click sign in — the server will validate and redirect to the target
  await page.click('button:has-text("Sign In")');

  // Wait for redirect to the target page using regex
  const escapedTarget = target.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  await page.waitForURL(new RegExp(escapedTarget.replace(/^\//, "/")), { timeout: 30000 });
  await page.waitForTimeout(1000);
}
