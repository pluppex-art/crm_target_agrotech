import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/format";
import { Bot } from "lucide-react";
import type { Message } from "@/lib/supabase/types";

interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
}

export function MessageBubble({ message, currentUserId }: MessageBubbleProps) {
  const isOwn = message.sender_type === "user" && message.sender_id === currentUserId;
  const isAgent = message.sender_type === "agent";
  const isContact = message.sender_type === "contact";

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Agent/Contact avatar */}
      {!isOwn && (
        <div className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          isAgent ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-700"
        )}>
          {isAgent ? <Bot className="h-4 w-4" /> : "C"}
        </div>
      )}

      <div className={cn("max-w-[70%] space-y-1", isOwn && "items-end flex flex-col")}>
        {!isOwn && (
          <span className="text-xs text-muted-foreground px-1">
            {isAgent ? "Agente IA" : "Contato"}
          </span>
        )}
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-sm",
            isOwn
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : isAgent
              ? "bg-purple-50 text-purple-900 border border-purple-100 rounded-bl-sm"
              : "bg-muted rounded-bl-sm"
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <span className="text-[10px] text-muted-foreground px-1">
          {formatDateTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}
