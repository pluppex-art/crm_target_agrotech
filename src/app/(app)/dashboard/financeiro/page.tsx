import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { CashFlowChartClient } from "@/components/financial/CashFlowChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, ArrowRight } from "lucide-react";
import { formatBRL, formatDate } from "@/lib/utils/format";
import type { Transaction } from "@/lib/supabase/types";

export default async function FinancialDashboardPage() {
  const supabase = await createClient();

  const { data: rawTransactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("status", "confirmed")
    .order("date", { ascending: false });

  const transactions = rawTransactions as unknown as Transaction[] | null;

  // All-time totals
  const totalRevenue =
    transactions?.filter((t) => t.type === "revenue").reduce((sum, t) => sum + t.amount, 0) ?? 0;
  const totalExpenses =
    transactions?.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0) ?? 0;
  const netBalance = totalRevenue - totalExpenses;

  // Current month totals
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthRevenue =
    transactions
      ?.filter((t) => t.type === "revenue" && t.date?.startsWith(monthKey))
      .reduce((sum, t) => sum + t.amount, 0) ?? 0;
  const monthExpenses =
    transactions
      ?.filter((t) => t.type === "expense" && t.date?.startsWith(monthKey))
      .reduce((sum, t) => sum + t.amount, 0) ?? 0;
  const monthResult = monthRevenue - monthExpenses;

  // Last 6 months chart data
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return {
      month: d.toLocaleDateString("pt-BR", { month: "short" }),
      receitas:
        transactions
          ?.filter((t) => t.type === "revenue" && t.date?.startsWith(mKey))
          .reduce((sum, t) => sum + t.amount, 0) ?? 0,
      despesas:
        transactions
          ?.filter((t) => t.type === "expense" && t.date?.startsWith(mKey))
          .reduce((sum, t) => sum + t.amount, 0) ?? 0,
    };
  });

  const recentTransactions = transactions?.slice(0, 5) ?? [];

  return (
    <div>
      <PageHeader
        title="Dashboard Financeiro"
        description="Fluxo de caixa, receitas e despesas"
      >
        <Link href="/financial">
          <Button variant="outline" size="sm">
            Gestão Financeira
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Receita do Mês"
          value={formatBRL(monthRevenue)}
          icon={TrendingUp}
          trend={
            monthRevenue > 0
              ? { value: Math.round((monthRevenue / (totalRevenue || 1)) * 100), label: "do total" }
              : undefined
          }
        />
        <KpiCard
          title="Despesas do Mês"
          value={formatBRL(monthExpenses)}
          icon={TrendingDown}
          trend={
            monthExpenses > 0
              ? { value: -Math.round((monthExpenses / (totalExpenses || 1)) * 100), label: "do total" }
              : undefined
          }
        />
        <KpiCard
          title="Resultado do Mês"
          value={formatBRL(Math.abs(monthResult))}
          icon={BarChart3}
          trend={
            monthResult !== 0
              ? { value: monthResult >= 0 ? Math.abs(monthResult) : -Math.abs(monthResult), label: monthResult >= 0 ? "positivo" : "negativo" }
              : undefined
          }
        />
        <KpiCard
          title="Saldo Total"
          value={formatBRL(Math.abs(netBalance))}
          icon={DollarSign}
          trend={
            netBalance !== 0
              ? { value: netBalance >= 0 ? 1 : -1, label: netBalance >= 0 ? "saldo positivo" : "saldo negativo" }
              : undefined
          }
        />
      </div>

      {/* Cash Flow Chart */}
      <div className="mb-6">
        <CashFlowChartClient data={chartData} />
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Transações Recentes</CardTitle>
          <Link href="/financial">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              Ver todas
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma transação confirmada
            </p>
          ) : (
            <div className="divide-y">
              {recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{t.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.category} · {formatDate(t.date)}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      t.type === "revenue" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.type === "revenue" ? "+" : "-"}
                    {formatBRL(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
