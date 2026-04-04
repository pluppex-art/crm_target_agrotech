"use client";

import { createContext, useContext } from "react";
import type { Role } from "@/lib/utils/constants";

const RoleContext = createContext<Role | null>(null);

export function UserRoleProvider({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}

export function useUserRole(): Role | null {
  return useContext(RoleContext);
}
