export const ROLES = [
  { id: "admin", label: "Administrador" },
  { id: "gestor", label: "Gestor" },
  { id: "usuario", label: "Usuário" },
] as const;

export type Role = "admin" | "gestor" | "usuario";
