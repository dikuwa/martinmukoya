import { Resend } from "resend";
import { ContactMessageNotificationEmail } from "@/emails/contact-message-notification";
import { LeadNotificationEmail } from "@/emails/lead-notification";
import { VisitorConfirmationEmail } from "@/emails/visitor-confirmation";

let resend: Resend | null = null;

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;

  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }

  return resend;
}

function emailConfig() {
  return {
    from: process.env.RESEND_FROM_EMAIL || "Martin Mukoya <info@martinmukoya.com>",
    adminEmail: process.env.ADMIN_EMAIL || "info@martinmukoya.com"
  };
}

export async function sendLeadNotification(lead: Parameters<typeof LeadNotificationEmail>[0]["lead"]) {
  const client = getResend();
  if (!client) return { skipped: true };

  const { from, adminEmail } = emailConfig();

  return client.emails.send({
    from,
    to: adminEmail,
    replyTo: lead.email,
    subject: `New project lead: ${lead.name}`,
    react: <LeadNotificationEmail lead={lead} />
  });
}

export async function sendContactMessageNotification(message: Parameters<typeof ContactMessageNotificationEmail>[0]["message"]) {
  const client = getResend();
  if (!client) return { skipped: true };

  const { from, adminEmail } = emailConfig();

  return client.emails.send({
    from,
    to: adminEmail,
    replyTo: message.email,
    subject: `New contact message: ${message.name}`,
    react: <ContactMessageNotificationEmail message={message} />
  });
}

export async function sendVisitorConfirmation(input: { name: string; email: string; kind: "contact" | "lead" }) {
  const client = getResend();
  if (!client) return { skipped: true };

  const { from } = emailConfig();

  return client.emails.send({
    from,
    to: input.email,
    subject: input.kind === "lead" ? "I received your project request" : "I received your message",
    react: <VisitorConfirmationEmail name={input.name} kind={input.kind} />
  });
}
