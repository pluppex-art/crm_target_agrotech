import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutTemplate } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";

export default async function EmailTemplatesPage() {
  const supabase = await createClient();
  const { data: rawTemplates } = await supabase
    .from("email_templates")
    .select("*")
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const templates = rawTemplates as unknown as Array<Record<string, any>> | null;

  return (
    <div>
      <PageHeader title="Templates de Email" description="Modelos reutilizáveis para campanhas">
        <Link href="/email-marketing">
          <Button variant="outline" size="sm">← Voltar</Button>
        </Link>
      </PageHeader>

      {!templates || templates.length === 0 ? (
        <div className="text-center py-16">
          <LayoutTemplate className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm font-medium">Nenhum template criado</p>
          <p className="text-xs text-muted-foreground mt-1">
            Crie templates para reutilizar em campanhas
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardContent className="p-4">
                <p className="font-semibold text-sm">{template.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{template.subject}</p>
                <p className="text-xs text-muted-foreground mt-3">
                  {formatDate(template.created_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
