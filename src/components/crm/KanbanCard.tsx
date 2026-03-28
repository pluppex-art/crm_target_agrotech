"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Phone, Mail, Building2, Tag } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Contact } from "@/lib/supabase/types";

interface KanbanCardProps {
  contact: Contact;
  onClick?: (contact: Contact) => void;
}

export function KanbanCard({ contact, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: contact.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-background rounded-lg border p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow space-y-2",
        isDragging && "opacity-50 shadow-lg"
      )}
      onClick={() => !isDragging && onClick?.(contact)}
    >
      <div>
        <p className="text-sm font-semibold leading-tight">{contact.full_name}</p>
        {contact.company && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Building2 className="h-3 w-3" />
            {contact.company}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        {contact.phone && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {contact.phone}
          </p>
        )}
        {contact.email && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{contact.email}</span>
          </p>
        )}
      </div>

      {contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {contact.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs"
            >
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
