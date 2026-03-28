import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Megaphone, TrendingUp, MousePointer, Eye, DollarSign } from "lucide-react";
import { formatBRL, formatDate } from "@/lib/utils/format";
import Link from "next/link";
import type { AdCampaign } from "@/lib/supabase/types";

const PLATFORM_CONFIG = {
  google: { label: "Google Ads", color: "bg-blue-100 text-blue-700" },
  meta: { label: "Meta Ads", color: "bg-indigo-100 text-indigo-700" },
};

export default async function AdsPage() {
  const supabase = await createClient();
  const { data: rawCampaigns } = await supabase
    .from("ad_campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  const campaigns = rawCampaigns as unknown as AdCampaign[];

  // Aggregate metrics
  const totals = campaigns?.reduce(
    (acc, c) => {
      const m = c.metrics as { impressions?: number; clicks?: number; conversions?: number; spend?: number } ?? {};
      return {
        impressions: acc.impressions + (m.impressions ?? 0),
        clicks: acc.clicks + (m.clicks ?? 0),
        conversions: acc.conversions + (m.conversions ?? 0),
        spend: acc.spend + (m.spend ?? 0),
      };
    },
    { impressions: 0, clicks: 0, conversions: 0, spend: 0 }
  ) ?? { impressions: 0, clicks: 0, conversions: 0, spend: 0 };

  return (
    <div>
      <PageHeader title="ADS" description="Gerencie suas campanhas de anúncios">
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Nova Campanha
        </Button>
      </PageHeader>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Impressões", value: totals.impressions.toLocaleString("pt-BR"), icon: Eye },
          { label: "Cliques", value: totals.clicks.toLocaleString("pt-BR"), icon: MousePointer },
          { label: "Conversões", value: totals.conversions.toLocaleString("pt-BR"), icon: TrendingUp },
          { label: "Gasto Total", value: formatBRL(totals.spend), icon: DollarSign },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Campaigns */}
      {!campaigns || campaigns.length === 0 ? (
        <div className="text-center py-16">
          <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm font-medium">Nenhuma campanha</p>
          <p className="text-xs text-muted-foreground mt-1">
            Conecte suas contas Google Ads e Meta Ads nas Configurações
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => {
            const metrics = campaign.metrics as { impressions?: number; clicks?: number; conversions?: number; spend?: number } ?? {};
            const platform = PLATFORM_CONFIG[campaign.platform];
            return (
              <Card key={campaign.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${platform.color}`}>
                      {platform.label}
                    </span>
                    <StatusBadge
                      type="custom"
                      value={campaign.status}
                      customLabel={campaign.status === "active" ? "Ativo" : campaign.status === "paused" ? "Pausado" : campaign.status === "ended" ? "Encerrado" : "Rascunho"}
                      customColor={campaign.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}
                    />
                  </div>
                  <CardTitle className="text-sm mt-2">{campaign.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Impressões</p>
                      <p className="font-semibold">{(metrics.impressions ?? 0).toLocaleString("pt-BR")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cliques</p>
                      <p className="font-semibold">{(metrics.clicks ?? 0).toLocaleString("pt-BR")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Conversões</p>
                      <p className="font-semibold">{metrics.conversions ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gasto</p>
                      <p className="font-semibold">{formatBRL(metrics.spend ?? 0)}</p>
                    </div>
                  </div>
                  {campaign.budget_daily && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Budget diário: {formatBRL(campaign.budget_daily)}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
