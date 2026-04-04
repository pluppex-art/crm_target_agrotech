import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Users, Shield, Plug, ChevronRight } from "lucide-react";

const SETTINGS_SECTIONS = [
  {
    href: "/settings/users",
    icon: Users,
    title: "Usuários",
    description: "Gerencie membros da equipe, convide novos usuários e altere papéis",
  },
  {
    href: "/settings/roles",
    icon: Shield,
    title: "Papéis e Permissões",
    description: "Configure quais recursos cada papel (admin, gestor, usuario) pode acessar",
  },
  {
    href: "/settings/integrations",
    icon: Plug,
    title: "Integrações",
    description: "Configure N8N, Resend, Google Ads, Meta Ads e outros serviços",
  },
];

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Configurações" description="Gerencie as configurações do sistema" />

      <div className="max-w-2xl space-y-2">
        {SETTINGS_SECTIONS.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <section.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{section.title}</p>
                    <p className="text-xs text-muted-foreground">{section.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
