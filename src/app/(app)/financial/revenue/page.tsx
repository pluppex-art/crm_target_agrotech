"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { useTransactions } from "@/hooks/useTransactions";
import { formatBRL, formatDate } from "@/lib/utils/format";
import type { ColumnDef } from "@tanstack/react-table";
import type { Transaction } from "@/lib/supabase/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TransactionForm } from "@/components/financial/TransactionForm";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const columns: ColumnDef<Transaction>[] = [
  { accessorKey: "description", header: "Descrição" },
  { accessorKey: "category", header: "Categoria" },
  { accessorKey: "date", header: "Data", cell: ({ row }) => formatDate(row.original.date) },
  {
    accessorKey: "amount",
    header: "Valor",
    cell: ({ row }) => <span className="text-green-600 font-semibold">{formatBRL(row.original.amount)}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className={`text-xs font-medium ${row.original.status === "confirmed" ? "text-green-600" : "text-muted-foreground"}`}>
        {row.original.status === "confirmed" ? "Confirmado" : row.original.status === "pending" ? "Pendente" : "Cancelado"}
      </span>
    ),
  },
];

export default function RevenuePage() {
  const { transactions, isLoading, createTransaction } = useTransactions("revenue");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  return (
    <div>
      <PageHeader title="Receitas" description="Entradas financeiras">
        <Link href="/financial"><Button variant="outline" size="sm">← Voltar</Button></Link>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />Nova Receita
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <DataTable columns={columns} data={transactions} searchKey="description" searchPlaceholder="Buscar receita..." />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Receita</DialogTitle></DialogHeader>
          <TransactionForm
            type="revenue"
            onSubmit={async (data) => {
              setSaving(true);
              try { await createTransaction(data as never); setOpen(false); } finally { setSaving(false); }
            }}
            onCancel={() => setOpen(false)}
            isLoading={saving}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
