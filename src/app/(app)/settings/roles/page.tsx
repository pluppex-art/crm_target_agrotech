"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { PERMISSION_MATRIX, type Resource, type Action } from "@/lib/utils/permissions";
import { ROLES } from "@/lib/utils/constants";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { RolePermission } from "@/lib/supabase/types";

// ─── Config ──────────────────────────────────────────────────────────────────

const RESOURCE_GROUPS: { label: string; items: { id: Resource; label: string; description: string }[] }[] = [
  {
    label: "Análise",
    items: [
      { id: "dashboard", label: "Dashboard", description: "Dashboard de vendas e financeiro" },
    ],
  },
  {
    label: "Vendas",
    items: [
      { id: "crm", label: "Pipeline / Clientes", description: "Funil de vendas, leads e contatos" },
      { id: "contracts", label: "Contratos", description: "Criação e gestão de contratos" },
    ],
  },
  {
    label: "Comunicação",
    items: [
      { id: "conversations", label: "Conversas", description: "Mensagens e atendimentos" },
      { id: "email_marketing", label: "Email Marketing", description: "Campanhas e listas de envio" },
      { id: "ads", label: "ADS", description: "Campanhas de anúncios" },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { id: "financial", label: "Financeiro", description: "Receitas, despesas e fluxo de caixa" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { id: "settings", label: "Configurações", description: "Usuários, papéis e integrações" },
    ],
  },
];

const ACTIONS: { id: Action; label: string }[] = [
  { id: "view", label: "Ver" },
  { id: "create", label: "Criar" },
  { id: "edit", label: "Editar" },
  { id: "delete", label: "Excluir" },
];

const ROLE_META: Record<string, { icon: React.ElementType; color: string; description: string }> = {
  admin: {
    icon: ShieldCheck,
    color: "text-primary",
    description: "Acesso completo a todas as funcionalidades do sistema.",
  },
  gestor: {
    icon: ShieldAlert,
    color: "text-yellow-600",
    description: "Supervisor de equipe. Pode gerenciar operações e visualizar relatórios.",
  },
  usuario: {
    icon: Shield,
    color: "text-muted-foreground",
    description: "Usuário operacional. Acesso limitado às funções do dia a dia.",
  },
};

type OverrideMap = Record<string, boolean>;

// ─── RoleCard ─────────────────────────────────────────────────────────────────

function RoleCard({
  roleId,
  overrides,
  onToggle,
  onSave,
  saving,
}: {
  roleId: "admin" | "gestor" | "usuario";
  overrides: OverrideMap;
  onToggle: (role: string, resource: Resource, action: Action, value: boolean) => void;
  onSave: (role: string) => void;
  saving: boolean;
}) {
  const role = ROLES.find((r) => r.id === roleId)!;
  const meta = ROLE_META[roleId];
  const Icon = meta.icon;
  const isAdmin = roleId === "admin";

  const getPermission = (resource: Resource, action: Action): boolean => {
    const key = `${roleId}:${resource}:${action}`;
    if (key in overrides) return overrides[key];
    return PERMISSION_MATRIX[resource]?.[action]?.includes(roleId as never) ?? false;
  };

  return (
    <Card className={cn("flex flex-col", isAdmin && "opacity-80")}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-muted", meta.color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">{role.label}</CardTitle>
            <CardDescription className="text-xs mt-0.5">{meta.description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-5">
        {RESOURCE_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {group.label}
            </p>
            <div className="space-y-3">
              {group.items.map((resource) => (
                <div key={resource.id} className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-sm font-medium mb-0.5">{resource.label}</p>
                  <p className="text-xs text-muted-foreground mb-2">{resource.description}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {ACTIONS.map((action) => {
                      const checked = getPermission(resource.id, action.id);
                      return (
                        <label
                          key={action.id}
                          className={cn(
                            "flex flex-col items-center gap-1.5 rounded-md border px-2 py-2 text-xs font-medium transition-colors cursor-pointer select-none",
                            checked
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground",
                            isAdmin && "cursor-not-allowed opacity-60"
                          )}
                        >
                          <Checkbox
                            checked={checked}
                            disabled={isAdmin}
                            onCheckedChange={(v) =>
                              onToggle(roleId, resource.id, action.id, Boolean(v))
                            }
                          />
                          {action.label}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>

      <div className="px-6 pb-5 pt-3 border-t mt-auto">
        {isAdmin ? (
          <p className="text-xs text-muted-foreground text-center">
            Admin sempre tem acesso completo — não editável.
          </p>
        ) : (
          <Button className="w-full" size="sm" onClick={() => onSave(roleId)} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              "Salvar Permissões"
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RolesSettingsPage() {
  const [overrides, setOverrides] = useState<OverrideMap>({});
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("role_permissions")
      .select("*")
      .then(({ data }: { data: RolePermission[] | null }) => {
        const map: OverrideMap = {};
        (data ?? []).forEach((p) => {
          map[`${p.role}:${p.resource}:${p.action}`] = p.allowed;
        });
        setOverrides(map);
        setLoading(false);
      });
  }, []);

  const handleToggle = useCallback(
    (role: string, resource: Resource, action: Action, value: boolean) => {
      const key = `${role}:${resource}:${action}`;
      setOverrides((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleSave = useCallback(
    async (role: string) => {
      setSavingRole(role);
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = supabase as any;

        const upserts = Object.entries(overrides)
          .filter(([key]) => key.startsWith(`${role}:`))
          .map(([key, allowed]) => {
            const [r, resource, action] = key.split(":");
            return { role: r, resource, action, allowed };
          });

        for (const item of upserts) {
          await db
            .from("role_permissions")
            .upsert(item, { onConflict: "role,resource,action" });
        }

        toast.success(`Permissões do ${ROLES.find((r) => r.id === role)?.label} salvas!`);
      } catch {
        toast.error("Erro ao salvar permissões");
      } finally {
        setSavingRole(null);
      }
    },
    [overrides]
  );

  return (
    <div>
      <PageHeader
        title="Papéis e Permissões"
        description="Configure o que cada perfil pode acessar e fazer"
      >
        <Link href="/settings">
          <Button variant="outline" size="sm">
            ← Voltar
          </Button>
        </Link>
      </PageHeader>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROLES.map((role) => (
            <RoleCard
              key={role.id}
              roleId={role.id}
              overrides={overrides}
              onToggle={handleToggle}
              onSave={handleSave}
              saving={savingRole === role.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
