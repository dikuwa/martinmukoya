/**
 * Buyer Intent Detection Engine
 *
 * Lightweight intent scoring system for the AI chatbot.
 * Detects when a visitor shows buying intent during conversation
 * and returns a score that can trigger an inline action card.
 *
 * HIGH_INTENT_SCORE  = 10  → triggers immediately
 * SOFT_INTENT_SCORE  = 4   → needs accumulation
 * PAIN_POINT_SCORE   = 6   → strong conversion indicator
 * TRIGGER_THRESHOLD  = 10  → minimum score to trigger
 */

// ── High intent phrases ──
export const HIGH_INTENT_PHRASES = [
  "i need a website",
  "i want a website",
  "build me a website",
  "create a website",
  "make me a website",
  "i need a developer",
  "i need a web developer",
  "can you build",
  "can you create",
  "i want to start",
  "i want to book",
  "how can we start",
  "how do i get started",
  "i need your services",
  "i want your services",
  "i want to work with you",
  "can you help my business",
  "i need automation",
  "i need ai automation",
  "i need seo",
  "i need branding",
  "i need ecommerce",
  "i need an online store",
  "i need a booking system",
  "i need a business website",
  "i need a redesign",
  "how much is a website",
  "what are your prices",
  "how much do you charge",
  "can i get a quote",
  "book a consultation",
  "schedule a consultation",
] as const;

// ── Soft intent phrases ──
export const SOFT_INTENT_PHRASES = [
  "tell me more",
  "how does this work",
  "what services do you offer",
  "show me your services",
  "what do you recommend",
  "which package is best",
  "what would work for my business",
  "can this help my business",
  "can you automate this",
  "can you fix my website",
  "can you improve my website",
  "how long does it take",
  "do you build ecommerce websites",
  "can you help with seo",
  "i need digital marketing",
  "i want to modernize my business",
] as const;

// ── Pain-point phrases ──
export const PAIN_POINT_PHRASES = [
  "my website is outdated",
  "my website is slow",
  "my website is broken",
  "my website is not getting customers",
  "we get no leads",
  "customers cant find us",
  "our booking system is manual",
  "we waste too much time",
  "too much admin work",
  "we lose customers",
  "our system is outdated",
  "we still do things manually",
] as const;

// ── Secondary buying keywords (for semantic fallback) ──
const BUYING_KEYWORDS = [
  "website",
  "build",
  "create",
  "develop",
  "design",
  "redesign",
  "ecommerce",
  "store",
  "booking",
  "automation",
  "seo",
  "branding",
  "quote",
  "price",
  "cost",
  "budget",
  "consultation",
  "services",
  "help my business",
  "leads",
  "customers",
  "online presence",
  "developer",
  "freelancer",
  "agency",
  "project",
  "start a project",
  "get started",
  "work with you",
  "hire",
  "investment",
  "roi",
  "grow",
  "growth",
] as const;

// ── Scoring constants ──
export const HIGH_INTENT_SCORE = 10;
export const SOFT_INTENT_SCORE = 4;
export const PAIN_POINT_SCORE = 6;
export const TRIGGER_THRESHOLD = 10;

// ── Helpers ──

/** Normalize text for matching */
function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
}

/** Fuzzy-phrase match: ≥60% word overlap after normalisation */
function fuzzyPhraseMatch(text: string, phrase: string): boolean {
  const textWords = text.split(/\s+/).filter((w) => w.length > 2);
  const phraseWords = phrase.split(/\s+/).filter((w) => w.length > 2);
  if (phraseWords.length < 2) return false;

  let matches = 0;
  for (const pw of phraseWords) {
    for (const tw of textWords) {
      if (tw.includes(pw) || pw.includes(tw)) {
        matches++;
        break;
      }
    }
  }

  return matches >= Math.ceil(phraseWords.length * 0.6);
}

// ── Public API ──

export type IntentResult = {
  score: number;
  triggered: boolean;
  matchedPhrases: string[];
};

/**
 * Detect buyer intent from a user's chat message.
 *
 * Scoring breakdown:
 *   - High-intent phrase match      → +10 per match
 *   - Soft-intent phrase match      → +4  per match
 *   - Pain-point phrase match       → +6  per match
 *   - Fuzzy word-overlap match      → same per-match scoring (60% word overlap)
 *   - Semantic keyword density      → up to +8  (≥2 buying keywords)
 *
 * Returns a score and whether the trigger threshold (≥10) is met.
 */
export function detectBuyerIntent(text: string): IntentResult {
  const normalized = normalize(text);
  const matchedPhrases: string[] = [];

  if (!normalized || normalized.length < 3) {
    return { score: 0, triggered: false, matchedPhrases: [] };
  }

  let score = 0;

  // ── 1. Exact / substring matching ──
  for (const phrase of HIGH_INTENT_PHRASES) {
    if (normalized.includes(phrase)) {
      score += HIGH_INTENT_SCORE;
      matchedPhrases.push(phrase);
    }
  }

  for (const phrase of SOFT_INTENT_PHRASES) {
    if (normalized.includes(phrase)) {
      score += SOFT_INTENT_SCORE;
      matchedPhrases.push(phrase);
    }
  }

  for (const phrase of PAIN_POINT_PHRASES) {
    if (normalized.includes(phrase)) {
      score += PAIN_POINT_SCORE;
      matchedPhrases.push(phrase);
    }
  }

  // ── 2. Fuzzy matching (only if below threshold to save work) ──
  if (score < TRIGGER_THRESHOLD) {
    for (const phrase of HIGH_INTENT_PHRASES) {
      if (!normalized.includes(phrase) && fuzzyPhraseMatch(normalized, phrase)) {
        score += HIGH_INTENT_SCORE;
        matchedPhrases.push(`~${phrase}`);
      }
    }

    for (const phrase of SOFT_INTENT_PHRASES) {
      if (!normalized.includes(phrase) && fuzzyPhraseMatch(normalized, phrase)) {
        score += SOFT_INTENT_SCORE;
        matchedPhrases.push(`~${phrase}`);
      }
    }

    for (const phrase of PAIN_POINT_PHRASES) {
      if (!normalized.includes(phrase) && fuzzyPhraseMatch(normalized, phrase)) {
        score += PAIN_POINT_SCORE;
        matchedPhrases.push(`~${phrase}`);
      }
    }
  }

  // ── 3. Semantic keyword density ──
  if (score < TRIGGER_THRESHOLD) {
    const keywordMatches = BUYING_KEYWORDS.filter((kw) => normalized.includes(kw));
    if (keywordMatches.length >= 2) {
      const bonus = Math.min(keywordMatches.length * 2, 8);
      score += bonus;
      matchedPhrases.push(`keywords:[${keywordMatches.slice(0, 4).join(", ")}]`);
    }
  }

  return {
    score,
    triggered: score >= TRIGGER_THRESHOLD,
    matchedPhrases,
  };
}
