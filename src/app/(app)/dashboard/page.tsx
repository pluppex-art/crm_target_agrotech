import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PipelineOverview } from "@/components/dashboard/PipelineOverview";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { Users, MessageSquare, DollarSign, FileText } from "lucide-react";
import { formatBRL } from "@/lib/utils/format";
import type { Activity, Transaction } from "@/lib/supabase/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalLeads },
    { count: openConversations },
    pipelineRes,
    activitiesRes,
    transactionsRes,
    { count: totalContracts },
  ] = await Promise.all([
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase.from("conversations").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("contacts").select("pipeline_stage"),
    supabase.from("activities").select("*, contacts(full_name)").order("created_at", { ascending: false }).limit(8),
    supabase.from("transactions").select("type, amount, date, status").eq("status", "confirmed"),
    supabase.from("contracts").select("*", { count: "exact", head: true }),
  ]);

  const pipelineData = pipelineRes.data as unknown as Array<{ pipeline_stage: string }>;
  const recentActivities = activitiesRes.data as unknown as Array<Activity & { contacts?: { full_name: string } | null }>;
  const transactions = transactionsRes.data as unknown as Array<Pick<Transaction, "type" | "amount" | "date" | "status">>;

  // Pipeline counts
  const pipelineCounts: Record<string, number> = {};
  pipelineData?.forEach((c) => {
    pipelineCounts[c.pipeline_stage] = (pipelineCounts[c.pipeline_stage] ?? 0) + 1;
  });

  // Revenue summary
  const revenue = transactions
    ?.filter((t) => t.type === "revenue")
    .reduce((sum, t) => sum + t.amount, 0) ?? 0;

  // Last 6 months chart data
  const now = new Date();
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthStr = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    const monthRevenue = transactions
      ?.filter((t) => t.type === "revenue" && t.date?.startsWith(monthKey))
      .reduce((sum, t) => sum + t.amount, 0) ?? 0;

    const monthExpenses = transactions
      ?.filter((t) => t.type === "expense" && t.date?.startsWith(monthKey))
      .reduce((sum, t) => sum + t.amount, 0) ?? 0;

    return { month: monthStr, revenue: monthRevenue, expenses: monthExpenses };
  });

  return (
    <div>
      <PageHeader title="Dashboard" description="Visão geral do seu negócio" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Total de Contatos" value={String(totalLeads ?? 0)} icon={Users} />
        <KpiCard title="Conversas Abertas" value={String(openConversations ?? 0)} icon={MessageSquare} />
        <KpiCard title="Receita Confirmada" value={formatBRL(revenue)} icon={DollarSign} />
        <KpiCard title="Contratos" value={String(totalContracts ?? 0)} icon={FileText} />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <RevenueChart data={chartData} />
        <PipelineOverview counts={pipelineCounts} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentActivities activities={recentActivities ?? []} />
        </div>
      </div>
    </div>
  );
}
