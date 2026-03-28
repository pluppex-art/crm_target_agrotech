"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContactForm, type ContactFormData } from "@/components/crm/ContactForm";
import { useContacts } from "@/hooks/useContacts";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { Loader2 } from "lucide-react";
import type { Contact } from "@/lib/supabase/types";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils/format";

const columns: ColumnDef<Contact>[] = [
  {
    accessorKey: "full_name",
    header: "Nome",
    cell: ({ row }) => (
      <Link href={`/crm/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.full_name}
      </Link>
    ),
  },
  { accessorKey: "company", header: "Empresa" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phone", header: "Telefone" },
  {
    accessorKey: "pipeline_stage",
    header: "Estágio",
    cell: ({ row }) => (
      <StatusBadge type="pipeline" value={row.original.pipeline_stage} />
    ),
  },
  {
    accessorKey: "created_at",
    header: "Criado em",
    cell: ({ row }) => formatDate(row.original.created_at),
  },
];

export default function CRMListPage() {
  const { contacts, isLoading, createContact } = useContacts();
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = async (data: ContactFormData) => {
    setCreating(true);
    try {
      await createContact(data as never);
      toast.success("Contato criado!");
      setCreateOpen(false);
    } catch {
      toast.error("Erro ao criar contato");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <PageHeader title="CRM" description="Lista de contatos">
        <Link href="/crm">
          <Button variant="outline" size="sm">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Kanban
          </Button>
        </Link>
        <PermissionGate resource="crm" action="create">
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Contato
          </Button>
        </PermissionGate>
      </PageHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={contacts}
          searchKey="full_name"
          searchPlaceholder="Buscar por nome..."
        />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Contato</DialogTitle>
          </DialogHeader>
          <ContactForm
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
            isLoading={creating}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
