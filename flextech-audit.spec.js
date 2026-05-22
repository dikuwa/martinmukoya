import { test, expect } from "@playwright/test";
import { config as dotenvConfig } from "dotenv";

dotenvConfig({ path: ".env.local" });

const flextechBaseUrl = "http://flextech-media.localhost:3000";
const adminBaseUrl = "http://localhost:3000";
const testStamp = Date.now();
const slowExpect = expect.configure({ timeout: 60000 });
const auditNames = {
  project: `CTA Audit Project ${testStamp}`,
  projectSlug: `cta-audit-project-${testStamp}`,
  post: `CTA Audit Post ${testStamp}`,
  postSlug: `cta-audit-post-${testStamp}`,
  testimonial: `CTA Audit Client ${testStamp}`,
  faq: `CTA Audit FAQ question ${testStamp}?`,
  setting: `cta-audit.setting-${testStamp}`
};

test.setTimeout(300000);

function capturePageFailures(page) {
  const consoleErrors = [];
  const failedResponses = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.url().startsWith(flextechBaseUrl) && response.status() >= 400 && !response.url().includes("definitely-missing-route")) {
      failedResponses.push(`${response.status()} ${response.url()}`);
    }
  });

  return () => {
    expect(consoleErrors, "console errors").toEqual([]);
    expect(failedResponses, "failed local responses").toEqual([]);
  };
}

async function expectNoDeadClickables(page) {
  const deadClickables = await page.locator("a,button").evaluateAll((items) =>
    items
      .filter((item) => item instanceof HTMLElement && item.getClientRects().length > 0)
      .map((item) => ({
        tag: item.tagName,
        text: item.textContent?.trim() ?? "",
        ariaLabel: item.getAttribute("aria-label") ?? "",
        title: item.getAttribute("title") ?? "",
        href: item.getAttribute("href") ?? ""
      }))
      .filter((item) => item.tag === "A" && (!item.href || item.href === "#"))
      .concat(
        items
          .filter((item) => item instanceof HTMLElement && item.getClientRects().length > 0)
          .map((item) => ({
            tag: item.tagName,
            text: item.textContent?.trim() ?? "",
            ariaLabel: item.getAttribute("aria-label") ?? "",
            title: item.getAttribute("title") ?? "",
            href: item.getAttribute("href") ?? ""
          }))
          .filter((item) => item.tag === "BUTTON" && !item.text && !item.ariaLabel && !item.title)
      )
  );

  expect(deadClickables).toEqual([]);
}

function rowWithText(page, text) {
  return page.getByRole("row").filter({ hasText: text });
}

async function deleteCurrentAdminRecord(page) {
  await page.getByRole("button", { name: /^Delete$/ }).click();
  await page.getByRole("button", { name: "Confirm" }).click();
}

