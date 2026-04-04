import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PipelineOverview } from "@/components/dashboard/PipelineOverview";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { Users, MessageSquare, Target, TrendingUp } from "lucide-react";
import type { Activity } from "@/lib/supabase/types";

export default async function SalesDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalLeads },
    { count: openConversations },
    pipelineRes,
    activitiesRes,
  ] = await Promise.all([
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .eq("status", "open"),
    supabase.from("contacts").select("pipeline_stage"),
    supabase
      .from("activities")
      .select("*, contacts(full_name)")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const pipelineData = pipelineRes.data as unknown as Array<{ pipeline_stage: string }>;
  const recentActivities = activitiesRes.data as unknown as Array<
    Activity & { contacts?: { full_name: string } | null }
  >;

  // Pipeline counts
  const pipelineCounts: Record<string, number> = {};
  pipelineData?.forEach((c) => {
    pipelineCounts[c.pipeline_stage] = (pipelineCounts[c.pipeline_stage] ?? 0) + 1;
  });

  const total = totalLeads ?? 0;
  const won = pipelineCounts["won"] ?? 0;
  const lost = pipelineCounts["lost"] ?? 0;
  const active = total - won - lost;
  const conversionRate = total > 0 ? Math.round((won / total) * 100) : 0;

  // New leads this month
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const { count: newLeadsThisMonth } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .gte("created_at", `${monthKey}-01`);

  return (
    <div>
      <PageHeader
        title="Dashboard de Vendas"
        description="Pipeline, conversões e atividades de vendas"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Total de Leads"
          value={String(total)}
          icon={Users}
        />
        <KpiCard
          title="Em Negociação"
          value={String(active)}
          icon={TrendingUp}
        />
        <KpiCard
          title="Taxa de Conversão"
          value={`${conversionRate}%`}
          icon={Target}
        />
        <KpiCard
          title="Novos Leads (Mês)"
          value={String(newLeadsThisMonth ?? 0)}
          icon={MessageSquare}
        />
      </div>

      {/* Pipeline + Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PipelineOverview counts={pipelineCounts} />
        </div>
        <div>
          <RecentActivities activities={recentActivities ?? []} />
        </div>
      </div>
    </div>
  );
}
