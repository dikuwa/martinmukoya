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
  const customerPath = new URL(page.url()).pathname;
  const duplicate = await page.request.post("/api/admin/customers", {
    data: { name: "Different label", phone: "081 111 1111" },
  });
  expect(duplicate.status()).toBe(409);
  expect((await duplicate.json()).existingId).toBe(customerPath.split("/").at(-1));

  await page.getByRole("textbox", { name: "Description" }).fill("Synthetic computer repair");
  await page.getByRole("spinbutton", { name: "Price (N$)" }).fill("350");
  const jobResponse = page.waitForResponse(response => response.url().endsWith("/api/admin/quick-jobs") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Create job & prepare quotation" }).click();
  const job = await (await jobResponse).json();
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
  const repeated = await page.request.post("/api/admin/invoice-reminders", {
    data: { invoiceId, channel: "COPY", message: "Incorrect amount from a stale page" },
  });
  expect(repeated.status()).toBe(200);
  expect((await repeated.json()).message).toMatch(/N\$ 250\.00/);
  const pdf = await page.request.get(`/api/admin/documents/${invoiceId}/pdf`);
  expect(pdf.headers()["content-type"]).toContain("application/pdf");
  expect((await pdf.body()).subarray(0, 4).toString()).toBe("%PDF");

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
  const reminders = await Promise.all([1, 2].map(() => page.request.post("/api/admin/invoice-reminders", {
    data: { invoiceId, channel: "COPY" },
  })));
  expect(reminders.map(response => response.status()).sort()).toEqual([200, 201]);
  expect((await reminders[0].json()).message).toMatch(/N\$ 50\.00/);

  const voidAttempt = await page.request.post(`/api/admin/documents/${invoiceId}/void`);
  expect(voidAttempt.status()).toBe(409);

  const result = await accepted[0].json();
  const reversal = await page.request.post(`/api/admin/payments/${result.id}/reverse`);
  expect(reversal.ok()).toBe(true);
  await page.reload();
  await expect(page.getByText(/Outstanding N\$ 250\.00/)).toBeVisible();
  await page.goto(customerPath);
  await expect(page.getByRole("heading", { name: "Payment history" })).toBeVisible();
  await expect(page.getByText(/Reversed \d{4}-/)).toBeVisible();
  await page.getByRole("link", { name: "Edit quick service" }).click();
  await page.getByRole("checkbox", { name: "Promote this quick service to a project" }).check();
  await page.getByRole("button", { name: "Save booking" }).click();
  await expect(page).toHaveURL(/\/admin\/bookings\/[^/]+$/);
  await page.goto(customerPath);
  await expect(page.getByRole("link", { name: "Edit project" })).toBeVisible();
  const lead = await page.request.post("/api/admin/leads", { data: {
    name: "Synthetic returning lead", email: "SYNTHETIC-CLIENT@example.invalid",
    siteId: job.siteId, projectGoal: "Synthetic repeat enquiry",
  } });
  expect(lead.status()).toBe(201);
  const leadId = (await lead.json()).id;
  const convert = () => page.request.post("/api/admin/bookings/from-lead", { data: { leadId } });
  const converted = await convert();
  expect(converted.status()).toBe(201);
  const linked = await converted.json();
  expect(linked.contactId).toBe(customerPath.split("/").at(-1));
  expect((await (await convert()).json()).id).toBe(linked.id);
  await expect(page.getByText(/Reversed \d{4}-/)).toBeVisible();
});


test("catalogue edit, archive and restore on a mobile dark viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: "dark" });
  await loginAsAdmin(page, "/admin/services");
  const add = page.locator("form").filter({ has: page.getByRole("heading", { name: "Add a reusable service" }) });
  await add.getByRole("textbox", { name: "Service name" }).fill("Synthetic catalogue service");
  await add.getByRole("spinbutton", { name: "Default price (N$)" }).fill("125");
  await add.getByRole("button", { name: "Add service" }).click();
  await page.getByText("Synthetic catalogue service ·", { exact: false }).click();
  const edit = page.locator("details").filter({ hasText: "Synthetic catalogue service" });
  await edit.getByRole("spinbutton", { name: "Default price (N$)" }).fill("150");
  await edit.getByRole("button", { name: "Save service" }).click();
  await expect(edit.locator("summary")).toContainText("150.00");
  await edit.getByRole("button", { name: "Archive service" }).click();
  await expect(edit.locator("summary")).toContainText("Archived");
  const available = await page.request.get("/api/admin/service-catalog");
  expect((await available.json()).some((item: { name: string }) => item.name === "Synthetic catalogue service")).toBe(false);
  await edit.getByRole("button", { name: "Restore service" }).click();
  await expect(edit.locator("summary")).not.toContainText("Archived");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
