"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Smartphone, Mail } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { AgentStatusBadge } from "./AgentStatusBadge";
import { formatRelativeTime } from "@/lib/utils/format";
import type { Conversation } from "@/lib/supabase/types";

const CHANNEL_ICONS = {
  chat: MessageSquare,
  whatsapp: Smartphone,
  email: Mail,
};

interface ConversationListProps {
  conversations: (Conversation & {
    contacts?: { full_name: string; phone?: string | null } | null;
  })[];
}

export function ConversationList({ conversations }: ConversationListProps) {
  const pathname = usePathname();

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <MessageSquare className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm font-medium">Nenhuma conversa</p>
        <p className="text-xs text-muted-foreground mt-1">
          As conversas aparecerão aqui quando iniciadas
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y overflow-y-auto">
      {conversations.map((conversation) => {
        const Icon = CHANNEL_ICONS[conversation.channel] ?? MessageSquare;
        const isActive = pathname === `/conversations/${conversation.id}`;

        return (
          <Link
            key={conversation.id}
            href={`/conversations/${conversation.id}`}
            className={cn(
              "flex items-start gap-3 p-3 transition-colors hover:bg-muted/50",
              isActive && "bg-muted"
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium truncate">
                  {conversation.contacts?.full_name ?? conversation.contacts?.phone ?? "Contato desconhecido"}
                </p>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {formatRelativeTime(conversation.updated_at)}
                </span>
              </div>
              <AgentStatusBadge status={conversation.status} className="mt-0.5" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
