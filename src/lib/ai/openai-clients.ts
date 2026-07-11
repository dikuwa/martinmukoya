import "server-only";

import OpenAI from "openai";

function getRequiredServerEnv(name: "OPENAI_CHATBOT_API_KEY" | "OPENAI_DOCUMENTS_API_KEY") {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required server environment variable: ${name}`);
  return value;
}

let chatbotClient: OpenAI | null = null;
let documentsClient: OpenAI | null = null;

export function getChatbotOpenAI() {
  if (!chatbotClient) chatbotClient = new OpenAI({ apiKey: getRequiredServerEnv("OPENAI_CHATBOT_API_KEY") });
  return chatbotClient;
}

export function getDocumentsOpenAI() {
  if (!documentsClient) documentsClient = new OpenAI({ apiKey: getRequiredServerEnv("OPENAI_DOCUMENTS_API_KEY") });
  return documentsClient;
}

export function getChatbotModel() {
  return process.env.OPENAI_CHATBOT_MODEL?.trim() || "gpt-4.1-mini";
}

export function getDocumentsModel() {
  return process.env.OPENAI_DOCUMENTS_MODEL?.trim() || "gpt-4.1";
}
