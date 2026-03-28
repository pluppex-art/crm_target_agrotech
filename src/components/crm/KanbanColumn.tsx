"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./KanbanCard";
import { cn } from "@/lib/utils/cn";
import type { Contact } from "@/lib/supabase/types";
import type { PipelineStage } from "@/lib/utils/constants";

interface KanbanColumnProps {
  stage: { id: PipelineStage; label: string; color: string };
  contacts: Contact[];
  onContactClick?: (contact: Contact) => void;
}

export function KanbanColumn({ stage, contacts, onContactClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div className="flex flex-col w-64 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={cn("inline-block h-2.5 w-2.5 rounded-full", stage.color.split(" ")[0])} />
          <span className="text-sm font-semibold">{stage.label}</span>
        </div>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">
          {contacts.length}
        </span>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 min-h-[100px] rounded-lg space-y-2 p-1 transition-colors",
          isOver && "bg-primary/5 ring-1 ring-primary/20"
        )}
      >
        <SortableContext items={contacts.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {contacts.map((contact) => (
            <KanbanCard
              key={contact.id}
              contact={contact}
              onClick={onContactClick}
            />
          ))}
        </SortableContext>

        {contacts.length === 0 && (
          <div className="flex h-16 items-center justify-center rounded-lg border-2 border-dashed border-muted">
            <p className="text-xs text-muted-foreground">Solte aqui</p>
          </div>
        )}
      </div>
    </div>
  );
}
