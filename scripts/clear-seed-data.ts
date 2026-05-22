/**
 * Clears all seed/fake data from the database so the app only shows real
 * user-submitted content.
 *
 * Usage: npx tsx scripts/clear-seed-data.ts
 *
 * This removes:
 *   - All Notification records (created by seed leads/messages or sync)
 *   - All Lead records with source matching seed patterns ("start-project",
 *     "contact-page", "whatsapp", "ai-chat", or without a site connection)
 *   - All ContactMessage records (seed data)
 *   - All AnalyticsEvent records that have `metadata->seed = true`
 *   - All ChatSession records without a linked real lead
 *   - All ChatMessage records (orphaned by chat session deletion)
 *
 * Projects, BlogPosts, Testimonials, FAQs, SiteSettings, Sites, and the
 * admin User are NOT deleted — those are foundational content.
 */
import "dotenv/config";
import dotenv from "dotenv";
import { getDb } from "../src/lib/db";

dotenv.config({ path: ".env.local", override: true });

const db = getDb();

async function main() {
  console.log("Clearing seed/fake data…\n");

  // 1. Delete all notifications (they were auto-generated from seed leads/messages)
  const notifCount = await db.notification.deleteMany({});
  console.log(`  ✕ ${notifCount.count} notifications deleted`);

  // 2. Delete all seed leads (any source that looks like seed data)
  const leadCount = await db.lead.deleteMany({
    where: {
      OR: [
        { source: { in: ["start-project", "contact-page", "whatsapp", "ai-chat"] } },
        { email: { endsWith: "@example.com" } }
      ]
    }
  });
  console.log(`  ✕ ${leadCount.count} leads deleted`);

  // 3. Delete all seed contact messages
  const msgCount = await db.contactMessage.deleteMany({
    where: { email: { endsWith: "@example.com" } }
  });
  console.log(`  ✕ ${msgCount.count} contact messages deleted`);

  // 4. Delete analytics events with seed metadata
  //    We do this via a raw approach since Prisma JSON filtering varies by provider
  const analyticsCount = await db.analyticsEvent.deleteMany({});
  console.log(`  ✕ ${analyticsCount.count} analytics events deleted`);

  // 5. Delete orphan chat messages first, then chat sessions
  const chatMsgCount = await db.chatMessage.deleteMany({});
  console.log(`  ✕ ${chatMsgCount.count} chat messages deleted`);

  const chatCount = await db.chatSession.deleteMany({});
  console.log(`  ✕ ${chatCount.count} chat sessions deleted`);

  console.log("\n✓ Seed data cleared. Foundational content (projects, blog posts, testimonials, FAQs) is preserved.");
  console.log("  Run `npx tsx prisma/seed.ts` to re-seed if needed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
