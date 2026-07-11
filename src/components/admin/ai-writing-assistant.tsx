"use client";

import { useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { DashboardSelect } from "@/components/ui/dashboard-select";

type Action = "generate" | "improve" | "professional" | "concise" | "expand" | "grammar" | "structure" | "seo-title" | "excerpt" | "tags" | "seo-description";
type Props = {
  title: string; content: string; category?: string; tags?: string[];
  onApplyContent: (value: string) => void;
  onApplyMetadata: (action: Action, value: string) => void;
};

const actions: Array<{ value: Action; label: string }> = [
  { value: "generate", label: "Generate from title" }, { value: "improve", label: "Improve content" },
  { value: "professional", label: "More professional" }, { value: "concise", label: "Make concise" },
  { value: "expand", label: "Expand" }, { value: "grammar", label: "Fix grammar" },
  { value: "structure", label: "Improve structure" }, { value: "excerpt", label: "Generate excerpt" },
  { value: "seo-title", label: "Generate SEO title" }, { value: "seo-description", label: "Generate SEO description" },
  { value: "tags", label: "Generate tags" }
];

const tones = ["Professional", "Formal", "Friendly", "Persuasive", "Direct", "Technical", "Simple", "Executive"];
const styles = ["Structured", "Concise", "Detailed", "Conversational", "Marketing-style"];
const lengths = ["Short", "Medium", "Long"];

export function AiWritingAssistant({ title, content, category, tags, onApplyContent, onApplyMetadata }: Props) {
  const [action, setAction] = useState<Action>("generate");
  const [tone, setTone] = useState("Professional");
  const [style, setStyle] = useState("Structured");
  const [length, setLength] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  async function run() {
    if (!title.trim() && !content.trim()) return toast.error("Add a title, rough idea, or existing content first.");
    setLoading(true); setSuggestion(null);
    try {
      const response = await fetch("/api/admin/ai/writing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ surface: "blog", action, title, content, category, tags, tone, style, length }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "AI request failed.");
      setSuggestion(payload.output);
    } catch (error) { toast.error(error instanceof Error ? error.message : "AI request failed."); }
    finally { setLoading(false); }
  }

  function apply() {
    if (!suggestion) return;
    if (["seo-title", "excerpt", "tags", "seo-description"].includes(action)) onApplyMetadata(action, suggestion);
    else onApplyContent(suggestion);
    setSuggestion(null); toast.success("AI suggestion applied. Review and save when ready.");
  }

  return <div className="rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-3">
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-black text-[color:var(--primary)]"><Sparkles size={14}/>AI writing</span>
      <DashboardSelect
        value={action}
        onChange={(e) => setAction(e.target.value as Action)}
        options={actions}
        placeholder="Select action"
        className="w-auto"
      />
      <DashboardSelect
        value={tone}
        onChange={(e) => setTone(e.target.value)}
        options={tones.map(t => ({ value: t, label: t }))}
        placeholder="Tone"
        className="w-auto"
      />
      <DashboardSelect
        value={style}
        onChange={(e) => setStyle(e.target.value)}
        options={styles.map(s => ({ value: s, label: s }))}
        placeholder="Style"
        className="w-auto"
      />
      <DashboardSelect
        value={length}
        onChange={(e) => setLength(e.target.value)}
        options={lengths.map(l => ({ value: l, label: l }))}
        placeholder="Length"
        className="w-auto"
      />
      <Button type="button" size="sm" onClick={run} disabled={loading}>
        {loading ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14}/>}
        {loading ? "Writing…" : "Run"}
      </Button>
    </div>
    {suggestion ? (
      <div className="mt-3 rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold">Preview suggestion</p>
          <button type="button" aria-label="Discard suggestion" onClick={() => setSuggestion(null)}><X size={15}/></button>
        </div>
        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap font-sans text-xs leading-5 text-[color:var(--text-muted)]">{suggestion}</pre>
        <div className="mt-3 flex gap-2">
          <Button type="button" size="sm" onClick={apply}>Apply suggestion</Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => setSuggestion(null)}>Discard</Button>
        </div>
      </div>
    ) : null}
    <p className="mt-2 text-[11px] text-[color:var(--text-faint)]">AI never publishes or saves automatically. Review all output before use.</p>
  </div>;
}