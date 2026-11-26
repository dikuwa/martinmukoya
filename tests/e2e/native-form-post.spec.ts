import { expect, test } from "@playwright/test";

test.use({ javaScriptEnabled: false });
test.setTimeout(process.env.HOSTED_STAGING_TEST === "1" ? 180_000 : 30_000);

test("sign-in cannot expose credentials through a native GET fallback", async ({ page }) => {
  await page.goto("/auth/sign-in", { waitUntil: "domcontentloaded" });
  const form = page.locator("form").filter({ has: page.locator('input[name="password"]') });
  await expect(form).toHaveAttribute("method", "post");

  await form.locator('input[name="email"]').fill("synthetic-native-form@example.invalid");
  await form.locator('input[name="password"]').fill("Synthetic-Not-A-Real-Password");
  const submitted = page.waitForRequest((request) =>
    request.method() === "POST" && new URL(request.url()).pathname === "/auth/sign-in"
  );
  await form.getByRole("button", { name: "Sign In" }).click({ noWaitAfter: true });
  const request = await submitted;
  const url = new URL(request.url());
  expect(url.searchParams.has("password")).toBe(false);
  expect(url.searchParams.has("email")).toBe(false);
});

test("authenticated customer HTML specifies a POST-only form fallback", async ({ page }) => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Synthetic admin credentials required");
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
  const signIn = await page.request.post("/api/auth/sign-in/email", {
    data: { email, password }, headers: { Origin: new URL(baseUrl).origin },
  });
  expect(signIn.status()).toBe(200);
  const response = await page.request.get("/admin/customers");
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toMatch(/<form[^>]+method="post"[^>]*>/i);
  expect(html).toContain('name="name"');
});
