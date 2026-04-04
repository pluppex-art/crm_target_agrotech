import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";

export default async function EmailListsPage() {
  const supabase = await createClient();
  const { data: rawLists } = await supabase
    .from("email_lists")
    .select("*, email_list_members(count)")
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lists = rawLists as unknown as Array<Record<string, any>> | null;

  return (
    <div>
      <PageHeader title="Listas de Email" description="Gerencie seus grupos de contatos">
        <Link href="/email-marketing">
          <Button variant="outline" size="sm">← Voltar</Button>
        </Link>
      </PageHeader>

      {!lists || lists.length === 0 ? (
        <div className="text-center py-16">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm font-medium">Nenhuma lista criada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map((list) => (
            <Card key={list.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">{list.name}</p>
                    {list.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{list.description}</p>
                    )}
                  </div>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Criada em {formatDate(list.created_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
