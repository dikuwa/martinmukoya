import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { remarkUnderline } from "@/lib/remark-underline";
import { CodeBlock } from "@/components/ui/code-block";

interface MarkdownRendererProps {
  content: string;
  isUser: boolean;
}

export function MarkdownRenderer({ content, isUser }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkUnderline]}
      components={{
        p: ({ children }) => (
          <p className={`mb-1.5 last:mb-0 leading-6 ${isUser ? "text-[color:var(--text-strong)]" : "text-[color:var(--text-muted)]"}`}>
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-[color:var(--text-strong)]">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-[color:var(--text-normal)]">{children}</em>
        ),
        ul: ({ children }) => (
          <ul className="mb-1.5 last:mb-0 space-y-1 pl-4">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-1.5 last:mb-0 space-y-1 pl-4 list-decimal">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="leading-6 text-[color:var(--text-muted)] [&>strong]:text-[color:var(--text-strong)]">{children}</li>
        ),
        code: ({ children, className }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="inline rounded bg-[color:var(--surface-soft)] px-1.5 py-0.5 text-xs font-mono text-[color:var(--accent-light)]">
                {children}
              </code>
            );
          }
          return <CodeBlock className={className}>{children}</CodeBlock>;
        },
        pre: ({ children }) => <>{children}</>,
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
        h1: ({ children }) => (
          <h1 className="text-balance mb-2 text-base font-bold text-[color:var(--text-strong)]">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-balance mb-1.5 text-sm font-bold text-[color:var(--text-strong)]">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-balance mb-1 text-sm font-semibold text-[color:var(--text-strong)]">{children}</h3>
        ),
        blockquote: ({ children }) => (
          <blockquote className="text-balance mb-1.5 border-l-2 border-[color:var(--primary)]/30 pl-3 italic text-[color:var(--text-muted)]">
            {children}
          </blockquote>
        ),
        hr: () => (
          <hr className="my-2 border-[color:var(--border-subtle)]" />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
