"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
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
import type { Contact } from "@/lib/supabase/types";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils/format";

interface CRMListClientProps {
  initialContacts: Contact[];
}

export function CRMListClient({ initialContacts }: CRMListClientProps) {
  const router = useRouter();
  const { contacts, createContact, deleteContact } = useContacts(initialContacts);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleDelete = async (contact: Contact) => {
    if (!confirm(`Excluir "${contact.full_name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteContact(contact.id);
      toast.success("Contato excluído");
      router.refresh();
    } catch {
      toast.error("Erro ao excluir contato");
    }
  };

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
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <PermissionGate resource="crm" action="delete">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => handleDelete(row.original)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </PermissionGate>
      ),
    },
  ];

  const handleCreate = async (data: ContactFormData) => {
    setCreating(true);
    try {
      await createContact(data as never);
      toast.success("Contato criado!");
      setCreateOpen(false);
      router.refresh();
    } catch {
      toast.error("Erro ao criar contato");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <PageHeader title="Clientes / Leads" description="Lista completa de contatos e leads">
        <PermissionGate resource="crm" action="create">
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Contato
          </Button>
        </PermissionGate>
      </PageHeader>

      <DataTable
        columns={columns}
        data={contacts}
        searchKey="full_name"
        searchPlaceholder="Buscar por nome..."
      />

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
