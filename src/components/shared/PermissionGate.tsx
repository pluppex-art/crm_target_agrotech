"use client";

import { usePermission } from "@/hooks/usePermission";
import type { Resource, Action } from "@/lib/utils/permissions";

interface PermissionGateProps {
  resource: Resource;
  action: Action;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  resource,
  action,
  children,
  fallback = null,
}: PermissionGateProps) {
  const allowed = usePermission(resource, action);
  return allowed ? <>{children}</> : <>{fallback}</>;
}
