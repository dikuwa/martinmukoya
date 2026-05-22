import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentSite } from "@/lib/sites";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const site = await getCurrentSite();
    const siteFilter = site ? { siteId: site.id } : {};

    const [newLeads, newMessages, chatHandovers, recentLeads, recentMessages, recentChats] =
      await Promise.all([
        db.lead.count({ where: { ...siteFilter, status: "NEW" } }),
        db.contactMessage.count({ where: { ...siteFilter, status: "NEW" } }),
        db.chatSession.count({ where: { ...siteFilter, handedToHuman: true } }),
        db.lead.findMany({
          where: { ...siteFilter, status: "NEW" },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, name: true, projectGoal: true, status: true, createdAt: true }
        }),
        db.contactMessage.findMany({
          where: { ...siteFilter, status: "NEW" },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, name: true, inquiryType: true, message: true, createdAt: true }
        }),
        db.chatSession.findMany({
          where: { ...siteFilter, handedToHuman: true },
          orderBy: { updatedAt: "desc" },
          take: 5,
          select: { id: true, visitorId: true, summary: true, lead: { select: { name: true } }, updatedAt: true }
        })
      ]);

    const total = newLeads + newMessages + chatHandovers;

    const items: Array<{
      id: string;
      type: "lead" | "message" | "chat";
      title: string;
      detail: string;
      href: string;
      createdAt: string;
    }> = [];

    for (const lead of recentLeads) {
      items.push({
        id: lead.id,
        type: "lead",
        title: lead.name,
        detail: lead.projectGoal.slice(0, 80),
        href: `/admin/leads/${lead.id}`,
        createdAt: lead.createdAt.toISOString()
      });
    }

    for (const msg of recentMessages) {
      items.push({
        id: msg.id,
        type: "message",
        title: msg.name,
        detail: `${msg.inquiryType ?? "General"} — ${msg.message.slice(0, 80)}`,
        href: `/admin/messages/${msg.id}`,
        createdAt: msg.createdAt.toISOString()
      });
    }

    for (const chat of recentChats) {
      items.push({
        id: chat.id,
        type: "chat",
        title: chat.lead?.name ?? chat.visitorId ?? "Anonymous visitor",
        detail: chat.summary?.slice(0, 80) ?? "Handed over for follow-up",
        href: `/admin/chat/${chat.id}`,
        createdAt: chat.updatedAt.toISOString()
      });
    }

    // Sort by most recent first
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      total,
      counts: {
        leads: newLeads,
        messages: newMessages,
        chats: chatHandovers
      },
      items: items.slice(0, 10)
    });
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json(
      { total: 0, counts: { leads: 0, messages: 0, chats: 0 }, items: [] },
      { status: 500 }
    );
  }
}