test("public navigation, CTAs, forms, chatbot, and content actions work", async ({ page }) => {
  const assertPageClean = capturePageFailures(page);

  await page.goto(`${flextechBaseUrl}/`);
  await expect(page.getByRole("link", { name: /Book a Project/i }).first()).toBeVisible();
  await expectNoDeadClickables(page);

  const beforeTheme = await page.locator("html").getAttribute("class");
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect.poll(() => page.locator("html").getAttribute("class")).not.toBe(beforeTheme);

  await page.getByRole("link", { name: /Book a Project/i }).first().click();
  await slowExpect(page).toHaveURL(/\/start-project$/);
  await page.goBack();

  await page.getByRole("link", { name: /See Agency Work/i }).first().click();
  await slowExpect(page).toHaveURL(/\/projects$/);
  await expectNoDeadClickables(page);

  await page.goto(`${flextechBaseUrl}/about`);
  await expectNoDeadClickables(page);

  await page.locator("header").getByRole("link", { name: "Services" }).click();
  await slowExpect(page).toHaveURL(/\/services$/);
  await expect(page.locator("article#booking-systems")).toBeVisible();
  await page.locator("article#booking-systems").getByRole("link").click();
  await slowExpect(page).toHaveURL(/\/start-project\?service=booking-systems$/);
  await expect(page.getByRole("button", { name: /Booking Systems/i })).toHaveAttribute("aria-pressed", "true");

  await page.goto(`${flextechBaseUrl}/projects`);
  await page.getByRole("link", { name: /Read Case Study/i }).first().click();
  await slowExpect(page).toHaveURL(/\/projects\/.+/);
  await page.locator('main a[href="/start-project"]').click();
  await slowExpect(page).toHaveURL(/\/start-project$/);

  await page.goto(`${flextechBaseUrl}/blog`);
  await expectNoDeadClickables(page);
  const tagButtons = page.locator("button").filter({ hasText: /Websites|Booking|AI Automation|Business Systems/ });
  if (await tagButtons.count()) await tagButtons.first().click();
  await page.getByRole("link", { name: /Read article/i }).first().click();
  await slowExpect(page).toHaveURL(/\/blog\/.+/);
  await page.getByRole("button", { name: "Copy code" }).first().click();
  await page.getByRole("link", { name: "Back to Blog" }).click();
  await slowExpect(page).toHaveURL(/\/blog$/);

  await page.goto(`${flextechBaseUrl}/faq`);
  await page.locator("[aria-controls^=faq-answer-]").first().click();
  await expect(page.locator("[aria-controls^=faq-answer-]").first()).toHaveAttribute("aria-expanded", "true");

  await page.goto(`${flextechBaseUrl}/contact`);
  await page.getByRole("button", { name: /Send Message/i }).click();
  await expect(page.getByText("Enter your name.")).toBeVisible();
  await page.getByPlaceholder("Your full name").fill(`CTA Audit Message ${testStamp}`);
  await page.getByPlaceholder("you@example.com").fill(`cta-message-${testStamp}@example.test`);
  await page.getByPlaceholder("Tell me what you want to build, fix, or improve...").fill("Testing the rendered contact flow and dashboard persistence for the CTA audit.");
  await page.getByRole("button", { name: /Send Message/i }).click();
  await slowExpect(page.getByText("Message received")).toBeVisible();

  await page.goto(`${flextechBaseUrl}/start-project?service=booking-systems`);
  await expect(page.getByRole("button", { name: /Booking Systems/i })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /Next/i }).click();
  await page.getByRole("button", { name: /Next/i }).click();
  await page.getByRole("button", { name: "1-3 months" }).click();
  await page.getByPlaceholder("Your Name").fill(`CTA Audit Lead ${testStamp}`);
  await page.getByPlaceholder("Your Email").fill(`cta-lead-${testStamp}@example.test`);
  await page.getByPlaceholder("Tell me more about the project...").fill("Testing the rendered project enquiry flow and lead persistence from the public wizard.");
  await page.getByRole("button", { name: /Submit Request/i }).click();
  await slowExpect(page.getByText("Request received")).toBeVisible();

  await page.goto(`${flextechBaseUrl}/`);
  await page.getByRole("button", { name: "Open chat" }).click();
  await expect(page.getByRole("button", { name: "Close chat" }).first()).toBeVisible();
  await page.getByPlaceholder("Ask about scope, budget, or timeline").fill("Choose a service");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Choose a service", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close chat" }).first().click();
  await expect(page.getByRole("button", { name: "Open chat" })).toBeVisible();

  assertPageClean();

  await page.goto(`${flextechBaseUrl}/definitely-missing-route`);
  await expect(page.getByRole("link", { name: /Back home/i })).toBeVisible();
});

