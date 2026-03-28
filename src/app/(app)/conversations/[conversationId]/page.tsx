import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ChatWindow } from "@/components/conversations/ChatWindow";

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const supabase = await createClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("*, contacts(full_name, phone, email)")
    .eq("id", conversationId)
    .single();

  if (!conversation) notFound();

  return (
    <div className="h-[calc(100vh-8rem)] border rounded-lg overflow-hidden bg-background">
      <ChatWindow conversation={conversation as never} />
    </div>
  );
}
