import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import Link from "next/link";
import { formatDate, formatBRL } from "@/lib/utils/format";
import type { Contract } from "@/lib/supabase/types";

type ContractWithContact = Contract & {
  contacts?: { full_name: string } | null;
};

export default async function ContractsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contracts")
    .select("*, contacts(full_name)")
    .order("created_at", { ascending: false });

  const contracts = data as unknown as ContractWithContact[];

  return (
    <div>
      <PageHeader title="Contratos" description="Gerencie contratos e assinaturas">
        <Link href="/contracts/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Contrato
          </Button>
        </Link>
      </PageHeader>

      {!contracts || contracts.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm font-medium">Nenhum contrato criado</p>
          <p className="text-xs text-muted-foreground mt-1">Crie seu primeiro contrato</p>
          <Link href="/contracts/new">
            <Button size="sm" className="mt-3">
              <Plus className="h-4 w-4 mr-2" />Novo Contrato
            </Button>
          </Link>
        </div>
      ) : (
        <div className="divide-y border rounded-lg overflow-hidden">
          {contracts.map((contract) => (
            <div key={contract.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
              <div className="flex-1 min-w-0">
                <Link href={`/contracts/${contract.id}`} className="text-sm font-medium hover:text-primary">
                  {contract.title}
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {contract.contacts?.full_name ?? "Sem contato"} · {formatDate(contract.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {contract.value && (
                  <span className="text-sm font-semibold hidden sm:block">{formatBRL(contract.value)}</span>
                )}
                <StatusBadge type="contract" value={contract.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
