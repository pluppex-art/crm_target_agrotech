/**
 * Auth middleware helpers.
 * Note: Next.js 16 uses proxy.ts for route-level auth guards.
 * These utilities are for use inside server components and API routes.
 */

import { createClient } from "@/lib/supabase/server";

/** Returns the authenticated user's profile, or null if not authenticated. */
export async function getAuthUser() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;

  const { data: profile } = await db
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile ?? null;
}

/** Asserts that the current request is authenticated; throws if not. */
export async function requireAuth() {
  const profile = await getAuthUser();
  if (!profile) throw new Error("Unauthorized");
  return profile;
}

/** Asserts that the current request belongs to an admin user. */
export async function requireAdmin() {
  const profile = await requireAuth();
  if (profile.role !== "admin") throw new Error("Forbidden");
  return profile;
}
