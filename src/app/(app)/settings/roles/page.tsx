"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { PERMISSION_MATRIX, type Resource, type Action } from "@/lib/utils/permissions";
import { ROLES } from "@/lib/utils/constants";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import type { RolePermission } from "@/lib/supabase/types";

const RESOURCES: { id: Resource; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "crm", label: "CRM" },
  { id: "conversations", label: "Conversas" },
  { id: "email_marketing", label: "Email Marketing" },
  { id: "ads", label: "ADS" },
  { id: "financial", label: "Financeiro" },
  { id: "contracts", label: "Contratos" },
  { id: "settings", label: "Configurações" },
];

const ACTIONS: Action[] = ["view", "create", "edit", "delete"];
const ACTION_LABELS: Record<Action, string> = {
  view: "Ver",
  create: "Criar",
  edit: "Editar",
  delete: "Excluir",
};

type OverrideMap = Record<string, boolean>; // key: `${role}:${resource}:${action}`

export default function RolesSettingsPage() {
  const [overrides, setOverrides] = useState<OverrideMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeRole, setActiveRole] = useState<"admin" | "gestor" | "usuario">("gestor");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("role_permissions")
      .select("*")
      .then(({ data }) => {
        const map: OverrideMap = {};
        (data as RolePermission[] ?? []).forEach((p) => {
          map[`${p.role}:${p.resource}:${p.action}`] = p.allowed;
        });
        setOverrides(map);
        setLoading(false);
      });
  }, []);

  const getPermission = (role: string, resource: Resource, action: Action): boolean => {
    const key = `${role}:${resource}:${action}`;
    if (key in overrides) return overrides[key];
    return PERMISSION_MATRIX[resource]?.[action]?.includes(role as never) ?? false;
  };

  const handleToggle = (resource: Resource, action: Action, value: boolean) => {
    const key = `${activeRole}:${resource}:${action}`;
    setOverrides((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const upserts = Object.entries(overrides)
        .filter(([key]) => key.startsWith(activeRole))
        .map(([key, allowed]) => {
          const [role, resource, action] = key.split(":");
          return { role, resource, action, allowed };
        });

      if (upserts.length > 0) {
        for (const item of upserts) {
          await supabase
            .from("role_permissions")
            .upsert(item as never, { onConflict: "role,resource,action" });
        }
      }

      toast.success("Permissões salvas com sucesso!");
    } catch {
      toast.error("Erro ao salvar permissões");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Papéis e Permissões" description="Configure o acesso por papel">
        <Link href="/settings"><Button variant="outline" size="sm">← Voltar</Button></Link>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Salvando...</> : "Salvar Alterações"}
        </Button>
      </PageHeader>

      {/* Role Tabs */}
      <div className="flex gap-2 mb-6">
        {ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => setActiveRole(role.id as never)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeRole === role.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {role.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Permissões — {ROLES.find((r) => r.id === activeRole)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-8 font-medium text-muted-foreground">Recurso</th>
                    {ACTIONS.map((action) => (
                      <th key={action} className="text-center py-3 px-4 font-medium text-muted-foreground">
                        {ACTION_LABELS[action]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RESOURCES.map((resource) => (
                    <tr key={resource.id} className="border-b last:border-0">
                      <td className="py-3 pr-8 font-medium">{resource.label}</td>
                      {ACTIONS.map((action) => (
                        <td key={action} className="text-center py-3 px-4">
                          <div className="flex justify-center">
                            <Switch
                              checked={getPermission(activeRole, resource.id, action)}
                              onCheckedChange={(v) => handleToggle(resource.id, action, v)}
                              disabled={activeRole === "admin"}
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {activeRole === "admin" && (
              <p className="text-xs text-muted-foreground mt-4">
                * O papel Admin sempre tem acesso completo e não pode ser modificado.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
