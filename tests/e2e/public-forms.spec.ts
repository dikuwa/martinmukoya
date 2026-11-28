import { expect, test } from "@playwright/test";

const sites = [
  { host: "martinmukoya.com", slug: "martin-mukoya" },
  { host: "flextech-media.com", slug: "flextech-media" },
] as const;

const enquiry = {
  name: "Synthetic Form Visitor",
  email: "public-form@example.invalid",
  message: "Please review this synthetic enquiry about a sample project.",
};

for (const { host, slug } of sites) {
  test.describe(host, () => {
    test.use({ extraHTTPHeaders: { "x-forwarded-host": host } });

    test.beforeEach(async ({ baseURL }) => {
      expect(new URL(baseURL!).hostname).toMatch(/^(localhost|127\.0\.0\.1)$/);
    });

    test("contact validates before sending a JSON POST for the current site", async ({ page }) => {
      const submissions: unknown[] = [];
      await page.route("**/api/contact-messages", async (route) => {
        expect(route.request().method()).toBe("POST");
        expect(new URL(route.request().url()).search).toBe("");
        submissions.push(route.request().postDataJSON());
        await route.fulfill({ status: 201, json: { id: "synthetic-contact" } });
      });

      await page.goto("/contact");
      const form = page.locator("form").filter({ has: page.getByRole("button", { name: "Send Message" }) });
      const send = form.getByRole("button", { name: "Send Message" });
      await expect(send).toBeEnabled();
      await send.click();
      await expect(form.getByText("Enter your name.")).toBeVisible();
      expect(submissions).toEqual([]);

      await form.getByPlaceholder("Your full name").fill(enquiry.name);
      await form.getByPlaceholder("you@example.com").fill(enquiry.email);
      await form.getByPlaceholder("Tell me what you want to build, fix, or improve...").fill(enquiry.message);
      await send.click();
      await expect(page.getByText("Message received", { exact: true })).toBeVisible();
      expect(submissions).toMatchObject([{
        ...enquiry, siteSlug: slug, sourcePage: "/contact", website: "",
        message: `Preferred contact: Email\n\n${enquiry.message}`,
      }]);
    });

    test("project communication method uses the themed selector and submits the selected value", async ({ page }) => {
      const submissions: unknown[] = [];
      await page.route("**/api/leads", async (route) => {
        submissions.push(route.request().postDataJSON());
        await route.fulfill({ status: 201, json: { id: "synthetic-lead" } });
      });

      await page.goto("/start-project");
      const form = page.locator("form").filter({ has: page.getByRole("heading", { name: "Choose your services" }) });
      await form.getByRole("button", { name: /^Other\b/ }).click();
      await form.getByPlaceholder("Describe the custom work or integration you need...").fill("Synthetic communication selector test");
      await form.getByRole("button", { name: "Next", exact: true }).click();
      await page.getByRole("button", { name: "Next", exact: true }).click();

      const selector = page.getByRole("button", { name: "Preferred contact method" });
      await selector.click();
      await expect(page.getByRole("listbox", { name: "Preferred contact method" })).toBeVisible();
      await expect(page.getByRole("option", { name: "Email" })).toHaveAttribute("aria-selected", "true");
      await page.getByRole("option", { name: "WhatsApp" }).click();
      await expect(selector).toContainText("WhatsApp");

      await page.getByPlaceholder("Your Name").fill(enquiry.name);
      await page.getByPlaceholder("Your Email").fill(enquiry.email);
      await page.getByPlaceholder("Tell me more about the project...").fill(enquiry.message);
      await page.locator("label").filter({ hasText: "Schedule is flexible" }).click();
      await page.getByRole("button", { name: "Submit Request" }).click();
      await expect(page.getByText("Request received", { exact: true })).toBeVisible();
      expect(submissions).toMatchObject([{ preferredContact: "WHATSAPP", siteSlug: slug }]);
    });

    test("mobile navigation keeps active labels visible and switches themes", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto("/");

      const mobileNav = page.locator(".public-mobile-nav");
      await expect(mobileNav).toBeVisible();
      await expect(mobileNav.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
      await expect(mobileNav.getByRole("link", { name: "Home" })).toContainText("Home");
      await expect(mobileNav.getByRole("link", { name: "Start" })).toContainText("Start");
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(380);

      const toggle = page.getByRole("button", { name: "Toggle theme" });
      await toggle.click();
      await expect(page.locator("html")).toHaveClass(/dark/);
      await toggle.click();
      await expect(page.locator("html")).toHaveClass(/light/);
    });

    test("project requires a timeline, sends a site-specific POST, and restarts at step one", async ({ page }) => {
      const submissions: unknown[] = [];
      await page.route("**/api/leads", async (route) => {
        expect(route.request().method()).toBe("POST");
        expect(new URL(route.request().url()).search).toBe("");
        submissions.push(route.request().postDataJSON());
        await route.fulfill({ status: 201, json: { id: "synthetic-lead" } });
      });

      await page.goto("/start-project");
      const form = page.locator("form").filter({ has: page.getByRole("heading", { name: "Choose your services" }) });
      await form.getByRole("button", { name: /^Other\b/ }).click();
      await form.getByPlaceholder("Describe the custom work or integration you need...").fill("Synthetic integration");
      await form.getByRole("button", { name: "Next", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Select a budget range" })).toBeVisible();
      await page.getByRole("button", { name: "Next", exact: true }).click();

      await page.getByPlaceholder("Your Name").fill(enquiry.name);
      await page.getByPlaceholder("Your Email").fill(enquiry.email);
      await page.getByPlaceholder("Tell me more about the project...").fill(enquiry.message);
      const submit = page.getByRole("button", { name: "Submit Request" });
      await expect(submit).toBeEnabled();
      await submit.click();
      await expect(page.getByText("Choose a timeline or mark the timeline as flexible.")).toBeVisible();
      expect(submissions).toEqual([]);

      await page.locator("label").filter({ hasText: "Schedule is flexible" }).click();
      await expect(page.getByRole("checkbox", { name: "Schedule is flexible" })).toBeChecked();
      await submit.click();
      await expect(page.getByText("Request received", { exact: true })).toBeVisible();
      expect(submissions).toMatchObject([{
        name: enquiry.name, email: enquiry.email, siteSlug: slug, source: "start-project",
        website: "", projectGoal: "Project services requested: Other: Synthetic integration.",
        message: expect.stringContaining(enquiry.message),
      }]);
      await page.getByRole("button", { name: "Start another request" }).click();
      await expect(form.getByRole("heading", { name: "Choose your services" })).toBeVisible();
      await expect(form.getByRole("button", { name: /^Other\b/ })).toHaveAttribute("aria-pressed", "false");
    });

    test.describe("without JavaScript", () => {
      test.use({ javaScriptEnabled: false });

      test("public forms retain a POST-only fallback without JavaScript", async ({ page }) => {
        await page.goto("/contact");
        const contactForm = page.locator("form").first();
        await expect(contactForm).toHaveAttribute("method", "post");
        await expect(contactForm).not.toHaveAttribute("method", "get");

        await page.goto("/start-project");
        const wizard = page.locator("form").first();
        await expect(wizard).toHaveAttribute("method", "post");
        await expect(wizard).not.toHaveAttribute("method", "get");
      });
    });
  });
}
