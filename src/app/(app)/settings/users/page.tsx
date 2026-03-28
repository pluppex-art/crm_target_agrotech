import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default async function UsersSettingsPage() {
  const supabase = await createClient();
  const { data: rawProfiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profiles = rawProfiles as unknown as Array<Record<string, any>> | null;

  return (
    <div>
      <PageHeader title="Usuários" description="Gerencie os membros da equipe">
        <Link href="/settings"><Button variant="outline" size="sm">← Voltar</Button></Link>
        <Button size="sm" disabled title="Em breve: Convidar usuário">
          <UserPlus className="h-4 w-4 mr-2" />
          Convidar Usuário
        </Button>
      </PageHeader>

      <div className="max-w-2xl space-y-2">
        {profiles?.map((profile) => {
          const roleLabel = ROLES.find((r) => r.id === profile.role)?.label ?? profile.role;
          const initials = profile.full_name
            .split(" ")
            .slice(0, 2)
            .map((n: string) => n[0])
            .join("")
            .toUpperCase();

          return (
            <Card key={profile.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{profile.full_name}</p>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${
                    profile.role === "admin"
                      ? "bg-primary/10 text-primary"
                      : profile.role === "gestor"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-700"
                  }`}>
                    {roleLabel}
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {formatDate(profile.created_at)}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
