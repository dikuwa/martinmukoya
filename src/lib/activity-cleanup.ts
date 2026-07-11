import * as XLSX from "xlsx";
import { db } from "@/lib/db";

export const CLEANUP_CONFIRMATION = "RESET ALL ACTIVITY";
export const CLEANUP_RUN_TTL_MS = 30 * 60 * 1000;

export type ActivityCounts = {
  leads: number;
  contactMessages: number;
  chatSessions: number;
  chatMessages: number;
  analyticsEvents: number;
  notifications: number;
  bookings: number;
  financialDocuments: number;
  documentLineItems: number;
  payments: number;
};

export const preservedResources = [
  "Projects", "Blog posts", "Testimonials", "FAQs", "Site settings",
  "Sites", "Uploaded media", "Admin accounts", "Active sessions", "Business documents", "Document templates"
];

export async function countActivity(cutoffAt = new Date()): Promise<ActivityCounts> {
  const createdAt = { lte: cutoffAt };
  const [leads, contactMessages, chatSessions, chatMessages, analyticsEvents, notifications, bookings, financialDocuments, documentLineItems, payments] = await Promise.all([
    db.lead.count({ where: { createdAt } }),
    db.contactMessage.count({ where: { createdAt } }),
    db.chatSession.count({ where: { createdAt } }),
    db.chatMessage.count({ where: { createdAt } }),
    db.analyticsEvent.count({ where: { createdAt } }),
    db.notification.count({ where: { createdAt } }),
    db.booking.count({ where: { createdAt } }),
    db.financialDocument.count({ where: { createdAt } }),
    db.documentLineItem.count({ where: { document: { createdAt } } }),
    db.payment.count({ where: { createdAt } })
  ]);
  return { leads, contactMessages, chatSessions, chatMessages, analyticsEvents, notifications, bookings, financialDocuments, documentLineItems, payments };
}

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

export async function createActivityWorkbook(cutoffAt: Date) {
  const createdAt = { lte: cutoffAt };
  const [leads, contactMessages, chatSessions, chatMessages, analyticsEvents, notifications, bookings, financialDocuments, documentLineItems, payments] = await Promise.all([
    db.lead.findMany({ where: { createdAt }, orderBy: { createdAt: "asc" } }),
    db.contactMessage.findMany({ where: { createdAt }, orderBy: { createdAt: "asc" } }),
    db.chatSession.findMany({ where: { createdAt }, orderBy: { createdAt: "asc" } }),
    db.chatMessage.findMany({ where: { createdAt }, orderBy: { createdAt: "asc" } }),
    db.analyticsEvent.findMany({ where: { createdAt }, orderBy: { createdAt: "asc" } }),
    db.notification.findMany({ where: { createdAt }, orderBy: { createdAt: "asc" } }),
    db.booking.findMany({ where: { createdAt }, orderBy: { createdAt: "asc" } }),
    db.financialDocument.findMany({ where: { createdAt }, orderBy: { createdAt: "asc" } }),
    db.documentLineItem.findMany({ where: { document: { createdAt } }, orderBy: { sortOrder: "asc" } }),
    db.payment.findMany({ where: { createdAt }, orderBy: { createdAt: "asc" } })
  ]);
  const counts: ActivityCounts = {
    leads: leads.length, contactMessages: contactMessages.length,
    chatSessions: chatSessions.length, chatMessages: chatMessages.length,
    analyticsEvents: analyticsEvents.length, notifications: notifications.length,
    bookings: bookings.length, financialDocuments: financialDocuments.length,
    documentLineItems: documentLineItems.length, payments: payments.length
  };
  const workbook = XLSX.utils.book_new();
  const summary = [
    { field: "Export cutoff (UTC)", value: cutoffAt.toISOString() },
    ...Object.entries(counts).map(([field, value]) => ({ field, value }))
  ];
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summary), "Summary");
  const sheets: Array<[string, object[]]> = [
    ["Leads", leads], ["Contact Messages", contactMessages], ["Chat Sessions", chatSessions],
    ["Chat Messages", chatMessages], ["Analytics", analyticsEvents], ["Notifications", notifications],
    ["Bookings", bookings], ["Financial Documents", financialDocuments], ["Document Line Items", documentLineItems], ["Payments", payments]
  ];
  for (const [name, rows] of sheets) {
    const sheet = rows.length ? XLSX.utils.json_to_sheet(rowsForSheet(rows)) : XLSX.utils.aoa_to_sheet([["No records"]]);
    XLSX.utils.book_append_sheet(workbook, sheet, name);
  }
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx", cellDates: true });
  return { buffer, counts };
}
