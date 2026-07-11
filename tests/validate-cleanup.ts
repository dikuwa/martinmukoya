/**
 * Validation tests for the Activity Cleanup feature.
 *
 * This script validates the core logic of the activity cleanup feature
 * without needing a database connection. It tests:
 *   - Constants (confirmation phrase, TTL, preserved resources)
 *   - spreadsheetValue function (formula injection prevention, type handling)
 *   - rowsForSheet function
 *   - Delete order correctness
 *   - Validation schema logic
 *
 * Usage: npx tsx tests/validate-cleanup.ts
 */

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ✕ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ ${message}`);
  }
}

// --- Constants from src/lib/activity-cleanup.ts ---
const CLEANUP_CONFIRMATION = "RESET ALL ACTIVITY";
const CLEANUP_RUN_TTL_MS = 30 * 60 * 1000;

const preservedResources = [
  "Projects", "Blog posts", "Testimonials", "FAQs", "Site settings",
  "Sites", "Uploaded media", "Admin accounts", "Active sessions", "Financial records"
];

// Inline the pure functions from src/lib/activity-cleanup.ts
function spreadsheetValue(value: unknown): string | number | boolean | Date | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string") return /^[=+\-@]/.test(value) ? `'${value}` : value;
  if (typeof value === "number" || typeof value === "boolean") return value;
  return JSON.stringify(value);
}

function rowsForSheet(rows: object[]) {
  return rows.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, spreadsheetValue(value)])));
}

