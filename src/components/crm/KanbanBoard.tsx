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
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { PIPELINE_STAGES, type PipelineStage } from "@/lib/utils/constants";
import { createClient } from "@/lib/supabase/client";
import type { Contact } from "@/lib/supabase/types";
import { toast } from "sonner";

interface KanbanBoardProps {
  initialContacts: Contact[];
  onContactClick?: (contact: Contact) => void;
}

export function KanbanBoard({ initialContacts, onContactClick }: KanbanBoardProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const contact = contacts.find((c) => c.id === event.active.id);
    setActiveContact(contact ?? null);
  }, [contacts]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveContact(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const contactId = String(active.id);
    const newStage = String(over.id) as PipelineStage;

    const validStage = PIPELINE_STAGES.find((s) => s.id === newStage);
    if (!validStage) return;

    // Optimistic update
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, pipeline_stage: newStage } : c))
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
      // Revert
      setContacts(initialContacts);
    } else {
      // Log activity
      await db.from("activities").insert({
        contact_id: contactId,
        type: "stage_change",
        description: `Movido para ${validStage.label}`,
      });
    }
  }, [initialContacts]);

  const contactsByStage = PIPELINE_STAGES.reduce<Record<string, Contact[]>>(
    (acc, stage) => {
      acc[stage.id] = contacts.filter((c) => c.pipeline_stage === stage.id);
      return acc;
    },
    {}
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            contacts={contactsByStage[stage.id] ?? []}
            onContactClick={onContactClick}
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
  );
}
