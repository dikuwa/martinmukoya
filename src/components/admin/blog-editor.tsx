"use client";

/* eslint-disable @next/next/no-img-element */

import { type ClipboardEvent, type CSSProperties, type DragEvent, type KeyboardEvent, type PointerEvent, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";
import { remarkUnderline } from "@/lib/remark-underline";
import {
  Bold, Code2, Eye, Heading1, Heading2, Heading3, Image as ImageIcon,
  Italic, Link as LinkIcon, List, ListChecks, ListOrdered, Loader2,
  Pilcrow, Quote, Redo2, Strikethrough, Table2, Underline, Undo2,
} from "lucide-react";

interface BlogEditorProps { value: string; onChange: (value: string) => void; error?: string }

type FormatKey = "paragraph" | "h1" | "h2" | "h3" | "bold" | "italic" | "underline" | "strike" | "bullet" | "numbered" | "checklist" | "blockquote" | "link" | "table" | "code";
type FormatState = Record<FormatKey, boolean> & { undo: boolean; redo: boolean };

const initialFormatState: FormatState = {
  paragraph: true, h1: false, h2: false, h3: false, bold: false, italic: false, underline: false,
  strike: false, bullet: false, numbered: false, checklist: false, blockquote: false, link: false,
  table: false, code: false, undo: false, redo: false,
};

function inline(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
  if (!(node instanceof HTMLElement)) return "";
  const body = Array.from(node.childNodes).map(inline).join("");
  switch (node.tagName) {
    case "STRONG": case "B": return `**${body}**`;
    case "EM": case "I": return `*${body}*`;
    case "S": case "STRIKE": return `~~${body}~~`;
    case "U": return `<u>${body}</u>`;
    case "CODE": return `\`${body}\``;
    case "A": return `[${body}](${node.getAttribute("href") ?? ""})`;
    case "IMG": return `![${node.getAttribute("alt") ?? ""}](${node.getAttribute("src") ?? ""})`;
    case "BR": return "\n";
    default: return body;
  }
}

function domToMarkdown(root: HTMLElement) {
  const walk = (node: Node, depth = 0): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
    if (!(node instanceof HTMLElement)) return "";
    const children = Array.from(node.childNodes).map((child) => walk(child, depth)).join("");
    switch (node.tagName) {
      case "H1": return `# ${inline(node)}\n\n`;
      case "H2": return `## ${inline(node)}\n\n`;
      case "H3": return `### ${inline(node)}\n\n`;
      case "P": case "DIV": return `\n\n${children}\n\n`;
      case "BLOCKQUOTE": return `${inline(node).split("\n").map((line) => `> ${line}`).join("\n")}\n\n`;
      case "UL": case "OL": return `\n\n${Array.from(node.children).map((li, index) => {
        const checkbox = li.querySelector(":scope > input[type='checkbox']") as HTMLInputElement | null;
        const marker = checkbox ? `- [${checkbox.checked ? "x" : " "}]` : node.tagName === "OL" ? `${index + 1}.` : "-";
        return `${"  ".repeat(depth)}${marker} ${inline(li).trim()}\n`;
      }).join("")}\n`;
      case "PRE": return `\`\`\`\n${node.textContent ?? ""}\n\`\`\`\n\n`;
      case "TABLE": {
        const rows = Array.from(node.querySelectorAll("tr")).map((row) => Array.from(row.children).map((cell) => inline(cell).trim()));
        if (!rows.length) return "";
        return `${rows.map((row, i) => `| ${row.join(" | ")} |${i === 0 ? `\n| ${row.map(() => "---").join(" | ")} |` : ""}`).join("\n")}\n\n`;
      }
    }
    if (["STRONG", "B", "EM", "I", "S", "STRIKE", "U", "CODE", "A", "IMG", "BR"].includes(node.tagName)) return inline(node);
    return children;
  };
  return Array.from(root.childNodes).map((node) => walk(node)).join("").replace(/\n{3,}/g, "\n\n").trim();
}

const contentComponents: Components = {
  h1: ({ children }) => <h1>{children}</h1>,
  h2: ({ children }) => <h2>{children}</h2>,
  h3: ({ children }) => <h3>{children}</h3>,
  img: ({ src, alt }) => <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} />,
};

