"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { AgentStatusBadge } from "./AgentStatusBadge";
import { useMessages } from "@/hooks/useConversations";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { sendToN8N } from "@/lib/n8n/client";
import { Loader2, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Conversation } from "@/lib/supabase/types";

interface ChatWindowProps {
  conversation: Conversation & {
    contacts?: { full_name: string; phone?: string | null; email?: string | null } | null;
  };
}

export function ChatWindow({ conversation }: ChatWindowProps) {
  const { user } = useUser();
  const { messages, isLoading, sendMessage } = useMessages(conversation.id);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (content: string) => {
    if (!user) return;
    try {
      const message = await sendMessage(content, user.id);

      // Send to N8N for AI processing
      await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversation.id,
          messageId: message.id,
          content,
          contactId: conversation.contact_id,
          sessionId: conversation.n8n_session_id,
          channel: conversation.channel,
        }),
      });
    } catch {
      toast.error("Erro ao enviar mensagem");
    }
  };

  const handleToggleBot = async () => {
    const supabase = createClient();
    const newStatus = conversation.status === "bot" ? "open" : "bot";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("conversations")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", conversation.id);
    toast.success(newStatus === "bot" ? "Agente IA ativado" : "Atendimento humano ativado");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3 bg-background">
        <div>
          <p className="text-sm font-semibold">
            {conversation.contacts?.full_name ?? "Contato desconhecido"}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <AgentStatusBadge status={conversation.status} />
            {conversation.contacts?.phone && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {conversation.contacts.phone}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleBot}
          className="text-xs"
        >
          {conversation.status === "bot" ? "Assumir atendimento" : "Ativar Agente IA"}
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentUserId={user?.id ?? ""}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        disabled={conversation.status === "closed"}
      />
    </div>
  );
}
