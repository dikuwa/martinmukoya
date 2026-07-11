/**
 * Convert a phone number to international WhatsApp format.
 * Supports Namibian local formats (081, 085, 061) and international numbers.
 */
export function formatWhatsAppNumber(phone?: string | null, whatsAppNumber?: string | null, phoneIsWhatsApp?: boolean): string | null {
  const raw = (whatsAppNumber || (phoneIsWhatsApp !== false ? phone : null)) || null;
  if (!raw) return null;

  // Remove spaces, dashes, brackets, parentheses, and other non-digit characters (keep leading +)
  let cleaned = raw.replace(/[\s\-\(\)\[\]]+/g, "").trim();

  // Strip any non-digit prefix except leading +
  const hasPlus = cleaned.startsWith("+");
  cleaned = cleaned.replace(/^\+/, "").replace(/\D/g, "");

  if (!cleaned) return null;

  // Namibian mobile: 081xxxxxxx, 085xxxxxxx → 26481xxxxxxx
  if (/^(081|085|061)/.test(cleaned) && cleaned.length <= 10) {
    cleaned = "264" + cleaned.slice(1);
  }
  // If it starts with 0 but not a Namibian mobile pattern, remove leading 0
  else if (cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }
  // If it has a plus, use as is
  else if (hasPlus && /^\d{7,15}$/.test(cleaned)) {
    // Already valid international format
  }

  // Validate: must be 7-15 digits for international
  if (!/^\d{7,15}$/.test(cleaned)) return null;

  return cleaned;
}

/**
 * Generate a WhatsApp deep link URL.
 */
export function generateWhatsAppUrl(number: string, message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encoded}`;
}

/**
 * Build a personalized WhatsApp message from a template or default.
 */
export function buildWhatsAppMessage(
  params: {
    recipientName?: string | null;
    documentNumber?: string | null;
    documentType?: string;
    title?: string;
    senderName?: string;
    shareLink?: string;
  },
  template?: string | null
): string {
  const recipients = params.recipientName || "client";
  const link = params.shareLink || "";
  const sender = params.senderName || "Martin Mukoya";

  if (template) {
    return template
      .replace(/\{\{recipientName\}\}/g, recipients)
      .replace(/\{\{documentNumber\}\}/g, params.documentNumber || "")
      .replace(/\{\{documentType\}\}/g, params.documentType || "document")
      .replace(/\{\{title\}\}/g, params.title || "")
      .replace(/\{\{shareLink\}\}/g, link)
      .replace(/\{\{senderName\}\}/g, sender);
  }

  const type = params.documentType || "document";
  return `Good afternoon ${recipients},\n\nPlease find your ${type.toLowerCase().replace(/_/g, " ")} below:\n${link}\n\nRegards,\n${sender}`;
}
