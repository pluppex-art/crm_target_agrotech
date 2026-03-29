import { createClient } from "@/lib/supabase/server";
import { CRMKanbanClient } from "@/components/crm/CRMKanbanClient";
import type { Contact } from "@/lib/supabase/types";

export default async function CRMPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  return <CRMKanbanClient initialContacts={(data as Contact[]) ?? []} />;
}
