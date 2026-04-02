"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Phone, LayoutGrid, MoreHorizontal, Pencil, Trash2, Eye, ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatBRL } from "@/lib/utils/format";
import type { Contact } from "@/lib/supabase/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface KanbanCardProps {
  contact: Contact;
  onClick?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
}

/** Generates a stable background color from a name string. */
function avatarColor(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-rose-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

/** Returns up to 2 uppercase initials from a full name. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function StarRating({ value }: { value: number | null }) {
  const stars = value ?? 0;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "h-3 w-3",
            n <= stars ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground/40"
          )}
        />
      ))}
    </div>
  );
}

export function KanbanCard({ contact, onClick, onEdit, onDelete }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: contact.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const productName = contact.company || (contact.tags?.[0] ?? null);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group bg-background rounded-xl border p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      {/* Header: avatar + name + action menu */}
      <div className="flex items-start gap-2.5 mb-2">
        {/* Avatar */}
        <div
          className={cn(
            "h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0",
            avatarColor(contact.full_name)
          )}
        >
          {initials(contact.full_name)}
        </div>

        {/* Name + phone */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => !isDragging && onClick?.(contact)}
        >
          <p className="text-sm font-semibold leading-tight truncate">{contact.full_name}</p>
          {contact.phone && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Phone className="h-2.5 w-2.5 shrink-0" />
              {contact.phone}
            </p>
          )}
        </div>

        {/* Dropdown menu */}
        {(onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 -mr-1 -mt-0.5 opacity-0 group-hover:opacity-100 focus:opacity-100 data-[state=open]:opacity-100"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {onEdit && (
                <DropdownMenuItem
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); onEdit(contact); }}
                >
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Editar
                </DropdownMenuItem>
              )}
              {onEdit && onDelete && <DropdownMenuSeparator />}
              {onDelete && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); onDelete(contact); }}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Product / service row */}
      {productName && (
        <div className="flex items-center gap-1.5 mb-2 text-xs text-muted-foreground">
          <LayoutGrid className="h-3 w-3 shrink-0 text-primary/60" />
          <span className="truncate">{productName}</span>
        </div>
      )}

      {/* Footer: value + stars + action icons */}
      <div className="flex items-center justify-between mt-1 pt-2 border-t border-border/50">
        {/* Deal value */}
        <span className="text-sm font-semibold text-foreground">
          {contact.deal_value ? formatBRL(contact.deal_value) : "—"}
        </span>

        {/* Star rating */}
        <StarRating value={contact.rating} />

        {/* Quick actions */}
        <div
          className="flex items-center gap-1"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            title="Ver detalhes"
            className="h-6 w-6 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={(e) => { e.stopPropagation(); onClick?.(contact); }}
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Abrir contato"
            className="h-6 w-6 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={(e) => { e.stopPropagation(); onEdit?.(contact); }}
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
