"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { can, type Resource, type Action } from "@/lib/utils/permissions";
import type { Role } from "@/lib/utils/constants";
import type { RolePermission } from "@/lib/supabase/types";
import { useUserRole } from "@/components/layout/UserRoleProvider";

let cachedOverrides: RolePermission[] | null = null;

export function usePermission(resource: Resource, action: Action): boolean {
  const roleFromContext = useUserRole();
  const [overrides, setOverrides] = useState<RolePermission[]>([]);

  useEffect(() => {
    const supabase = createClient();

    async function loadOverrides() {
      if (!cachedOverrides) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any).from("role_permissions").select("*");
        cachedOverrides = data ?? [];
      }
      setOverrides(cachedOverrides ?? []);
    }

    loadOverrides();
  }, []);

  const role: Role | null = roleFromContext;
  if (!role) return false;

  const roleOverrides = overrides
    .filter((o) => o.role === role)
    .map((o) => ({
      resource: o.resource as Resource,
      action: o.action as Action,
      allowed: o.allowed,
    }));

  return can(role, resource, action, roleOverrides);
}
