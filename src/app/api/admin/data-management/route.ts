import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

type DeletableModel = {
  key: string;
  label: string;
  model: string;
  description: string;
};

const PROTECTED_MODELS = [
  "user",
  "site",
  "account",
  "session",
  "verification",
  "cleanupRun",
  "documentSettings",
] as const;

const DELETABLE_MODELS: DeletableModel[] = [
  { key: "projects", label: "Projects", model: "project", description: "Portfolio projects and case studies" },
  { key: "blogPosts", label: "Blog posts", model: "blogPost", description: "Technical blog articles and tutorials" },
  { key: "leads", label: "Leads", model: "lead", description: "Project requests from start-project form" },
  { key: "contactMessages", label: "Contact messages", model: "contactMessage", description: "Contact form submissions" },
  { key: "testimonials", label: "Testimonials", model: "testimonial", description: "Client quotes and social proof" },
  { key: "faqs", label: "FAQs", model: "fAQ", description: "Frequently asked questions" },
  { key: "chatSessions", label: "Chat sessions", model: "chatSession", description: "AI chat conversations and handovers" },
  { key: "analyticsEvents", label: "Analytics events", model: "analyticsEvent", description: "Page views, CTA clicks, conversion tracking" },
  { key: "siteSettings", label: "Site settings", model: "siteSetting", description: "Contact info, availability, hero content, footer" },
  { key: "financialDocuments", label: "Financial documents", model: "financialDocument", description: "Quotes, invoices, receipts, payments" },
  { key: "bookings", label: "Bookings", model: "booking", description: "Booking records linked to financial documents" },
  { key: "businessDocuments", label: "Business documents", model: "businessDocument", description: "Proposals, contracts, agreements, SOWs" },
  { key: "businessTemplates", label: "Document templates", model: "businessDocumentTemplate", description: "Reusable templates for business documents" },
  { key: "sharedDocuments", label: "Shared documents", model: "sharedDocument", description: "Public share links for documents" },
  { key: "notifications", label: "Notifications", model: "notification", description: "Admin notification records" },
];

function getModel(modelName: string) {
  return (db as unknown as Record<string, {
    count: () => Promise<number>;
    findMany: () => Promise<unknown[]>;
    deleteMany: () => Promise<{ count: number }>;
    createMany: (args: { data: unknown[]; skipDuplicates: boolean }) => Promise<{ count: number }>;
  }>)[modelName];
}

