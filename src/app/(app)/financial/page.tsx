import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL, formatDate } from "@/lib/utils/format";
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CashFlowChartClient } from "@/components/financial/CashFlowChart";
import type { Transaction } from "@/lib/supabase/types";

export default async function FinancialPage() {
  const supabase = await createClient();

  const { data: rawTransactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("status", "confirmed")
    .order("date", { ascending: false });

  const transactions = rawTransactions as unknown as Transaction[] | null;

  const revenue = transactions
    ?.filter((t) => t.type === "revenue")
    .reduce((sum, t) => sum + t.amount, 0) ?? 0;

  const expenses = transactions
    ?.filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0) ?? 0;

  const balance = revenue - expenses;

  // Last 6 months chart data
  const now = new Date();
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthStr = d.toLocaleDateString("pt-BR", { month: "short" });
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    return {
      month: monthStr,
      receitas: transactions?.filter((t) => t.type === "revenue" && t.date?.startsWith(monthKey))
        .reduce((sum, t) => sum + t.amount, 0) ?? 0,
      despesas: transactions?.filter((t) => t.type === "expense" && t.date?.startsWith(monthKey))
        .reduce((sum, t) => sum + t.amount, 0) ?? 0,
    };
  });

  const recentTransactions = transactions?.slice(0, 10) ?? [];

  return (
    <div>
      <PageHeader title="Financeiro" description="Controle de receitas, despesas e fluxo de caixa">
        <Link href="/financial/revenue">
          <Button variant="outline" size="sm">
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Receitas
          </Button>
        </Link>
        <Link href="/financial/expenses">
          <Button variant="outline" size="sm">
            <ArrowDownLeft className="h-4 w-4 mr-2" />
            Despesas
          </Button>
        </Link>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Receitas</p>
              <p className="text-xl font-bold text-green-600">{formatBRL(revenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Despesas</p>
              <p className="text-xl font-bold text-red-600">{formatBRL(expenses)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${balance >= 0 ? "bg-primary/10" : "bg-red-100"}`}>
              <DollarSign className={`h-5 w-5 ${balance >= 0 ? "text-primary" : "text-red-600"}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saldo</p>
              <p className={`text-xl font-bold ${balance >= 0 ? "text-primary" : "text-red-600"}`}>
                {formatBRL(balance)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <CashFlowChartClient data={chartData} />

      {/* Recent transactions */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <p className="text-xs text-muted-foreground">{t.category} · {formatDate(t.date)}</p>
                  </div>
                  <span className={`text-sm font-semibold ${t.type === "revenue" ? "text-green-600" : "text-red-600"}`}>
                    {t.type === "revenue" ? "+" : "-"}{formatBRL(t.amount)}
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
