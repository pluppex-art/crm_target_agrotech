import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  // Validate shared secret
  const secret = request.headers.get("X-N8N-Secret");
  if (process.env.N8N_WEBHOOK_SECRET && secret !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, conversationId, contactId, payload } = body;

    const supabase = await createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    switch (type) {
      case "agent_reply": {
        if (!conversationId || !payload?.content) break;

        await db.from("messages").insert({
          conversation_id: conversationId,
          sender_type: "agent",
          content: String(payload.content),
          metadata: payload.metadata ?? {},
        });

        await db
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", conversationId);
        break;
      }

      case "contact_message": {
        // Incoming message from WhatsApp/external channel
        if (!conversationId && !payload?.phone) break;

        let targetConversationId = conversationId;

        // If no conversationId, find or create by phone number
        if (!targetConversationId && payload?.phone) {
          const { data: contact } = await db
            .from("contacts")
            .select("id")
            .eq("phone", payload.phone)
            .single();

          if (contact) {
            // Find open conversation for this contact
            const { data: conv } = await db
              .from("conversations")
              .select("id")
              .eq("contact_id", contact.id)
              .in("status", ["open", "bot"])
              .order("updated_at", { ascending: false })
              .limit(1)
              .single();

            if (conv) {
              targetConversationId = conv.id;
            } else {
              const { data: newConv } = await db
                .from("conversations")
                .insert({
                  contact_id: contact.id,
                  channel: payload.channel ?? "whatsapp",
                  status: "bot",
                  n8n_session_id: payload.session_id,
                })
                .select("id")
                .single();
              targetConversationId = newConv?.id;
            }
          }
        }

        if (targetConversationId) {
          await db.from("messages").insert({
            conversation_id: targetConversationId,
            sender_type: "contact",
            content: String(payload.content),
            metadata: payload.metadata ?? {},
          });

          await db
            .from("conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", targetConversationId);
        }
        break;
      }

      case "contact_enriched": {
        if (!contactId || !payload) break;
        await db
          .from("contacts")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", contactId);
        break;
      }

      case "ad_metrics_update": {
        const { campaignId, metrics } = payload ?? {};
        if (!campaignId || !metrics) break;
        await db
          .from("ad_campaigns")
          .update({ metrics, updated_at: new Date().toISOString() })
          .eq("id", campaignId);
        break;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("N8N webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
