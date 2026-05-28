/**
 * Lightweight email and phone validation for lead capture.
 *
 * - Email: standard format check plus domain-part sanity.
 * - Phone: accepts international (+264…), local (0…), or plain
 *   digit strings with punctuation.  At least 7 digits required.
 */

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "10minutemail.com",
  "throwaway.email",
  "yopmail.com",
  "trashmail.com",
]);

/**
 * Validate an email address.
 *
 * Returns `true` for well-formed addresses that use a non-trivial
 * domain (skips obvious throwaway domains).  Empty strings are
 * considered valid (field was optional).
 */
export function validateEmail(email: string): boolean {
  if (!email || !email.trim()) return true; // optional field
  const trimmed = email.trim();
  if (!EMAIL_REGEX.test(trimmed)) return false;

  const domain = trimmed.split("@")[1]?.toLowerCase();
  if (domain && DISPOSABLE_DOMAINS.has(domain)) return false;

  return true;
}

/**
 * Strip common phone punctuation.
 */
function stripPhone(raw: string): string {
  return raw.replace(/[\s\-\(\)\.\+]/g, "");
}

/**
 * Validate a phone number.
 *
 * Accepts numbers with or without an international prefix as long
 * as they contain 7–15 digits (E.164 range).  Empty strings are
 * considered valid (field was optional).
 */
export function validatePhone(phone: string): boolean {
  if (!phone || !phone.trim()) return true; // optional field
  const digits = stripPhone(phone);
  // At least 7 digits, at most 15 digits (E.164 max)
  return /^\d{7,15}$/.test(digits);
}
