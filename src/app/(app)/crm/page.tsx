"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, List, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { KanbanBoard } from "@/components/crm/KanbanBoard";
import { ContactSheet } from "@/components/crm/ContactSheet";
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
import { Users, Loader2 } from "lucide-react";
import type { Contact } from "@/lib/supabase/types";
import { toast } from "sonner";

export default function CRMPage() {
  const { contacts, isLoading, createContact, updateContact } = useContacts();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setSheetOpen(true);
  };

  const handleCreate = async (data: ContactFormData) => {
    setCreating(true);
    try {
      await createContact(data as never);
      toast.success("Contato criado com sucesso!");
      setCreateOpen(false);
    } catch {
      toast.error("Erro ao criar contato");
    } finally {
      setCreating(false);
    }
  };

  return (
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

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : contacts.length === 0 ? (
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
        />
      )}

      {/* Edit Sheet */}
      <ContactSheet
        contact={selectedContact}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onUpdated={(updated) => {
          updateContact(updated.id, updated);
        }}
      />

      {/* Create Dialog */}
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
