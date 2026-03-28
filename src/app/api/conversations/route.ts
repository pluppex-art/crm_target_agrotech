import { NextRequest, NextResponse } from "next/server";
import { sendToN8N } from "@/lib/n8n/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, messageId, content, contactId, sessionId, channel } = body;

    await sendToN8N({
      type: "message_sent",
      conversationId,
      contactId,
      sessionId,
      payload: {
        messageId,
        content,
        channel,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error forwarding to N8N:", error);
    return NextResponse.json({ ok: true }); // Don't fail UX if N8N is down
  }
}
