"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { can, type Resource, type Action } from "@/lib/utils/permissions";
import type { Role } from "@/lib/utils/constants";
import type { RolePermission } from "@/lib/supabase/types";

let cachedOverrides: RolePermission[] | null = null;

export function usePermission(resource: Resource, action: Action): boolean {
  const [role, setRole] = useState<Role | null>(null);
  const [overrides, setOverrides] = useState<RolePermission[]>([]);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: rawProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profile = rawProfile as unknown as { role: string } | null;
      if (profile) setRole(profile.role as Role);

      if (!cachedOverrides) {
        const { data } = await supabase.from("role_permissions").select("*");
        cachedOverrides = data ?? [];
      }
      setOverrides(cachedOverrides);
    }

    load();
  }, []);

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
