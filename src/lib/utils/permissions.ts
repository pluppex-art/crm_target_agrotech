import type { Role } from "./constants";

export type Resource =
  | "dashboard"
  | "crm"
  | "conversations"
  | "email_marketing"
  | "ads"
  | "financial"
  | "contracts"
  | "settings";

export type Action = "view" | "create" | "edit" | "delete";

type PermissionMatrix = Record<Resource, Record<Action, Role[]>>;

// Static permission matrix — overridden by role_permissions table at runtime
export const PERMISSION_MATRIX: PermissionMatrix = {
  dashboard: {
    view: ["admin", "gestor", "usuario"],
    create: ["admin", "gestor"],
    edit: ["admin", "gestor"],
    delete: ["admin"],
  },
  crm: {
    view: ["admin", "gestor", "usuario"],
    create: ["admin", "gestor"],
    edit: ["admin", "gestor"],
    delete: ["admin"],
  },
  conversations: {
    view: ["admin", "gestor", "usuario"],
    create: ["admin", "gestor", "usuario"],
    edit: ["admin", "gestor"],
    delete: ["admin"],
  },
  email_marketing: {
    view: ["admin", "gestor"],
    create: ["admin", "gestor"],
    edit: ["admin", "gestor"],
    delete: ["admin"],
  },
  ads: {
    view: ["admin", "gestor"],
    create: ["admin", "gestor"],
    edit: ["admin", "gestor"],
    delete: ["admin"],
  },
  financial: {
    view: ["admin", "gestor"],
    create: ["admin", "gestor"],
    edit: ["admin", "gestor"],
    delete: ["admin"],
  },
  contracts: {
    view: ["admin", "gestor", "usuario"],
    create: ["admin", "gestor"],
    edit: ["admin", "gestor"],
    delete: ["admin"],
  },
  settings: {
    view: ["admin"],
    create: ["admin"],
    edit: ["admin"],
    delete: ["admin"],
  },
};

export function can(
  role: Role,
  resource: Resource,
  action: Action,
  overrides?: { resource: Resource; action: Action; allowed: boolean }[]
): boolean {
  // Check dynamic overrides first
  if (overrides) {
    const override = overrides.find(
      (o) => o.resource === resource && o.action === action
    );
    if (override !== undefined) return override.allowed;
  }
  return PERMISSION_MATRIX[resource]?.[action]?.includes(role) ?? false;
}
