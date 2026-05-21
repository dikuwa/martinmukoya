"use client";

import { type KeyboardEvent, useCallback, useRef, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/ui/code-block";
import { Bold, Code2, Columns2, Eye, Heading, Image as ImageIcon, List, Link as LinkIcon, PencilLine } from "lucide-react";

interface BlogEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

type ViewMode = "write" | "split" | "preview";

function insertAtCursor(textarea: HTMLTextAreaElement, before: string, after = "") {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end);
  const insertion = selected ? `${before}${selected}${after}` : before;
  const newValue =
    textarea.value.slice(0, start) + insertion + textarea.value.slice(end);
  return { value: newValue, cursorPos: start + insertion.length };
}

const toolbarButtons = [
  {
    label: "Heading",
    icon: "heading",
    action: (ta: HTMLTextAreaElement) => insertAtCursor(ta, "## ", ""),
  },
  {
    label: "Inline code",
    icon: "code",
    action: (ta: HTMLTextAreaElement) => insertAtCursor(ta, "`", "`"),
  },
  {
    label: "Bold",
    icon: "bold",
    action: (ta: HTMLTextAreaElement) => insertAtCursor(ta, "**", "**"),
  },
  {
    label: "Bullet list",
    icon: "list",
    action: (ta: HTMLTextAreaElement) => insertAtCursor(ta, "- "),
  },
  {
    label: "Insert link",
    icon: "link",
    action: (ta: HTMLTextAreaElement) => insertAtCursor(ta, "[text](url)"),
  },
  {
    label: "Insert image",
    icon: "image",
    action: (ta: HTMLTextAreaElement) => insertAtCursor(ta, "![alt](url)"),
  },
];

const iconComponents = {
  heading: Heading,
  code: Code2,
  bold: Bold,
  list: List,
  link: LinkIcon,
  image: ImageIcon,
} as const;

