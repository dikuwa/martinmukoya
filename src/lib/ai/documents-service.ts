import "server-only";

import { getDocumentsModel, getDocumentsOpenAI } from "@/lib/ai/openai-clients";

export type WritingSurface = "blog" | "business-document" | "template";
export type WritingAction =
  | "generate" | "improve" | "rewrite" | "professional" | "persuasive" | "friendly"
  | "concise" | "expand" | "shorten" | "grammar" | "structure" | "missing-sections"
  | "missing-clauses" | "summarise" | "seo-title" | "excerpt" | "tags" | "seo-description";

export type WritingRequest = {
  surface: WritingSurface;
  action: WritingAction;
  title?: string;
  subject?: string;
  content?: string;
  selectedText?: string;
  notes?: string;
  category?: string;
  tags?: string[];
  keywords?: string[];
  audience?: string;
  tone?: string;
  style?: string;
  length?: string;
  documentType?: string;
  templateName?: string;
  context?: Record<string, string | number | boolean | null | undefined>;
};

const actionInstructions: Record<WritingAction, string> = {
  generate: "Generate complete, polished Markdown content from the supplied facts and notes.",
  improve: "Improve clarity, structure, flow, and usefulness while preserving supported facts.",
  rewrite: "Rewrite the supplied selected text or content while preserving its meaning and facts.",
  professional: "Rewrite in a more professional tone.", persuasive: "Make the writing more persuasive without inventing claims.",
  friendly: "Make the writing warmer and friendlier.", concise: "Make the writing more concise without losing essential facts.",
  expand: "Expand with useful structure and explanation, without adding unsupported facts.", shorten: "Shorten substantially while retaining essential meaning.",
  grammar: "Correct grammar, spelling, punctuation, and awkward phrasing.", structure: "Improve headings, ordering, and overall Markdown structure.",
  "missing-sections": "Add clearly useful missing sections, using neutral placeholders where facts are unavailable.",
  "missing-clauses": "Add relevant missing clauses, clearly marking details that require human review.",
  summarise: "Produce a concise summary of the supplied content.",
  "seo-title": "Return only one compelling SEO title, with no label or commentary.",
  excerpt: "Return only a concise blog excerpt, with no label or commentary.",
  tags: "Return only relevant comma-separated tags, with no label or commentary.",
  "seo-description": "Return only one concise SEO meta description, with no label or commentary."
};

export async function runDocumentsWritingAssistant(input: WritingRequest) {
  const instructions = `You are the private writing assistant for Martin Mukoya and FlexTech Media.
Work only from facts supplied in the request. Never fabricate client details, prices, dates, registration numbers, legal facts, project facts, or promises.
Keep business documents concise, practical, and suitable for a small digital agency. Avoid repetitive explanations, unnecessary legal language, and long introductions. Use short paragraphs, clear headings, and compact lists.
If required information is missing, omit it or use a clearly marked neutral placeholder.
Return editable Markdown unless the requested action explicitly asks for a single metadata value.
Never publish, issue, send, sign, or accept anything.
Contracts, agreements, and legal-style wording require human review and must remain drafts.
Do not include analysis, preambles, or fenced Markdown around the result.`;

  const response = await getDocumentsOpenAI().responses.create({
    model: getDocumentsModel(),
    instructions,
    input: JSON.stringify({ task: actionInstructions[input.action], ...input }),
    max_output_tokens: input.action === "seo-title" || input.action === "excerpt" || input.action === "tags" || input.action === "seo-description" ? 300 : 4_000
  }, { timeout: 60_000 });
  const output = response.output_text.trim();
  if (!output) throw new Error("The documents model returned an empty response.");
  return output;
}
