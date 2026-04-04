import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Zap, Mail, Megaphone, CheckCircle, AlertCircle } from "lucide-react";

const integrations = [
  {
    id: "n8n",
    icon: Zap,
    title: "N8N — Automações e Agente IA",
    description: "Conecte o N8N para automatizar conversas, enriquecer leads e integrar com WhatsApp",
    configured: !!process.env.N8N_WEBHOOK_URL,
    docs: "Configure N8N_WEBHOOK_URL e N8N_WEBHOOK_SECRET nas variáveis de ambiente do Vercel",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
  {
    id: "resend",
    icon: Mail,
    title: "Resend — Email Marketing",
    description: "Envie campanhas de email transacional e marketing com alta entregabilidade",
    configured: !!process.env.RESEND_API_KEY,
    docs: "Configure RESEND_API_KEY nas variáveis de ambiente do Vercel",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    id: "google_ads",
    icon: Megaphone,
    title: "Google Ads",
    description: "Sincronize métricas de campanhas do Google Ads automaticamente via N8N",
    configured: false,
    docs: "Configure via N8N usando o webhook de atualização de métricas",
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
  },
  {
    id: "meta_ads",
    icon: Megaphone,
    title: "Meta Ads (Facebook/Instagram)",
    description: "Sincronize métricas de campanhas do Meta automaticamente via N8N",
    configured: false,
    docs: "Configure via N8N usando o webhook de atualização de métricas",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
  },
];

export default function IntegrationsPage() {
  return (
    <div>
      <PageHeader title="Integrações" description="Conecte serviços externos ao CRM">
        <Link href="/settings"><Button variant="outline" size="sm">← Voltar</Button></Link>
      </PageHeader>

      <div className="max-w-2xl space-y-3">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <Card key={integration.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${integration.bgColor}`}>
                    <Icon className={`h-5 w-5 ${integration.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold">{integration.title}</p>
                      {integration.configured ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted/50 rounded px-2 py-1 mt-2">
                      {integration.docs}
                    </p>
                  </div>
                  <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 shrink-0 ${
                    integration.configured ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    {integration.configured ? "Configurado" : "Pendente"}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="max-w-2xl mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Como configurar N8N + WhatsApp</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>1. Instale o N8N (Railway, Render ou VPS próprio)</p>
            <p>2. Crie um workflow com Webhook trigger apontando para este CRM</p>
            <p>3. Configure N8N_WEBHOOK_URL nas variáveis de ambiente do Vercel</p>
            <p>4. Adicione o Evolution API ou Z-API no N8N para WhatsApp</p>
            <p>5. Nas conversas, as mensagens serão automaticamente roteadas para IA ou WhatsApp</p>
            <p className="font-medium text-foreground">Webhook inbound do N8N: POST /api/webhooks/n8n</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
