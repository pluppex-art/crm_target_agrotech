"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, ChevronDown, RefreshCw, Settings2, HelpCircle, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/crm/KanbanBoard";
import { ContactSheet } from "@/components/crm/ContactSheet";
import { PipelineStagesProvider } from "@/components/crm/PipelineStagesProvider";
import { PipelineSidebar } from "@/components/crm/PipelineSidebar";
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
import { formatBRL } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { Contact } from "@/lib/supabase/types";
import { toast } from "sonner";

interface CRMKanbanClientProps {
  initialContacts: Contact[];
}

const STAGE_TABS = [
  { id: "all", label: "Todos" },
  { id: "new", label: "Em Aberto" },
  { id: "qualified", label: "Qualificação" },
  { id: "proposal", label: "Proposta" },
  { id: "won", label: "Fechado" },
] as const;

type StageTabId = (typeof STAGE_TABS)[number]["id"];

function FilterDropdown({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1 px-3 py-1.5 text-xs border rounded-lg bg-background hover:bg-muted transition-colors"
    >
      {label}
      <ChevronDown className="h-3 w-3 text-muted-foreground" />
    </button>
  );
}

export function CRMKanbanClient({ initialContacts }: CRMKanbanClientProps) {
  const router = useRouter();
  const { contacts, createContact, updateContact, deleteContact } = useContacts(initialContacts);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<StageTabId>("all");

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
      toast.success("Lead criado com sucesso!");
      setCreateOpen(false);
      router.refresh();
    } catch {
      toast.error("Erro ao criar lead");
    } finally {
      setCreating(false);
    }
  };

  // Stage counts
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of contacts) {
      counts[c.pipeline_stage] = (counts[c.pipeline_stage] ?? 0) + 1;
    }
    return counts;
  }, [contacts]);

  // Total deal value across all contacts
  const totalValue = useMemo(
    () => contacts.reduce((sum, c) => sum + (c.deal_value ?? 0), 0),
    [contacts]
  );

  // Filtered contacts for the board (by active tab)
  const filteredContacts = useMemo(() => {
    if (activeTab === "all") return contacts;
    return contacts.filter((c) => c.pipeline_stage === activeTab);
  }, [contacts, activeTab]);

  const tabCount = (id: StageTabId) => {
    if (id === "all") return contacts.length;
    return stageCounts[id] ?? 0;
  };

  return (
    <PipelineStagesProvider>
      <div className="flex flex-col h-full">
        {/* ── Top header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">Pipeline de Vendas</h1>
            <PermissionGate resource="crm" action="create">
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Novo Lead
              </Button>
            </PermissionGate>
            <Button variant="outline" size="sm">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {totalValue > 0 && (
              <span className="text-sm text-muted-foreground">
                Total: <span className="font-semibold text-foreground">{formatBRL(totalValue)}</span>
              </span>
            )}
            <Button variant="outline" size="sm">
              Responsável
              <ChevronDown className="h-3.5 w-3.5 ml-1" />
            </Button>
            <Button variant="outline" size="sm">
              Filtros
              <ChevronDown className="h-3.5 w-3.5 ml-1" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ── Stage tabs ─────────────────────────────────────────── */}
        <div className="flex items-center gap-1 border-b mb-3">
          <button
            type="button"
            className="flex items-center gap-1 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <Users className="h-4 w-4" />
          </button>
          {STAGE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label === "Todos" ? tab.label : `${tabCount(tab.id)} ${tab.label}`}
            </button>
          ))}
          <div className="ml-auto pb-1">
            <button type="button" className="text-muted-foreground hover:text-foreground px-2">
              ···
            </button>
          </div>
        </div>

        {/* ── Filter bar ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <FilterDropdown label="Cursos Agrícolas" />
          <FilterDropdown label="Todos" />
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 text-xs border border-green-500 text-green-600 rounded-lg bg-background hover:bg-green-50 transition-colors"
          >
            Em Aberto
          </button>
          <FilterDropdown label="Todos" />
          <FilterDropdown label="Echapas" />
          <FilterDropdown label="Compara" />
          <ChevronDown className="h-4 w-4 text-muted-foreground" />

          <div className="ml-auto">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Seguir
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* ── Main content: Kanban + Sidebar ─────────────────────── */}
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Kanban area */}
          <div className="flex-1 min-w-0">
            {contacts.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Nenhum lead ainda"
                description="Adicione seu primeiro lead ou cliente para começar a usar o CRM"
                action={{ label: "Novo Lead", onClick: () => setCreateOpen(true) }}
              />
            ) : (
              <KanbanBoard
                initialContacts={filteredContacts}
                onContactClick={handleContactClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>

          {/* Right sidebar */}
          <PipelineSidebar contacts={contacts} />
        </div>
      </div>

      {/* Contact sheet (edit) */}
      <ContactSheet
        contact={selectedContact}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onUpdated={(updated) => {
          updateContact(updated.id, updated);
        }}
      />

      {/* Create lead dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Lead</DialogTitle>
          </DialogHeader>
          <ContactForm
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
            isLoading={creating}
          />
        </DialogContent>
      </Dialog>
    </PipelineStagesProvider>
  );
}
