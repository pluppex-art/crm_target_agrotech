import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Users, LayoutTemplate, BarChart3 } from "lucide-react";
import type { EmailCampaign } from "@/lib/supabase/types";

export default async function EmailMarketingPage() {
  const supabase = await createClient();

  const [{ data: campaigns }, { data: lists }] = await Promise.all([
    supabase
      .from("email_campaigns")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("email_lists").select("id"),
  ]);

  return (
    <div>
      <PageHeader title="Email Marketing" description="Gerencie suas campanhas de email">
        <Link href="/email-marketing/campaigns/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Campanha
          </Button>
        </Link>
      </PageHeader>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <Link href="/email-marketing/lists">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-3 p-4">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Listas</p>
                <p className="text-xs text-muted-foreground">{lists?.length ?? 0} listas</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/email-marketing/templates">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-3 p-4">
              <LayoutTemplate className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Templates</p>
                <p className="text-xs text-muted-foreground">Modelos salvos</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Campanhas</p>
              <p className="text-xs text-muted-foreground">{campaigns?.length ?? 0} total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Campanhas</CardTitle>
        </CardHeader>
        <CardContent>
          {!campaigns || campaigns.length === 0 ? (
            <div className="text-center py-10">
              <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">Nenhuma campanha ainda</p>
              <p className="text-xs text-muted-foreground mt-1">
                Crie sua primeira campanha de email
              </p>
              <Link href="/email-marketing/campaigns/new">
                <Button size="sm" className="mt-3">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Campanha
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {(campaigns as EmailCampaign[]).map((campaign) => {
                const stats = campaign.stats as { sent?: number; opened?: number; clicked?: number } ?? {};
                return (
                  <div key={campaign.id} className="flex items-center justify-between py-3 gap-4">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/email-marketing/campaigns/${campaign.id}`}
                        className="text-sm font-medium hover:text-primary truncate block"
                      >
                        {campaign.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{campaign.subject}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{stats.sent ?? 0} enviados</span>
                      <span>{stats.opened ?? 0} abertos</span>
                      <span>{stats.clicked ?? 0} cliques</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge type="campaign" value={campaign.status} />
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {formatDate(campaign.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
