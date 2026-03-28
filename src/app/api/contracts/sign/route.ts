import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 });
    }

    const supabase = await createAdminClient();

    const { data: rawContract, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("signature_token", token)
      .eq("status", "sent")
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contract = rawContract as unknown as Record<string, any> | null;

    if (error || !contract) {
      return NextResponse.json(
        { error: "Contrato não encontrado ou já assinado" },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("contracts")
      .update({
        status: "signed",
        signed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", contract.id);

    // Log activity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("activities").insert({
      contact_id: contract.contact_id,
      type: "contract_sent",
      description: `Contrato "${contract.title}" assinado`,
    });

    return NextResponse.json({ ok: true, contractTitle: contract.title });
  } catch (error) {
    console.error("Contract sign error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
