import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/ui/code-block";

function isInternalHref(href?: string) {
  return Boolean(href && (href.startsWith("/") || href.startsWith("#")));
}

export function BlogMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h2 className="text-balance font-display text-3xl font-black leading-tight text-[color:var(--text-strong)]">{children}</h2>,
        h2: ({ children }) => <h2 className="text-balance font-display text-2xl font-black leading-tight text-[color:var(--text-strong)]">{children}</h2>,
        h3: ({ children }) => <h3 className="text-balance text-xl font-bold leading-snug text-[color:var(--text-strong)]">{children}</h3>,
        p: ({ children }) => <p>{children}</p>,
        ul: ({ children }) => <ul className="list-disc space-y-2 pl-6">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal space-y-2 pl-6">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        a: ({ children, href }) =>
          isInternalHref(href) ? (
            <Link href={href!} className="text-[color:var(--primary)] underline decoration-[color:var(--primary)]/40 underline-offset-2 transition hover:decoration-[color:var(--primary)]">
              {children}
            </Link>
          ) : (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[color:var(--primary)] underline decoration-[color:var(--primary)]/40 underline-offset-2 transition hover:decoration-[color:var(--primary)]"
            >
              {children}
            </a>
          ),
        code: ({ children, className }) => {
          if (!className) {
            return (
              <code className="rounded bg-[color:var(--surface-soft)] px-1.5 py-0.5 font-mono text-[0.925em] text-[color:var(--accent-light)]">
                {children}
              </code>
            );
          }

          return <CodeBlock className={className}>{children}</CodeBlock>;
        },
        pre: ({ children }) => <>{children}</>,
        blockquote: ({ children }) => <blockquote className="border-l-2 border-[color:var(--primary)]/30 pl-5 italic text-[color:var(--text-muted)]">{children}</blockquote>,
        hr: () => <hr className="border-[color:var(--border-subtle)]" />
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
