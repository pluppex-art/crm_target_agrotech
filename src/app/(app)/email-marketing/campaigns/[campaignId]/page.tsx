import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";
import { Mail, Users, MousePointer, AlertCircle } from "lucide-react";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  const supabase = await createClient();

  const { data: rawCampaign } = await supabase
    .from("email_campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const campaign = rawCampaign as unknown as Record<string, any> | null;

  if (!campaign) notFound();

  const stats = campaign.stats as { sent?: number; opened?: number; clicked?: number; bounced?: number } ?? {};

  return (
    <div>
      <PageHeader title={campaign.name}>
        <StatusBadge type="campaign" value={campaign.status} />
        <Link href="/email-marketing">
          <Button variant="outline" size="sm">← Voltar</Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Enviados", value: stats.sent ?? 0, icon: Mail },
          { label: "Abertos", value: stats.opened ?? 0, icon: Users },
          { label: "Cliques", value: stats.clicked ?? 0, icon: MousePointer },
          { label: "Bounces", value: stats.bounced ?? 0, icon: AlertCircle },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preview do Email</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="border rounded-md p-4 text-sm max-h-96 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: campaign.body_html }}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalhes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Assunto</p>
              <p className="font-medium">{campaign.subject}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Remetente</p>
              <p className="font-medium">{campaign.from_name} &lt;{campaign.from_email}&gt;</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Criado em</p>
              <p className="font-medium">{formatDate(campaign.created_at)}</p>
            </div>
            {campaign.sent_at && (
              <div>
                <p className="text-muted-foreground text-xs">Enviado em</p>
                <p className="font-medium">{formatDate(campaign.sent_at)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
