import "server-only";

import { getChatbotModel, getChatbotOpenAI } from "@/lib/ai/openai-clients";

export type ChatbotMessage = { role: "user" | "assistant"; content: string };

export async function createChatbotResponse(instructions: string, messages: ChatbotMessage[]) {
  const response = await getChatbotOpenAI().responses.create({
    model: getChatbotModel(),
    instructions,
    input: messages.map((message) => ({ role: message.role, content: message.content })),
    max_output_tokens: 800
  }, { timeout: 30_000 });
  return response.output_text.trim();
}