export function BlogEditor({ value, onChange, error }: BlogEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const initialContentRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);
  const savedSelection = useRef<Range | null>(null);
  const lastValue = useRef(value);
  // Keep React from reconciling the editable DOM on every keystroke (which
  // would move the browser selection/caret). The preview remains controlled.
  const initialValue = useRef(value);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [editorWidth, setEditorWidth] = useState(66.67);
  const [resizing, setResizing] = useState(false);
  const [urlAction, setUrlAction] = useState<"link" | "image" | null>(null);
  const [urlValue, setUrlValue] = useState("");
  const [formats, setFormats] = useState<FormatState>(initialFormatState);

  const updateFormats = useCallback(() => {
    const editor = editorRef.current;
    const selection = document.getSelection();
    if (!editor || !selection?.anchorNode || !editor.contains(selection.anchorNode)) return;
    const anchor = selection.anchorNode.nodeType === Node.ELEMENT_NODE ? selection.anchorNode as Element : selection.anchorNode.parentElement;
    const block = document.queryCommandValue("formatBlock").toLowerCase().replace(/[<>]/g, "");
    const inside = (selector: string) => Boolean(anchor?.closest(selector));
    setFormats({
      paragraph: !block || block === "p" || block === "div", h1: block === "h1", h2: block === "h2", h3: block === "h3",
      bold: document.queryCommandState("bold"), italic: document.queryCommandState("italic"), underline: document.queryCommandState("underline"),
      strike: document.queryCommandState("strikeThrough"), bullet: document.queryCommandState("insertUnorderedList") && !inside("li:has(input[type='checkbox'])"),
      numbered: document.queryCommandState("insertOrderedList"), checklist: inside("li:has(input[type='checkbox'])"), blockquote: block === "blockquote",
      link: inside("a"), table: inside("table"), code: block === "pre" || inside("pre"),
      undo: document.queryCommandEnabled("undo"), redo: document.queryCommandEnabled("redo"),
    });
  }, []);

  useEffect(() => { lastValue.current = value; }, [value]);

  useLayoutEffect(() => {
    if (editorRef.current && initialContentRef.current) {
      const editor = editorRef.current;
      editor.innerHTML = initialContentRef.current.innerHTML || "<p><br></p>";
      document.execCommand("defaultParagraphSeparator", false, "p");
      editor.focus({ preventScroll: true });
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      const selection = document.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      savedSelection.current = range.cloneRange();
      updateFormats();
    }
  }, [updateFormats]);

  useEffect(() => {
    const rememberSelection = () => {
      const selection = document.getSelection();
      const editor = editorRef.current;
      if (!editor || !selection?.rangeCount || !selection.anchorNode || !editor.contains(selection.anchorNode)) return;
      savedSelection.current = selection.getRangeAt(0).cloneRange();
      updateFormats();
    };
    document.addEventListener("selectionchange", rememberSelection);
    return () => document.removeEventListener("selectionchange", rememberSelection);
  }, [updateFormats]);

  const emitChange = useCallback(() => {
    if (!editorRef.current) return;
    if (!editorRef.current.innerHTML) {
      editorRef.current.innerHTML = "<p><br></p>";
      const paragraph = editorRef.current.firstChild;
      if (paragraph) {
        const range = document.createRange();
        range.selectNodeContents(paragraph);
        range.collapse(false);
        const selection = document.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        savedSelection.current = range.cloneRange();
      }
    }
    const next = domToMarkdown(editorRef.current);
    lastValue.current = next;
    onChange(next);
    updateFormats();
  }, [onChange, updateFormats]);

  const command = useCallback((name: string, argument?: string) => {
    editorRef.current?.focus();
    if (savedSelection.current) {
      const selection = document.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(savedSelection.current);
    }
    document.execCommand(name, false, argument);
    emitChange();
  }, [emitChange]);

  const upload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Choose a supported image file."); return; }
    if (file.size > 8 * 1024 * 1024) { toast.error("Image must be 8MB or smaller."); return; }
    setUploading(true);
    try {
      const body = new FormData(); body.set("file", file); body.set("folder", "blog-content");
      const response = await fetch("/api/uploads", { method: "POST", body });
      const payload = await response.json().catch(() => null) as { url?: string; error?: string } | null;
      if (!response.ok || !payload?.url) throw new Error(payload?.error || "Upload failed");
      editorRef.current?.focus();
      document.execCommand("insertImage", false, payload.url);
      emitChange(); toast.success("Image uploaded and inserted");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Image upload failed"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  }, [emitChange]);

  const openUrlInput = (action: "link" | "image") => { setUrlValue(""); setUrlAction(action); };
  const submitUrl = () => {
    const url = urlValue.trim();
    const valid = urlAction === "link" ? /^https?:\/\/|^\//i.test(url) : /^https:\/\//i.test(url);
    if (!valid) { toast.error(urlAction === "link" ? "Enter a valid HTTP(S) or internal URL." : "Enter a valid HTTPS image URL."); return; }
    command(urlAction === "link" ? "createLink" : "insertImage", url);
    setUrlAction(null); setUrlValue("");
  };
  const insertTable = () => command("insertHTML", "<table><thead><tr><th>Heading</th><th>Heading</th></tr></thead><tbody><tr><td>Cell</td><td>Cell</td></tr></tbody></table><p><br></p>");
  const insertChecklist = () => command("insertHTML", '<ul><li><input type="checkbox"> Task</li></ul><p><br></p>');

  const resizeFromClientX = useCallback((clientX: number) => {
    const bounds = splitRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const next = ((clientX - bounds.left) / bounds.width) * 100;
    setEditorWidth(Math.min(80, Math.max(20, next)));
  }, []);

  const startResize = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setResizing(true);
    resizeFromClientX(event.clientX);
  };

  const resizeWithKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    if (event.key === "Home") setEditorWidth(20);
    else if (event.key === "End") setEditorWidth(80);
    else setEditorWidth((width) => Math.min(80, Math.max(20, width + (event.key === "ArrowRight" ? 5 : -5))));
  };

  const tools = [
    ["Paragraph", Pilcrow, () => command("formatBlock", "p"), "paragraph"], ["Heading 1", Heading1, () => command("formatBlock", "h1"), "h1"], ["Heading 2", Heading2, () => command("formatBlock", "h2"), "h2"], ["Heading 3", Heading3, () => command("formatBlock", "h3"), "h3"],
    ["Bold", Bold, () => command("bold"), "bold"], ["Italic", Italic, () => command("italic"), "italic"], ["Underline", Underline, () => command("underline"), "underline"], ["Strikethrough", Strikethrough, () => command("strikeThrough"), "strike"],
    ["Bulleted list", List, () => command("insertUnorderedList"), "bullet"], ["Numbered list", ListOrdered, () => command("insertOrderedList"), "numbered"], ["Checklist", ListChecks, insertChecklist, "checklist"],
    ["Blockquote", Quote, () => command("formatBlock", "blockquote"), "blockquote"], ["Link", LinkIcon, () => openUrlInput("link"), "link"], ["Image URL", ImageIcon, () => openUrlInput("image"), null], ["Table", Table2, insertTable, "table"], ["Code block", Code2, () => command("formatBlock", "pre"), "code"],
    ["Undo", Undo2, () => command("undo"), null], ["Redo", Redo2, () => command("redo"), null],
  ] as const;

  return <div className="grid min-w-0 gap-2">
    <div role="toolbar" aria-label="Rich text formatting" className="flex flex-wrap items-center gap-1 rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-1.5">
      {tools.map(([label, Icon, action, key], i) => {
        const active = key ? formats[key] : false;
        const disabled = label === "Undo" ? !formats.undo : label === "Redo" ? !formats.redo : false;
        return <button key={label} type="button" disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={action} aria-label={label} aria-pressed={key ? active : undefined} title={label} className={`${i === 4 || i === 8 || i === 11 || i === 16 ? "ml-1 border-l border-[color:var(--border-subtle)] pl-2" : ""} ${active ? "bg-[color:var(--primary)] text-white shadow-sm" : "text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)]"} inline-flex h-9 min-w-9 items-center justify-center rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] disabled:cursor-not-allowed disabled:opacity-35`}><Icon size={16}/></button>;
      })}
      <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} aria-label="Upload and insert image" title="Upload image" className="inline-flex h-9 items-center gap-2 rounded-md px-2 text-xs font-bold text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)] disabled:opacity-50">{uploading ? <Loader2 size={16} className="animate-spin"/> : <ImageIcon size={16}/>} Upload</button>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => { const file=e.target.files?.[0]; if(file) void upload(file); }}/>
      <button type="button" onClick={() => setPreview((v) => !v)} aria-pressed={preview} className={`${preview ? "bg-[color:var(--primary)] text-white" : "text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)]"} ml-auto inline-flex h-9 items-center gap-2 rounded-md px-2 text-xs font-bold transition`}><Eye size={16}/>{preview ? "Editor" : "Preview"}</button>
    </div>
    {urlAction ? <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-2">
      <label htmlFor="blog-editor-url" className="text-xs font-bold text-[color:var(--text-muted)]">{urlAction === "link" ? "Link URL" : "Image URL"}</label>
      <input id="blog-editor-url" autoFocus value={urlValue} onChange={(event) => setUrlValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); submitUrl(); } if (event.key === "Escape") setUrlAction(null); }} placeholder={urlAction === "link" ? "https://example.com or /page" : "https://example.com/image.jpg"} className="h-9 min-w-64 flex-1 rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--background)] px-3 text-sm font-normal outline-none focus:border-[color:var(--primary)]" />
      <button type="button" onClick={submitUrl} className="h-9 rounded-md bg-[color:var(--primary)] px-4 text-xs font-bold text-white">Insert</button>
      <button type="button" onClick={() => setUrlAction(null)} className="h-9 rounded-md px-3 text-xs font-bold text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)]">Cancel</button>
    </div> : null}
    <div
      ref={splitRef}
      className={`grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,var(--editor-fr))_1rem_minmax(0,var(--preview-fr))] lg:gap-0 ${resizing ? "lg:cursor-col-resize lg:select-none" : ""}`}
      style={{ "--editor-fr": `${editorWidth}fr`, "--preview-fr": `${100 - editorWidth}fr` } as CSSProperties}
    >
      <div ref={initialContentRef} className="hidden" aria-hidden="true">
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkUnderline]} components={contentComponents}>{initialValue.current}</ReactMarkdown>
      </div>
      <div className={`${preview ? "hidden lg:block" : "block"} relative overflow-hidden rounded-xl border ${dragging ? "border-[color:var(--primary)] ring-2 ring-[color:var(--primary)]/20" : "border-[color:var(--border-subtle)]"}`}>
        {dragging && <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-[color:var(--surface)]/90 text-sm font-bold">Drop image to upload</div>}
        <div ref={editorRef} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" aria-label="Blog content editor" onInput={emitChange}
          onPaste={(e: ClipboardEvent<HTMLDivElement>) => { const file=Array.from(e.clipboardData.files).find((f)=>f.type.startsWith("image/")); e.preventDefault(); if(file) void upload(file); else command("insertText", e.clipboardData.getData("text/plain")); }}
          onDragOver={(e: DragEvent) => {e.preventDefault(); setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={(e: DragEvent) => {e.preventDefault(); setDragging(false); const file=Array.from(e.dataTransfer.files).find((f)=>f.type.startsWith("image/")); if(file) void upload(file);}}
          className="rich-blog-editor min-h-[560px] bg-[color:var(--editor-bg)] p-6 text-base font-normal leading-8 text-[color:var(--editor-text)] outline-none focus:bg-[color:var(--editor-bg-active)]" />
      </div>
      <div
        role="separator"
        aria-label="Resize editor and preview"
        aria-orientation="vertical"
        aria-valuemin={20}
        aria-valuemax={80}
        aria-valuenow={Math.round(editorWidth)}
        tabIndex={0}
        onPointerDown={startResize}
        onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) resizeFromClientX(event.clientX); }}
        onPointerUp={(event) => { event.currentTarget.releasePointerCapture(event.pointerId); setResizing(false); }}
        onPointerCancel={() => setResizing(false)}
        onKeyDown={resizeWithKeyboard}
        className="group relative hidden w-4 cursor-col-resize touch-none items-center justify-center outline-none lg:flex"
      >
        <span className={`h-20 w-1 rounded-full transition ${resizing ? "bg-[color:var(--primary)]" : "bg-[color:var(--border-subtle)] group-hover:bg-[color:var(--primary)] group-focus-visible:bg-[color:var(--primary)]"}`} />
      </div>
      <div className={`${preview ? "block" : "hidden lg:block"} min-w-0 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--background)] lg:sticky lg:top-6 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto`} role="region" aria-label="Live article preview">
        <article className="rich-blog-preview p-6 text-base font-normal leading-8"><ReactMarkdown remarkPlugins={[remarkGfm, remarkUnderline]} components={contentComponents}>{value || "Preview will appear here as you type…"}</ReactMarkdown></article>
      </div>
    </div>
    {error ? <span className="text-xs text-[color:var(--destructive)]">{error}</span> : null}
  </div>;
}
