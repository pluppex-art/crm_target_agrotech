"use client";

import { Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConversationList } from "@/components/conversations/ConversationList";
import { useConversations } from "@/hooks/useConversations";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

export default function ConversationsPage() {
  const { conversations, isLoading, refetch } = useConversations();
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const handleNewConversation = async () => {
    setCreating(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("conversations")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert({ channel: "chat", status: "open" } as any)
        .select()
        .single();

      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push(`/conversations/${(data as any).id}`);
      refetch();
    } catch {
      toast.error("Erro ao criar conversa");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <PageHeader title="Conversas" description="Atendimento e IA integrada">
        <Button size="sm" onClick={handleNewConversation} disabled={creating}>
          {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          Nova Conversa
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <ConversationList conversations={conversations as never[]} />
        </div>
      )}
    </div>
  );
}
