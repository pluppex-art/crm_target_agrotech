"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, List, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { KanbanBoard } from "@/components/crm/KanbanBoard";
import { ContactSheet } from "@/components/crm/ContactSheet";
import { PipelineStagesProvider } from "@/components/crm/PipelineStagesProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContactForm, type ContactFormData } from "@/components/crm/ContactForm";
import { useContacts } from "@/hooks/useContacts";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { EmptyState } from "@/components/shared/EmptyState";
import { Users } from "lucide-react";
import type { Contact } from "@/lib/supabase/types";
import { toast } from "sonner";

interface CRMKanbanClientProps {
  initialContacts: Contact[];
}

export function CRMKanbanClient({ initialContacts }: CRMKanbanClientProps) {
  const router = useRouter();
  const { contacts, createContact, updateContact, deleteContact } = useContacts(initialContacts);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setSheetOpen(true);
  };

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setSheetOpen(true);
  };

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

  const handleCreate = async (data: ContactFormData) => {
    setCreating(true);
    try {
      await createContact(data as never);
      toast.success("Contato criado com sucesso!");
      setCreateOpen(false);
      router.refresh();
    } catch {
      toast.error("Erro ao criar contato");
    } finally {
      setCreating(false);
    }
  };

  return (
    <PipelineStagesProvider>
      <div>
        <PageHeader title="CRM" description="Gerencie seus leads e clientes">
          <Link href="/crm/list">
            <Button variant="outline" size="sm">
              <List className="h-4 w-4 mr-2" />
              Lista
            </Button>
          </Link>
          <Button variant="outline" size="sm" disabled>
            <LayoutGrid className="h-4 w-4 mr-2" />
            Kanban
          </Button>
          <PermissionGate resource="crm" action="create">
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Contato
            </Button>
          </PermissionGate>
        </PageHeader>

        {contacts.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum contato ainda"
            description="Adicione seu primeiro lead ou cliente para começar a usar o CRM"
            action={{ label: "Novo Contato", onClick: () => setCreateOpen(true) }}
          />
        ) : (
          <KanbanBoard
            initialContacts={contacts}
            onContactClick={handleContactClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        <ContactSheet
          contact={selectedContact}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          onUpdated={(updated) => {
            updateContact(updated.id, updated);
          }}
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
    </PipelineStagesProvider>
  );
}
