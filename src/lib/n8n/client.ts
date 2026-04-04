export type N8NEventType =
  | "message_sent"
  | "contact_created"
  | "stage_changed"
  | "contract_signed"
  | "campaign_sent";

export interface N8NEvent {
  type: N8NEventType;
  conversationId?: string;
  contactId?: string;
  sessionId?: string;
  payload: Record<string, unknown>;
}

export async function sendToN8N(event: N8NEvent): Promise<void> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const secret = process.env.N8N_WEBHOOK_SECRET;

  if (!webhookUrl) {
    console.warn("N8N_WEBHOOK_URL not configured, skipping N8N event");
    return;
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(secret ? { "X-N8N-Secret": secret } : {}),
    },
    body: JSON.stringify(event),
  });

  if (!res.ok) {
    console.error("N8N webhook failed:", res.status, await res.text());
  }
}