test("admin routes and CRUD flows work for public content and submissions", async ({ page }) => {
  const assertPageClean = capturePageFailures(page);

  await page.goto(`${adminBaseUrl}/admin`);
  if (page.url().includes("/auth/sign-in")) {
    await page.locator('input[type="email"]').fill(process.env.ADMIN_EMAIL ?? "");
    await page.locator('input[type="password"]').fill(process.env.ADMIN_PASSWORD ?? "");
    await page.locator('button[type="submit"]').click();
  }

  await slowExpect(page).toHaveURL(/\/admin$/);

  for (const route of [
    "/admin/projects",
    "/admin/projects/new",
    "/admin/blog",
    "/admin/blog/new",
    "/admin/leads",
    "/admin/messages",
    "/admin/testimonials",
    "/admin/testimonials/new",
    "/admin/faqs",
    "/admin/faqs/new",
    "/admin/chat",
    "/admin/analytics",
    "/admin/settings",
    "/admin/settings/new"
  ]) {
    await page.goto(`${adminBaseUrl}${route}`);
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
    await expectNoDeadClickables(page);
  }

  await page.goto(`${adminBaseUrl}/admin/leads?search=${encodeURIComponent(`CTA Audit Lead ${testStamp}`)}`);
  await expect(page.getByText(`CTA Audit Lead ${testStamp}`)).toBeVisible();
  await page.goto(`${adminBaseUrl}/admin/messages?search=${encodeURIComponent(`CTA Audit Message ${testStamp}`)}`);
  await expect(page.getByText(`CTA Audit Message ${testStamp}`)).toBeVisible();

  await page.goto(`${adminBaseUrl}/admin/projects/new`);
  await page.getByLabel("Title").fill(auditNames.project);
  await page.getByLabel("Slug").fill(auditNames.projectSlug);
  await page.getByLabel("Summary").fill("Browser-created public project for the CTA audit.");
  await page.getByLabel("Industry").fill("Audit");
  await page.getByLabel("Client type").fill("Test visitor");
  await page.getByLabel("Description").fill("This audit project checks the rendered project creation flow.");
  await page.getByLabel("Problem").fill("A CTA audit needs a real project record to verify routing.");
  await page.getByLabel("Solution").fill("Create, publish, edit, inspect, and delete the record in-browser.");
  await page.getByLabel("Outcome").fill("Public and admin project actions stay connected.");
  await page.getByLabel("Case study content").fill("## Audit project\n\nRendered project content for browser CTA verification.");
  await page.getByLabel("FlexTech Media").check();
  await page.getByRole("button", { name: "Save Project" }).click();
  await slowExpect(page).toHaveURL(/\/admin\/projects$/);
  await page.goto(`${adminBaseUrl}/admin/projects?search=${encodeURIComponent(auditNames.project)}`);
  await rowWithText(page, auditNames.project).getByRole("link", { name: "Edit" }).click();
  await page.getByLabel("Summary").fill("Browser-edited public project for the CTA audit.");
  await page.getByRole("button", { name: "Save Project" }).click();
  await slowExpect(page).toHaveURL(/\/admin\/projects$/);
  await page.goto(`${flextechBaseUrl}/projects/${auditNames.projectSlug}`);
  await expect(page.getByRole("heading", { name: auditNames.project })).toBeVisible();
  await page.goto(`${adminBaseUrl}/admin/projects?search=${encodeURIComponent(auditNames.project)}`);
  await rowWithText(page, auditNames.project).getByRole("link", { name: "Edit" }).click();
  await deleteCurrentAdminRecord(page);
  await slowExpect(page).toHaveURL(/\/admin\/projects$/);

  await page.goto(`${adminBaseUrl}/admin/blog/new`);
  await page.getByLabel("Title", { exact: true }).fill(auditNames.post);
  await page.getByLabel("Slug").fill(auditNames.postSlug);
  await page.getByLabel("Excerpt").fill("Browser-created public blog post for the CTA audit.");
  await page.getByLabel("Blog content editor").fill("## Audit post\n\n```js\nconsole.log(\"copy me\");\n```\n\n[External link](https://martinmukoya.com)");
  await page.getByLabel("Category").fill("Audit");
  await page.getByLabel("Tags, comma-separated").fill("audit, cta");
  await page.getByLabel("SEO title").fill(`${auditNames.post} SEO`);
  await page.getByLabel("SEO description").fill("Browser verification content for public blog routing and controls.");
  await page.getByLabel("FlexTech Media").check();
  await page.getByRole("button", { name: "Save Post" }).click();
  await slowExpect(page).toHaveURL(/\/admin\/blog$/);
  await page.goto(`${adminBaseUrl}/admin/blog?search=${encodeURIComponent(auditNames.post)}`);
  await rowWithText(page, auditNames.post).getByRole("link", { name: "Edit" }).click();
  await page.getByLabel("Excerpt").fill("Browser-edited public blog post for the CTA audit.");
  await page.getByRole("button", { name: "Save Post" }).click();
  await slowExpect(page).toHaveURL(/\/admin\/blog$/);
  await page.goto(`${flextechBaseUrl}/blog/${auditNames.postSlug}`);
  await expect(page.getByRole("heading", { name: auditNames.post })).toBeVisible();
  await page.getByRole("button", { name: "Copy code" }).first().click();
  await expect(page.getByRole("link", { name: "External link" })).toHaveAttribute("target", "_blank");
  await expect(page.getByRole("link", { name: "External link" })).toHaveAttribute("rel", "noopener noreferrer");
  await page.goto(`${adminBaseUrl}/admin/blog?search=${encodeURIComponent(auditNames.post)}`);
  await rowWithText(page, auditNames.post).getByRole("link", { name: "Edit" }).click();
  await deleteCurrentAdminRecord(page);
  await slowExpect(page).toHaveURL(/\/admin\/blog$/);

  await page.goto(`${adminBaseUrl}/admin/testimonials/new`);
  await page.getByLabel("Client name").fill(auditNames.testimonial);
  await page.getByLabel("Role").fill("Audit Lead");
  await page.getByLabel("Company").fill("CTA Audit");
  await page.getByLabel("Quote").fill("The rendered testimonial form saved and stayed reachable.");
  await page.getByLabel("FlexTech Media").check();
  await page.getByRole("button", { name: "Save Testimonial" }).click();
  await slowExpect(page).toHaveURL(/\/admin\/testimonials$/);
  await page.goto(`${flextechBaseUrl}/`);
  await expect(page.getByText(auditNames.testimonial).first()).toBeVisible();
  await page.goto(`${adminBaseUrl}/admin/testimonials?search=${encodeURIComponent(auditNames.testimonial)}`);
  await rowWithText(page, auditNames.testimonial).getByRole("link", { name: "Edit" }).click();
  await page.getByLabel("Quote").fill("The rendered testimonial edit action stayed connected.");
  await page.getByRole("button", { name: "Save Testimonial" }).click();
  await slowExpect(page).toHaveURL(/\/admin\/testimonials$/);
  await page.goto(`${adminBaseUrl}/admin/testimonials?search=${encodeURIComponent(auditNames.testimonial)}`);
  await rowWithText(page, auditNames.testimonial).getByRole("link", { name: "Edit" }).click();
  await deleteCurrentAdminRecord(page);
  await slowExpect(page).toHaveURL(/\/admin\/testimonials$/);

  await page.goto(`${adminBaseUrl}/admin/faqs/new`);
  await page.getByLabel("Question").fill(auditNames.faq);
  await page.getByLabel("Answer").fill("This rendered FAQ was created for the CTA audit browser pass.");
  await page.getByLabel("Category").fill("Audit");
  await page.getByLabel("FlexTech Media").check();
  await page.getByRole("button", { name: "Save FAQ" }).click();
  await slowExpect(page).toHaveURL(/\/admin\/faqs$/);
  await page.goto(`${flextechBaseUrl}/faq`);
  await expect(page.getByText(auditNames.faq)).toBeVisible();
  await page.goto(`${adminBaseUrl}/admin/faqs?search=${encodeURIComponent(auditNames.faq)}`);
  await rowWithText(page, auditNames.faq).getByRole("link", { name: "Edit" }).click();
  await page.getByLabel("Answer").fill("This rendered FAQ edit action stayed connected.");
  await page.getByRole("button", { name: "Save FAQ" }).click();
  await slowExpect(page).toHaveURL(/\/admin\/faqs$/);
  await page.goto(`${adminBaseUrl}/admin/faqs?search=${encodeURIComponent(auditNames.faq)}`);
  await rowWithText(page, auditNames.faq).getByRole("link", { name: "Edit" }).click();
  await deleteCurrentAdminRecord(page);
  await slowExpect(page).toHaveURL(/\/admin\/faqs$/);

  await page.goto(`${adminBaseUrl}/admin/settings/new`);
  await page.getByLabel("Setting key").fill(auditNames.setting);
  await page.getByLabel("Site").selectOption("flextech-media");
  await page.getByLabel("JSON value").fill('{\n  "ctaAudit": "created"\n}');
  await page.getByRole("button", { name: "Create Setting" }).click();
  await slowExpect(page).toHaveURL(/\/admin\/settings$/);
  await page.goto(`${adminBaseUrl}/admin/settings?search=${encodeURIComponent(auditNames.setting)}`);
  await rowWithText(page, auditNames.setting).getByRole("link", { name: "Edit" }).click();
  await page.getByLabel("JSON value").fill('{\n  "ctaAudit": "edited"\n}');
  await page.getByRole("button", { name: "Save Setting" }).click();
  await slowExpect(page).toHaveURL(/\/admin\/settings$/);
  await page.goto(`${adminBaseUrl}/admin/settings?search=${encodeURIComponent(auditNames.setting)}`);
  await rowWithText(page, auditNames.setting).getByRole("link", { name: "Edit" }).click();
  await deleteCurrentAdminRecord(page);
  await slowExpect(page).toHaveURL(/\/admin\/settings$/);

  await page.goto(`${adminBaseUrl}/admin/leads?search=${encodeURIComponent(`CTA Audit Lead ${testStamp}`)}`);
  await rowWithText(page, `CTA Audit Lead ${testStamp}`).getByRole("link", { name: "Open" }).click();
  await slowExpect(page).toHaveURL(/\/admin\/leads\/.+$/);
  await page.getByLabel("Status").selectOption("REVIEWING");
  await page.getByLabel("Internal notes").fill("Status updated during the CTA audit.");
  await page.getByRole("button", { name: "Update Lead" }).click();
  await expect(page.getByLabel("Status")).toHaveValue("REVIEWING");
  await deleteCurrentAdminRecord(page);
  await slowExpect(page).toHaveURL(/\/admin\/leads$/);

  await page.goto(`${adminBaseUrl}/admin/messages?search=${encodeURIComponent(`CTA Audit Message ${testStamp}`)}`);
  await rowWithText(page, `CTA Audit Message ${testStamp}`).getByRole("link", { name: "Open" }).click();
  await slowExpect(page).toHaveURL(/\/admin\/messages\/.+$/);
  await page.getByLabel("Status").selectOption("READ");
  await page.getByRole("button", { name: "Update Message" }).click();
  await expect(page.getByLabel("Status")).toHaveValue("READ");
  await deleteCurrentAdminRecord(page);
  await slowExpect(page).toHaveURL(/\/admin\/messages$/);

  await page.goto(`${adminBaseUrl}/admin/chat?search=${encodeURIComponent("Choose a service")}`);
  const chatRows = rowWithText(page, "Choose a service");
  if (await chatRows.count()) {
    await chatRows.first().getByRole("link", { name: "Open" }).click();
    await page.getByLabel("Mark for human follow-up").check();
    await page.getByLabel("Summary").fill("Chat handover updated during the CTA audit.");
    await page.getByRole("button", { name: "Update Session" }).click();
    await expect(page.getByLabel("Mark for human follow-up")).toBeChecked();
  }

  assertPageClean();
});
