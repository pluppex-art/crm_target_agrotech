"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { Settings2, Plus, Pencil, Trash2, RotateCcw } from "lucide-react";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { usePipelineStages, STAGE_COLOR_OPTIONS, type StageConfig } from "./PipelineStagesProvider";
import { createClient } from "@/lib/supabase/client";
import type { Contact } from "@/lib/supabase/types";
import { toast } from "sonner";
import { usePermission } from "@/hooks/usePermission";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";

interface KanbanBoardProps {
  initialContacts: Contact[];
  onContactClick?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
}

// ─── Manage Columns Dialog ────────────────────────────────────────────────────

function ManageColumnsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { stages, addStage, updateStage, removeStage, resetToDefault } = usePipelineStages();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editColor, setEditColor] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState(STAGE_COLOR_OPTIONS[0].value);

  const startEdit = (stage: StageConfig) => {
    setEditingId(stage.id);
    setEditLabel(stage.label);
    setEditColor(stage.color);
  };

  const saveEdit = () => {
    if (!editingId || !editLabel.trim()) return;
    updateStage(editingId, editLabel.trim(), editColor);
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    addStage(newLabel.trim(), newColor);
    setNewLabel("");
    setNewColor(STAGE_COLOR_OPTIONS[0].value);
  };

  const dotClass = (colorValue: string) =>
    STAGE_COLOR_OPTIONS.find((o) => o.value === colorValue)?.dot ?? "bg-slate-400";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Gerenciar Colunas do Kanban</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {stages.map((stage) => (
            <div key={stage.id} className="flex items-center gap-2 rounded-lg border px-3 py-2">
              {editingId === stage.id ? (
                <>
                  <Input
                    className="h-7 text-sm flex-1"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                    autoFocus
                  />
                  <div className="flex gap-1">
                    {STAGE_COLOR_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        title={opt.label}
                        className={cn(
                          "h-5 w-5 rounded-full border-2 transition-transform",
                          opt.dot,
                          editColor === opt.value ? "border-foreground scale-110" : "border-transparent"
                        )}
                        onClick={() => setEditColor(opt.value)}
                      />
                    ))}
                  </div>
                  <Button size="sm" className="h-7 text-xs" onClick={saveEdit}>
                    OK
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingId(null)}>
                    ×
                  </Button>
                </>
              ) : (
                <>
                  <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", dotClass(stage.color))} />
                  <span className="flex-1 text-sm">{stage.label}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => startEdit(stage)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removeStage(stage.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Add new stage */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Input
            className="h-8 text-sm flex-1"
            placeholder="Nome da nova coluna"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <div className="flex gap-1">
            {STAGE_COLOR_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                title={opt.label}
                className={cn(
                  "h-5 w-5 rounded-full border-2 transition-transform",
                  opt.dot,
                  newColor === opt.value ? "border-foreground scale-110" : "border-transparent"
                )}
                onClick={() => setNewColor(opt.value)}
              />
            ))}
          </div>
          <Button size="sm" className="h-8 shrink-0" onClick={handleAdd} disabled={!newLabel.trim()}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Adicionar
          </Button>
        </div>

        <DialogFooter className="pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="mr-auto text-muted-foreground"
            onClick={resetToDefault}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Restaurar padrão
          </Button>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── KanbanBoard ─────────────────────────────────────────────────────────────

export function KanbanBoard({ initialContacts, onContactClick, onEdit, onDelete }: KanbanBoardProps) {
  const { stages } = usePipelineStages();
  const isAdmin = usePermission("settings", "edit");
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [manageOpen, setManageOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const contact = contacts.find((c) => c.id === event.active.id);
      setActiveContact(contact ?? null);
    },
    [contacts]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveContact(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const contactId = String(active.id);
      const newStage = String(over.id);

      const validStage = stages.find((s) => s.id === newStage);
      if (!validStage) return;

      // Snapshot for revert
      const previous = contacts.slice();

      // Optimistic update
      setContacts((prev) =>
        prev.map((c) => (c.id === contactId ? { ...c, pipeline_stage: newStage as never } : c))
      );

      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      const { error } = await db
        .from("contacts")
        .update({ pipeline_stage: newStage, updated_at: new Date().toISOString() })
        .eq("id", contactId);

      if (error) {
        toast.error("Erro ao mover contato");
        setContacts(previous); // revert to correct previous state
      } else {
        await db.from("activities").insert({
          contact_id: contactId,
          type: "stage_change",
          description: `Movido para ${validStage.label}`,
        });
      }
    },
    [contacts, stages]
  );

  const contactsByStage = stages.reduce<Record<string, Contact[]>>((acc, stage) => {
    acc[stage.id] = contacts.filter((c) => c.pipeline_stage === stage.id);
    return acc;
  }, {});

  return (
    <>
      {isAdmin && (
        <div className="flex justify-end mb-3">
          <Button variant="outline" size="sm" onClick={() => setManageOpen(true)}>
            <Settings2 className="h-4 w-4 mr-2" />
            Gerenciar Colunas
          </Button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              contacts={contactsByStage[stage.id] ?? []}
              onContactClick={onContactClick}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>

        <DragOverlay>
          {activeContact ? (
            <div className="rotate-2 opacity-90">
              <KanbanCard contact={activeContact} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <ManageColumnsDialog open={manageOpen} onOpenChange={setManageOpen} />
    </>
  );
}