async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const userRole = (session.user as { role?: string }).role;
  if (userRole !== "ADMIN") return null;
  return session.user;
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  const format = url.searchParams.get("format") ?? "json";

  if (action === "counts") {
    const counts = await Promise.all(
      DELETABLE_MODELS.map(async (m) => ({
        key: m.key,
        label: m.label,
        count: await getModel(m.model).count(),
      }))
    );
    return Response.json({ counts });
  }

  if (action === "backup") {
    const backup = await createFullBackup();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup-${timestamp}.json`;

    if (format === "download") {
      return new Response(JSON.stringify(backup, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }
    return Response.json(backup);
  }

  if (action === "cleanup-runs") {
    const runs = await db.cleanupRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { admin: { select: { name: true, email: true } } },
    });
    return Response.json({ runs });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { action, selectedModels, backupData, cleanupRunId } = body;

  if (action === "delete") {
    if (!selectedModels || !Array.isArray(selectedModels) || selectedModels.length === 0) {
      return Response.json({ error: "No models selected for deletion" }, { status: 400 });
    }
    const result = await performSelectiveDelete(selectedModels, user.id);
    return Response.json(result);
  }

  if (action === "full-reset") {
    const result = await performFullReset(user.id);
    return Response.json(result);
  }

  if (action === "restore") {
    if (!backupData) {
      return Response.json({ error: "No backup data provided" }, { status: 400 });
    }
    const result = await performRestore(backupData, user.id);
    return Response.json(result);
  }

  if (action === "cleanup" && cleanupRunId) {
    const result = await performCleanupDelete(cleanupRunId, user.id);
    return Response.json(result);
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}

async function createFullBackup() {
  const backup: Record<string, unknown[]> = {};

  for (const m of DELETABLE_MODELS) {
    const model = getModel(m.model);
    if (model) {
      backup[m.key] = await model.findMany();
    }
  }

  const protectedData: Record<string, unknown[]> = {};
  for (const modelName of PROTECTED_MODELS) {
    const model = getModel(modelName);
    if (model && modelName !== "cleanupRun") {
      protectedData[modelName] = await model.findMany();
    }
  }

  return {
    metadata: {
      version: "1.0",
      timestamp: new Date().toISOString(),
      deletableModels: DELETABLE_MODELS.map((m) => m.key),
      protectedModels: PROTECTED_MODELS.filter((m) => m !== "cleanupRun"),
    },
    deletableData: backup,
    protectedData,
  };
}

async function performSelectiveDelete(selectedKeys: string[], adminId: string) {
  const toDelete = DELETABLE_MODELS.filter((m) => selectedKeys.includes(m.key));
  if (toDelete.length === 0) return { error: "No valid models selected" };

  const cleanupRun = await db.cleanupRun.create({
    data: {
      adminId,
      status: "EXPORTED",
      cutoffAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      exportedCounts: {},
    },
  });

  const deletedCounts: Record<string, number> = {};

  try {
    for (const m of toDelete) {
      const model = getModel(m.model);
      if (model) {
        const result = await model.deleteMany();
        deletedCounts[m.key] = result.count;
      }
    }

    await db.cleanupRun.update({
      where: { id: cleanupRun.id },
      data: {
        status: "COMPLETED",
        deletedCounts,
        completedAt: new Date(),
      },
    });

    return { success: true, deletedCounts, cleanupRunId: cleanupRun.id };
  } catch (error) {
    await db.cleanupRun.update({
      where: { id: cleanupRun.id },
      data: { status: "FAILED", deletedCounts },
    });
    throw error;
  }
}

async function performFullReset(adminId: string) {
  const cleanupRun = await db.cleanupRun.create({
    data: {
      adminId,
      status: "EXPORTED",
      cutoffAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      exportedCounts: {},
    },
  });

  const deletedCounts: Record<string, number> = {};

  try {
    for (const m of DELETABLE_MODELS) {
      const model = getModel(m.model);
      if (model) {
        const result = await model.deleteMany();
        deletedCounts[m.key] = result.count;
      }
    }

    await db.cleanupRun.update({
      where: { id: cleanupRun.id },
      data: {
        status: "COMPLETED",
        deletedCounts,
        completedAt: new Date(),
      },
    });

    return { success: true, deletedCounts, cleanupRunId: cleanupRun.id };
  } catch (error) {
    await db.cleanupRun.update({
      where: { id: cleanupRun.id },
      data: { status: "FAILED", deletedCounts },
    });
    throw error;
  }
}

interface BackupData {
  metadata: {
    version: string;
    timestamp: string;
    deletableModels: string[];
    protectedModels: string[];
  };
  deletableData: Record<string, unknown[]>;
  protectedData: Record<string, unknown[]>;
}

async function performRestore(backupData: BackupData, _adminId: string) {
  if (!backupData?.deletableData) {
    return { error: "Invalid backup format" };
  }

  const { deletableData, metadata } = backupData;
  const restoredCounts: Record<string, number> = {};

  try {
    for (const m of DELETABLE_MODELS) {
      const data = deletableData[m.key];
      if (!data || !Array.isArray(data)) continue;

      const model = getModel(m.model);
      if (!model) continue;

      await model.deleteMany();

      if (data.length > 0) {
        const result = await model.createMany({
          data: data.map((item: unknown) => {
            const record = item as Record<string, unknown>;
            const { id, createdAt, updatedAt, ...rest } = record;
            return {
              ...rest,
              createdAt: new Date(record.createdAt as string),
              updatedAt: new Date(record.updatedAt as string),
            };
          }),
          skipDuplicates: true,
        });
        restoredCounts[m.key] = result.count;
      }
    }

    return { success: true, restoredCounts, metadata };
  } catch (error) {
    console.error("Restore failed:", error);
    return { error: "Restore failed", details: String(error) };
  }
}

async function performCleanupDelete(cleanupRunId: string, adminId: string) {
  const run = await db.cleanupRun.findUnique({ where: { id: cleanupRunId } });
  if (!run) return { error: "Cleanup run not found" };
  if (run.adminId !== adminId) return { error: "Not authorized" };
  if (run.status !== "EXPORTED") return { error: "Already completed or failed" };

  const exportedCounts = run.exportedCounts as Record<string, number> | null;
  if (!exportedCounts) return { error: "No exported data to clean up" };

  await db.cleanupRun.update({
    where: { id: cleanupRunId },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  return { success: true, message: "Cleanup completed (placeholder - actual delete would need exported IDs)" };
}