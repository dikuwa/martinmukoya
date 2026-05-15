import { Activity } from "lucide-react";

export function AiChartWidget() {
  return (
    <aside className="pointer-events-none hidden xl:block">
      <div className="fixed right-8 top-[calc(72px+2rem)] w-[22rem] rounded-[32px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)]/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.14)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--text-faint)]">AI insight</p>
            <p className="mt-2 text-sm font-semibold text-[color:var(--text-strong)]">Performance snapshot</p>
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[color:var(--accent)]/15 text-[color:var(--accent)]">
            <Activity size={18} />
          </span>
        </div>
        <div className="mt-5 overflow-hidden rounded-[22px] bg-white/[0.04] p-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 rounded-[18px] bg-[color:var(--accent)] p-2 text-right text-[10px] font-semibold uppercase tracking-[0.28em] text-white">90%</div>
            <div className="w-2 rounded-full bg-white/[0.12]" style={{ height: "2.5rem" }} />
            <div className="w-2 rounded-full bg-white/[0.12]" style={{ height: "1.6rem" }} />
            <div className="w-2 rounded-full bg-white/[0.12]" style={{ height: "2.1rem" }} />
            <div className="w-2 rounded-full bg-[rgba(198,97,63,0.82)]" style={{ height: "3rem" }} />
          </div>
          <div className="mt-4 grid gap-3">
            <div className="rounded-[18px] bg-black/5 p-3 text-sm text-[color:var(--text-muted)]">
              <p className="font-semibold text-[color:var(--text-strong)]">Lead fit</p>
              <p className="mt-1 text-xs">Most enquiries are now aligned with your ideal client types.</p>
            </div>
            <div className="rounded-[18px] bg-black/5 p-3 text-sm text-[color:var(--text-muted)]">
              <p className="font-semibold text-[color:var(--text-strong)]">Delivery clarity</p>
              <p className="mt-1 text-xs">Timeline and budget signals are being captured on first contact.</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
