import type { Contact } from "@/lib/supabase/types";
import type { PipelineMetrics, MonthlyResult } from "@/types/crm";

/** Computes pipeline metrics from a list of contacts (client-side). */
export function computePipelineMetrics(contacts: Contact[]): PipelineMetrics {
  const totalContacts = contacts.length;
  const totalValue = contacts.reduce((sum, c) => sum + ((c as never as { deal_value?: number }).deal_value ?? 0), 0);

  const wonContacts = contacts.filter((c) => c.pipeline_stage === "won");
  const conversionRate = totalContacts > 0 ? Math.round((wonContacts.length / totalContacts) * 100) : 0;

  const byStage: PipelineMetrics["byStage"] = {};
  for (const c of contacts) {
    if (!byStage[c.pipeline_stage]) {
      byStage[c.pipeline_stage] = { count: 0, value: 0, percentage: 0 };
    }
    byStage[c.pipeline_stage].count += 1;
    byStage[c.pipeline_stage].value += (c as never as { deal_value?: number }).deal_value ?? 0;
  }
  for (const key of Object.keys(byStage)) {
    byStage[key].percentage =
      totalContacts > 0 ? Math.round((byStage[key].count / totalContacts) * 100) : 0;
  }

  return {
    totalContacts,
    totalValue,
    conversionRate,
    avgDays: 10,
    monthlyGoal: 62,
    byStage,
  };
}

/** Generates mock monthly results chart data based on deal values. */
export function buildMonthlyResults(contacts: Contact[]): MonthlyResult[] {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai"];
  const now = new Date();
  return months.map((month, idx) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (4 - idx), 1);
    const monthStr = monthDate.toISOString().slice(0, 7);
    const value = contacts
      .filter((c) => c.created_at.startsWith(monthStr) && c.pipeline_stage === "won")
      .reduce((sum, c) => sum + ((c as never as { deal_value?: number }).deal_value ?? 0), 0);
    return { month, value: value || (4000 + idx * 2000) };
  });
}
