"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Clock, Target } from "lucide-react";
import type { Contact } from "@/lib/supabase/types";
import { computePipelineMetrics, buildMonthlyResults } from "@/services/dashboard.service";

interface PipelineSidebarProps {
  contacts: Contact[];
}

const DONUT_STAGES = [
  { key: "new", label: "Em Aberto", color: "#22c55e" },
  { key: "qualified", label: "Qualificação", color: "#14b8a6" },
  { key: "proposal", label: "Proposta", color: "#a855f7" },
  { key: "won", label: "Fechado", color: "#ef4444" },
];

export function PipelineSidebar({ contacts }: PipelineSidebarProps) {
  const metrics = computePipelineMetrics(contacts);
  const monthlyData = buildMonthlyResults(contacts);

  // Build donut data
  const donutData = DONUT_STAGES.map((s) => ({
    name: s.label,
    value: metrics.byStage[s.key]?.count ?? 0,
    color: s.color,
  })).filter((d) => d.value > 0);

  // Fallback data when no contacts
  const chartData = donutData.length > 0
    ? donutData
    : DONUT_STAGES.map((s, i) => ({ name: s.label, value: i === 3 ? 50 : i === 0 ? 30 : 10, color: s.color }));

  const totalDonut = chartData.reduce((s, d) => s + d.value, 0);
  const topPercent = totalDonut > 0
    ? Math.round((chartData.reduce((max, d) => (d.value > max.value ? d : max), chartData[0]).value / totalDonut) * 100)
    : 0;

  return (
    <div className="w-72 shrink-0 flex flex-col gap-4 overflow-y-auto">
      {/* Progresso */}
      <div className="rounded-xl border bg-card p-4">
        <p className="text-sm font-semibold mb-3">Progresso</p>

        <div className="relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={72}
                dataKey="value"
                strokeWidth={2}
                stroke="hsl(var(--background))"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold">{topPercent}%</span>
            <span className="text-xs text-muted-foreground">TOTAL</span>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
          {DONUT_STAGES.map((s) => {
            const count = metrics.byStage[s.key]?.count ?? 0;
            const pct = metrics.totalContacts > 0 ? Math.round((count / metrics.totalContacts) * 100) : 0;
            return (
              <div key={s.key} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-xs text-muted-foreground">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resultados (bar chart) */}
      <div className="rounded-xl border bg-card p-4">
        <p className="text-sm font-semibold mb-3">Resultados</p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              formatter={(v) =>
                new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v))
              }
              contentStyle={{
                fontSize: 11,
                borderRadius: 6,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
                color: "hsl(var(--foreground))",
              }}
            />
            <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-card p-3 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">TAXA DE CONVERSÃO</span>
            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
          </div>
          <span className="text-xl font-bold">{metrics.conversionRate}%</span>
        </div>
        <div className="rounded-xl border bg-card p-3 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">DIAS MÉDIOS</span>
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <span className="text-xl font-bold">{metrics.avgDays}</span>
        </div>
      </div>

      {/* Meta Mensal */}
      <div className="rounded-xl bg-green-600 text-white p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Target className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium opacity-80">META MENSAL</p>
          <p className="text-2xl font-bold">{metrics.monthlyGoal}%</p>
        </div>
      </div>
    </div>
  );
}
