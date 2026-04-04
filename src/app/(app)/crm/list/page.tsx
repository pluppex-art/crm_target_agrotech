import { createClient } from "@/lib/supabase/server";
import { CRMListClient } from "@/components/crm/CRMListClient";
import type { Contact } from "@/lib/supabase/types";

export default async function CRMListPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  return <CRMListClient initialContacts={(data as Contact[]) ?? []} />;
}
