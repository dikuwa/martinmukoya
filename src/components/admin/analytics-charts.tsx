"use client";

import { useMemo, type ReactNode } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area, CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type BarItem = { label: string; value: number };

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const ANIMATION_DURATION = 700;

/** Longest label that fits the Y-axis column; longer names get ellipsized (full name is in the tooltip). */
const MAX_AXIS_LABEL_CHARS = 20;

function formatCategoryTick(value: string) {
  return value.length > MAX_AXIS_LABEL_CHARS
    ? `${value.slice(0, MAX_AXIS_LABEL_CHARS - 1)}…`
    : value;
}

/* ─── Shared card chrome ──────────────────────────────────────────────────── */

function ChartCard({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card padding="md" className={cn("shadow-[var(--shadow-xs)]", className)}>
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
          {icon}
        </div>
        <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">
          {title}
        </h2>
      </div>
      {children}
    </Card>
  );
}

/* ─── BarChartCard ────────────────────────────────────────────────────────── */

export function BarChartCard({
  title,
  icon,
  items,
  animationKey,
  className,
}: {
  title: string;
  icon: ReactNode;
  items: BarItem[];
  animationKey: string;
  className?: string;
}) {
  const data = useMemo(
    () => items.map((item) => ({ name: item.label, value: item.value })),
    [items]
  );

  if (items.length === 0) {
    return (
      <ChartCard title={title} icon={icon} className={className}>
        <p className="text-sm text-[color:var(--text-muted)]">No data yet.</p>
      </ChartCard>
    );
  }

  return (
    <ChartCard title={title} icon={icon} className={className}>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 10, bottom: 0, left: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tickFormatter={formatCategoryTick}
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(107,38,217,0.06)" }}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--text-strong)",
              }}
            />
            <Bar
              dataKey="value"
              fill="var(--chart-1)"
              radius={[0, 6, 6, 0]}
              isAnimationActive={true}
              animationDuration={ANIMATION_DURATION}
              animationEasing="ease-out"
              key={animationKey}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

/* ─── DonutCard ───────────────────────────────────────────────────────────── */

export function DonutCard({
  title,
  icon,
  items,
  animationKey,
  className,
}: {
  title: string;
  icon: ReactNode;
  items: BarItem[];
  animationKey: string;
  className?: string;
}) {
  const data = useMemo(
    () => items.map((item) => ({ name: item.label, value: item.value })),
    [items]
  );

  if (items.length === 0) {
    return (
      <ChartCard title={title} icon={icon} className={className}>
        <p className="text-sm text-[color:var(--text-muted)]">No data yet.</p>
      </ChartCard>
    );
  }

  return (
    <ChartCard title={title} icon={icon} className={className}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="h-[180px] w-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                isAnimationActive={true}
                animationDuration={ANIMATION_DURATION}
                animationEasing="ease-out"
                key={animationKey}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--text-strong)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="grid min-w-0 flex-1 gap-2 text-xs">
          {data.map((item, index) => (
            <div key={item.name} className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <span className="truncate text-[color:var(--text-muted)]">
                {item.name}
              </span>
              <span className="ml-auto shrink-0 font-bold tabular-nums text-[color:var(--text-strong)]">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}

/* ─── TrendAreaChart ──────────────────────────────────────────────────────── */

export function TrendAreaChart({
  items,
  animationKey,
}: {
  items: BarItem[];
  animationKey: string;
}) {
  const data = useMemo(
    () => items.map((item) => ({ date: item.label, value: item.value })),
    [items]
  );

  if (items.length === 0) {
    return (
      <ChartCard
        title="Conversion trend"
        icon={null}
        className="xl:col-span-2"
      >
        <p className="text-sm text-[color:var(--text-muted)]">No data yet.</p>
      </ChartCard>
    );
  }

  return (
    <Card padding="md" className="shadow-[var(--shadow-xs)] xl:col-span-2">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
          <svg
            className="h-3.5 w-3.5 text-[color:var(--primary)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
            <polyline points="16,7 22,7 22,13" />
          </svg>
        </div>
        <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">
          Conversion trend
        </h2>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-subtle)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "var(--text-faint)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--text-faint)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--text-strong)",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#trendGradient)"
              isAnimationActive={true}
              animationDuration={ANIMATION_DURATION}
              animationEasing="ease-out"
              key={animationKey}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
