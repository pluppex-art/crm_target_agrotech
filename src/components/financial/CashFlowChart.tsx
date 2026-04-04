"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/lib/utils/format";

interface ChartDataPoint {
  month: string;
  receitas: number;
  despesas: number;
}

interface CashFlowChartClientProps {
  data: ChartDataPoint[];
}

export function CashFlowChartClient({ data }: CashFlowChartClientProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Fluxo de Caixa — Últimos 6 Meses</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Tooltip formatter={(value: any, name: any) => [formatBRL(Number(value)), name === "receitas" ? "Receitas" : "Despesas"]} />
            <Legend formatter={(value) => value === "receitas" ? "Receitas" : "Despesas"} />
            <Bar dataKey="receitas" fill="hsl(160 84% 39%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="despesas" fill="hsl(0 84.2% 60.2%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
