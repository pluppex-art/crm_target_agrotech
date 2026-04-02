"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./KanbanCard";
import { cn } from "@/lib/utils/cn";
import { STAGE_COLOR_OPTIONS } from "./PipelineStagesProvider";
import { formatBRL } from "@/lib/utils/format";
import type { Contact } from "@/lib/supabase/types";
import type { StageConfig } from "./PipelineStagesProvider";

interface KanbanColumnProps {
  stage: StageConfig;
  contacts: Contact[];
  onContactClick?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
}

/** Extracts the dot/indicator color class from a stage color string. */
function stageDotClass(stageColor: string): string {
  const match = STAGE_COLOR_OPTIONS.find((opt) => opt.value === stageColor);
  if (match) return match.dot;
  const bgClass = stageColor.split(" ")[0] ?? "";
  return bgClass.replace(/-\d+$/, "-400");
}

/** Derives a text color class for the column total value from the dot color. */
function stageValueColor(stageColor: string): string {
  const dot = stageDotClass(stageColor);
  // dot is like "bg-green-500" → map to "text-green-600"
  return dot.replace("bg-", "text-").replace(/-\d+$/, "-600");
}

export function KanbanColumn({ stage, contacts, onContactClick, onEdit, onDelete }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  const totalValue = contacts.reduce((sum, c) => sum + (c.deal_value ?? 0), 0);

  return (
    <div className="group flex flex-col w-64 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={cn("inline-block h-2.5 w-2.5 rounded-full shrink-0", stageDotClass(stage.color))} />
          <span className={cn("text-xs font-bold uppercase tracking-wider", stageValueColor(stage.color))}>
            {stage.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {contacts.length}
          </span>
        </div>
      </div>

      {/* Stage total value */}
      {totalValue > 0 && (
        <div className={cn("text-sm font-semibold mb-2 px-1", stageValueColor(stage.color))}>
          {formatBRL(totalValue)}
        </div>
      )}

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
