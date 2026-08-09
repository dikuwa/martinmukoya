import "dotenv/config";
import dotenv from "dotenv";
import { BusinessDocumentType, BusinessDocumentStatus } from "../src/generated/prisma/client";
import { getDb } from "../src/lib/db";

dotenv.config({ path: ".env.local", override: true });

const db = getDb();
const adminEmail = process.env.ADMIN_EMAIL ?? "info@martinmukoya.com";

/**
 * Creates test documents with known IDs so E2E tests can navigate to
 * them directly without going through the UI creation flow.
 *
 * Run AFTER the main seed (pnpm db:seed):
 *   npx tsx prisma/seed-e2e.ts
 */
async function main() {
  const admin = await db.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error("Admin user not found. Run the main seed first: pnpm db:seed");
    process.exit(1);
  }

  const site = await db.site.findFirst({ where: { slug: "martin-mukoya" } });
  if (!site) {
    console.error("Default site not found. Run the main seed first: pnpm db:seed");
    process.exit(1);
  }

  // ── Business Document ──
  const bizDocId = "e2e-test-biz-doc";
  const existingBiz = await db.businessDocument.findUnique({ where: { id: bizDocId } });

  if (!existingBiz) {
    await db.businessDocument.create({
      data: {
        id: bizDocId,
        documentNumber: "PRO-E2E-001",
        documentType: BusinessDocumentType.PROPOSAL,
        status: BusinessDocumentStatus.DRAFT,
        title: "E2E Test Proposal — Website Redesign",
        subject: "Re: Website redesign for E2E testing",
        siteId: site.id,
        companyName: "E2E Corp",
        recipientName: "E2E Test Client",
        recipientEmail: "e2e-client@example.com",
        contentMarkdown: [
          "# Project Overview",
          "",
          "This is a proposal for a complete website redesign.",
          "",
          "## Scope of Work",
          "",
          "- **Homepage** redesign with modern UI",
          "- **Services page** with detailed offerings",
          "- **Contact form** with validation",
          "",
          "---",
          "",
          "## Timeline",
          "",
          "- [ ] Phase 1: Design (2 weeks)",
          "- [x] Phase 2: Development (4 weeks)",
          "- [ ] Phase 3: Testing (1 week)",
          "",
          "## Budget",
          "",
          "| Item | Cost |",
          "| --- | --- |",
          "| Design | N$8,000 |",
          "| Development | N$12,000 |",
          "| Testing & deployment | N$5,000 |",
        ].join("\n"),
        senderName: "Martin Mukoya",
        senderRole: "Managing Director",
        createdById: admin.id,
        internalNotes: "E2E test document — safe to delete.",
      },
    });
    console.log(`Created business document: ${bizDocId}`);
  } else {
    console.log(`Business document ${bizDocId} already exists — skipping.`);
  }

  console.log("E2E seed data ready");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