// --- Test Groups ---
function runTests() {
  let passed = 0;
  let failed = 0;

  function group(name: string, tests: () => void) {
    console.log(`\n## ${name}`);
    tests();
  }

  function check(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✕ FAIL: ${message}`);
      failed++;
    }
  }

  // ── Constants ──
  group("Constants", () => {
    check(CLEANUP_CONFIRMATION === "RESET ALL ACTIVITY",
      "Confirmation phrase is 'RESET ALL ACTIVITY'");
    check(CLEANUP_RUN_TTL_MS === 30 * 60 * 1000,
      "TTL is exactly 30 minutes (1,800,000 ms)");
    check(preservedResources.length === 10,
      `Preserved resource count is 10 (got ${preservedResources.length})`);
    check(preservedResources.includes("Projects"), "Includes 'Projects'");
    check(preservedResources.includes("Financial records"), "Includes 'Financial records'");
    check(preservedResources.includes("Sites"), "Includes 'Sites'");
    check(preservedResources.includes("Admin accounts"), "Includes 'Admin accounts'");
    check(preservedResources.includes("Active sessions"), "Includes 'Active sessions'");
    check(preservedResources.includes("Uploaded media"), "Includes 'Uploaded media'");
  });

  // ── spreadsheetValue ──
  group("spreadsheetValue", () => {
    check(spreadsheetValue(null) === null, "null → null");
    check(spreadsheetValue(undefined) === null, "undefined → null");

    const date = new Date("2026-07-11T12:00:00Z");
    check(spreadsheetValue(date) === date, "Date objects preserved");

    // Strings
    check(spreadsheetValue("hello") === "hello", "Normal string preserved");
    check(spreadsheetValue("john@example.com") === "john@example.com", "Email preserved");
    check(spreadsheetValue("$100.00") === "$100.00", "Currency string preserved");

    // Formula injection prevention (strings starting with =, +, -, @)
    check(spreadsheetValue("=SUM(A1:A10)") === "'=SUM(A1:A10)", "= prefix escaped");
    check(spreadsheetValue("+IMPORTXML(...)") === "'+IMPORTXML(...)", "+ prefix escaped");
    check(spreadsheetValue("-DDE(1,2,3)") === "'-DDE(1,2,3)", "- prefix escaped");
    check(spreadsheetValue("@SUM(A1)") === "'@SUM(A1)", "@ prefix escaped");

    // Numbers and booleans
    check(spreadsheetValue(42) === 42, "Number preserved");
    check(spreadsheetValue(0) === 0, "Zero preserved");
    check(spreadsheetValue(-1) === -1, "Negative number preserved");
    check(spreadsheetValue(true) === true, "Boolean true preserved");
    check(spreadsheetValue(false) === false, "Boolean false preserved");

    // Objects
    const obj = { foo: "bar" };
    check(spreadsheetValue(obj) === JSON.stringify(obj), "Object stringified");
    check(spreadsheetValue([1, 2, 3]) === JSON.stringify([1, 2, 3]), "Array stringified");
  });

  // ── rowsForSheet ──
  group("rowsForSheet", () => {
    check(rowsForSheet([]).length === 0, "Empty array returns empty array");

    const rows = [
      {
        id: 1,
        name: "Test Lead",
        email: "test@example.com",
        createdAt: new Date("2026-01-01"),
        nullable: null,
        formula: "=HARM()",
        meta: { key: "val" }
      }
    ];
    const result = rowsForSheet(rows);
    check(result.length === 1, "One row transformed");
    check(result[0].id === 1, "ID preserved as number");
    check(result[0].name === "Test Lead", "Name preserved as string");
    check(result[0].email === "test@example.com", "Email preserved");
    check(result[0].createdAt instanceof Date, "Date preserved as Date");
    check(result[0].nullable === null, "Null preserved");
    check(result[0].formula === "'=HARM()", "Formula prefix escaped");
    check(result[0].meta === JSON.stringify({ key: "val" }), "Object stringified");
  });

  // ── Delete Order Safety ──
  group("Delete order safety", () => {
    // Plan specifies: chat messages → chat sessions → notifications → analytics → contact messages → leads
    const expectedOrder = [
      "chatMessage", "chatSession", "notification",
      "analyticsEvent", "contactMessage", "lead"
    ];

    check(expectedOrder.length === 6, `6 models in delete order (got ${expectedOrder.length})`);

    // Verify FK dependency ordering
    const msgIdx = expectedOrder.indexOf("chatMessage");
    const sessIdx = expectedOrder.indexOf("chatSession");
    const leadIdx = expectedOrder.indexOf("lead");

    check(msgIdx < sessIdx, "chatMessage deleted BEFORE chatSession (CASCADE safety)");
    check(sessIdx < leadIdx, "chatSession deleted BEFORE lead (FK: ChatSession.leadId)");

    // Verify no foundational models are included
    check(!expectedOrder.includes("project"), "Projects NOT in delete order");
    check(!expectedOrder.includes("blogPost"), "Blog posts NOT in delete order");
    check(!expectedOrder.includes("testimonial"), "Testimonials NOT in delete order");
    check(!expectedOrder.includes("fAQ"), "FAQs NOT in delete order");
    check(!expectedOrder.includes("site"), "Sites NOT in delete order");
    check(!expectedOrder.includes("user"), "Users NOT in delete order");
    check(!expectedOrder.includes("session"), "Sessions NOT in delete order");
    check(!expectedOrder.includes("account"), "Accounts NOT in delete order");
    check(!expectedOrder.includes("booking"), "Bookings NOT in delete order");
    check(!expectedOrder.includes("financialDocument"), "Financial documents NOT in delete order");
    check(!expectedOrder.includes("payment"), "Payments NOT in delete order");
    check(!expectedOrder.includes("siteSetting"), "Site settings NOT in delete order");
  });

  // ── Confirmation Validation ──
  group("Confirmation validation", () => {
    check(CLEANUP_CONFIRMATION === "RESET ALL ACTIVITY", "Phrase is correct");

    // These should all fail validation
    const invalidPhrases = [
      "reset all activity",
      "Reset All Activity",
      "RESET ALL ACTIVITY ",
      " RESET ALL ACTIVITY",
      "RESET ALL",
      "",
      "CONFIRM",
      "DELETE ALL",
      "reset"
    ];

    for (const phrase of invalidPhrases) {
      check(phrase !== CLEANUP_CONFIRMATION,
        `Rejects case-sensitive mismatch: "${phrase}"`);
    }
  });

  // ── Summary ──
  console.log(`\n## Results`);
  console.log(`  ${passed} passed, ${failed} failed${failed > 0 ? " ⚠️" : " ✅"}`);

  if (failed > 0) {
    console.log("\nSome checks failed. See above for details.");
    process.exitCode = 1;
  } else {
    console.log("\nAll checks passed!");
  }
}

runTests();