function PreviewPane({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none p-6 text-base leading-8 text-[color:var(--text-normal)]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 mt-8 font-display text-3xl font-black leading-tight text-[color:var(--text-strong)] first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-6 font-display text-2xl font-black leading-tight text-[color:var(--text-strong)] first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-5 text-xl font-bold leading-snug text-[color:var(--text-strong)] first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-5 last:mb-0 leading-8">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-[color:var(--text-strong)]">
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="mb-5 space-y-2 pl-6 list-disc last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-5 space-y-2 pl-6 list-decimal last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-7">
              {children}
            </li>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[color:var(--primary)]/40 underline-offset-2 text-[color:var(--primary-light)] hover:decoration-[color:var(--primary)] transition"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-5 border-l-2 border-[color:var(--primary)]/30 pl-5 italic text-[color:var(--text-muted)] last:mb-0">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="inline rounded bg-[color:var(--surface-soft)] px-1.5 py-0.5 text-sm font-mono text-[color:var(--accent-light)]">
                  {children}
                </code>
              );
            }
            return <CodeBlock className={className}>{children}</CodeBlock>;
          },
          pre: ({ children }) => <>{children}</>,
          hr: () => (
            <hr className="my-6 border-[color:var(--border-subtle)]" />
          ),
          img: ({ src, alt }) => {
            const imageSrc = typeof src === "string" ? src : "";

            return (
              <div className="mb-5 overflow-hidden rounded-[calc(var(--radius,1rem))] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] last:mb-0">
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={imageSrc}
                    alt={alt ?? ""}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 720px"
                  />
                </div>
              </div>
            );
          },
          table: ({ children }) => (
            <div className="mb-5 overflow-x-auto last:mb-0">
              <table className="w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-4 py-2 text-left font-bold text-[color:var(--text-strong)]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-[color:var(--border-subtle)] px-4 py-2">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export function BlogEditor({ value, onChange, error }: BlogEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [view, setView] = useState<ViewMode>("split");

  const handleToolbarAction = useCallback(
    (action: (ta: HTMLTextAreaElement) => { value: string; cursorPos: number }) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const result = action(ta);
      onChange(result.value);
      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(result.cursorPos, result.cursorPos);
      });
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Tab inserts 2 spaces
      if (e.key === "Tab") {
        e.preventDefault();
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newValue =
          ta.value.slice(0, start) + "  " + ta.value.slice(end);
        onChange(newValue);
        requestAnimationFrame(() => {
          ta.focus();
          ta.setSelectionRange(start + 2, start + 2);
        });
      }
    },
    [onChange]
  );

  // View helper: resolve effective visibility of editor and preview panes
  const editorVisible = view === "write" || view === "split";
  const previewVisible = view === "preview" || view === "split";

  return (
    <div className="grid gap-2">
      {/* Toolbar — always visible */}
      <div
        className="flex flex-wrap items-center gap-1 rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-1"
        role="toolbar"
        aria-label="Formatting tools"
      >
        {toolbarButtons.map((btn) => {
          const Icon = iconComponents[btn.icon as keyof typeof iconComponents];
          return (
            <button
              key={btn.label}
              type="button"
              onClick={() => handleToolbarAction(btn.action)}
              className="inline-flex h-9 min-w-9 items-center justify-center rounded-[0.75rem] text-xs font-bold text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/40"
              aria-label={btn.label}
              title={btn.label}
            >
              <Icon size={16} />
            </button>
          );
        })}

        {/* Spacer */}
        <span className="mx-1 h-5 w-px bg-[color:var(--border-subtle)]" />

        {/* View toggle — always visible */}
        <div className="flex items-center gap-px rounded-md bg-[color:var(--surface-soft)] p-px">
          <button
            type="button"
            role="tab"
            aria-selected={view === "write"}
            onClick={() => setView("write")}
            className={`flex items-center gap-1.5 rounded-[0.75rem] px-2.5 py-1.5 text-xs font-bold transition ${
              view === "write"
                ? "bg-[color:var(--surface)] text-[color:var(--text-strong)] shadow-sm"
                : "text-[color:var(--text-muted)] hover:text-[color:var(--text-strong)]"
            }`}
            aria-label="Write"
            title="Write"
          >
            <PencilLine size={16} />
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "split"}
            onClick={() => setView("split")}
            className={`hidden items-center gap-1.5 rounded-[0.75rem] px-2.5 py-1.5 text-xs font-bold transition md:flex ${
              view === "split"
                ? "bg-[color:var(--surface)] text-[color:var(--text-strong)] shadow-sm"
                : "text-[color:var(--text-muted)] hover:text-[color:var(--text-strong)]"
            }`}
            aria-label="Split view"
            title="Split view"
          >
            <Columns2 size={16} />
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "preview"}
            onClick={() => setView("preview")}
            className={`flex items-center gap-1.5 rounded-[0.75rem] px-2.5 py-1.5 text-xs font-bold transition ${
              view === "preview"
                ? "bg-[color:var(--surface)] text-[color:var(--text-strong)] shadow-sm"
                : "text-[color:var(--text-muted)] hover:text-[color:var(--text-strong)]"
            }`}
            aria-label="Preview"
            title="Preview"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      {/* Split layout */}
      <div className="grid gap-4" style={{ gridTemplateColumns: editorVisible && previewVisible ? "1fr 1fr" : editorVisible ? "1fr" : "1fr" }}>
        {/* Editor pane */}
        {editorVisible && (
          <div className="markdown-editor-container overflow-hidden rounded-[calc(var(--radius)*0.75)] border border-[color:var(--border-subtle)]">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="markdown-editor-scroll h-[650px] max-h-[calc(100vh-16rem)] w-full resize-none border-0 bg-[color:var(--editor-bg)] px-[1.25rem] py-[1rem] font-mono text-[0.95rem] font-normal leading-[1.75] tracking-[-0.01em] text-[color:var(--editor-text)] outline-none transition-[background-color] placeholder:text-[color:var(--editor-placeholder)] focus:bg-[color:var(--editor-bg-active)] focus:shadow-none focus-visible:shadow-none focus-visible:outline-none"
              placeholder="Write your blog content here using Markdown..."
              spellCheck
              aria-label="Blog content editor"
            />
          </div>
        )}

        {/* Preview pane */}
        {previewVisible && (
          <div
            className="markdown-preview-scroll h-[650px] max-h-[calc(100vh-16rem)] overflow-y-auto rounded-[calc(var(--radius)*0.75)] border border-[color:var(--border-subtle)] bg-[color:var(--background)]"
            role="region"
            aria-label="Markdown preview"
          >
            {value.trim() ? (
              <PreviewPane content={value} />
            ) : (
              <div className="flex h-full items-center justify-center p-6">
                <p className="text-sm text-[color:var(--text-faint)]">
                  Preview will appear here as you type...
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {error ? (
        <span className="text-xs text-[color:var(--destructive)]">{error}</span>
      ) : null}
    </div>
  );
}
