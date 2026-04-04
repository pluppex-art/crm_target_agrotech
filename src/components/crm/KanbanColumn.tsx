"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./KanbanCard";
import { cn } from "@/lib/utils/cn";
import { STAGE_COLOR_OPTIONS } from "./PipelineStagesProvider";
import type { Contact } from "@/lib/supabase/types";
import type { StageConfig } from "./PipelineStagesProvider";

interface KanbanColumnProps {
  stage: StageConfig;
  contacts: Contact[];
  onContactClick?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
}

/** Extracts the dot/indicator color class from a stage color string like "bg-blue-100 text-blue-700". */
function stageDotClass(stageColor: string): string {
  const match = STAGE_COLOR_OPTIONS.find((opt) => opt.value === stageColor);
  if (match) return match.dot;
  // Fallback: derive dot color from the bg class (bg-slate-100 → bg-slate-400)
  const bgClass = stageColor.split(" ")[0] ?? "";
  return bgClass.replace(/-\d+$/, "-400");
}

export function KanbanColumn({ stage, contacts, onContactClick, onEdit, onDelete }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div className="group flex flex-col w-64 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={cn("inline-block h-2.5 w-2.5 rounded-full", stageDotClass(stage.color))} />
          <span className="text-sm font-semibold">{stage.label}</span>
        </div>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">
          {contacts.length}
        </span>
      </div>

      {/* Drop zone */}
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
              onEdit={onEdit}
              onDelete={onDelete}
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
