import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Strips common markdown formatting from a string, leaving clean plain text.
 * Handles bold, italic, headers, links, images, inline code, code blocks,
 * horizontal rules, blockquotes, list markers, and strikethrough.
 */
export function stripMarkdown(text: string): string {
  return text
    // Remove code blocks first (triple backticks)
    .replace(/```[\s\S]*?```/g, "")
    // Remove inline code
    .replace(/`([^`]+)`/g, "$1")
    // Remove images ![alt](url)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    // Remove links [text](url) — keep the text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    // Remove headers # ## ### etc.
    .replace(/^#{1,6}\s+/gm, "")
    // Remove bold + italic ***text***
    .replace(/\*{3}([^*]+)\*{3}/g, "$1")
    // Remove bold **text**
    .replace(/\*{2}([^*]+)\*{2}/g, "$1")
    // Remove italic *text* (only single asterisks)
    .replace(/(?<!\*)\*(?!\*)([^*]+)(?<!\*)\*(?!\*)/g, "$1")
    // Remove bold __text__
    .replace(/_{2}([^_]+)_{2}/g, "$1")
    // Remove italic _text_
    .replace(/(?<!_)_(?!_)([^_]+)(?<!_)_(?!_)/g, "$1")
    // Remove strikethrough ~~text~~
    .replace(/~~([^~]+)~~/g, "$1")
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, "")
    // Remove blockquotes
    .replace(/^>\s+/gm, "")
    // Remove unordered list markers
    .replace(/^[\s]*[-*+]\s+/gm, "")
    // Remove ordered list markers
    .replace(/^\s*\d+\.\s+/gm, "")
    // Collapse multiple newlines into two
    .replace(/\n{3,}/g, "\n\n")
    // Trim leading/trailing whitespace
    .trim();
}
