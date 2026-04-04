"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, formatBRL } from "@/lib/utils/format";
import { Loader2, Send, Copy, Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { Contract } from "@/lib/supabase/types";

export default function ContractDetailPage() {
  const { contractId } = useParams() as { contractId: string };
  const router = useRouter();
  const [contract, setContract] = useState<Contract & { contacts?: { full_name: string } | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("contracts")
      .select("*, contacts(full_name)")
      .eq("id", contractId)
      .single()
      .then(({ data }) => {
        setContract(data as never);
        setLoading(false);
      });
  }, [contractId]);

  const handleSendForSignature = async () => {
    if (!contract) return;
    setSending(true);
    try {
      const supabase = createClient();
      const token = crypto.randomUUID();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("contracts")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          signature_token: token,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contract.id);

      if (error) throw error;
      setContract((prev) => prev ? { ...prev, status: "sent", signature_token: token } : null);
      toast.success("Contrato enviado para assinatura!");
    } catch {
      toast.error("Erro ao enviar contrato");
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = () => {
    if (!contract?.signature_token) return;
    const url = `${window.location.origin}/sign/${contract.signature_token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copiado!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!contract) return <p className="text-center py-20 text-muted-foreground">Contrato não encontrado</p>;

  return (
    <div>
      <PageHeader title={contract.title}>
        <StatusBadge type="contract" value={contract.status} />
        <Link href="/contracts"><Button variant="outline" size="sm">← Voltar</Button></Link>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Contrato</CardTitle></CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none border rounded-md p-6"
                dangerouslySetInnerHTML={{ __html: contract.body_html }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Detalhes</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Contato</p>
                <p className="font-medium">{contract.contacts?.full_name ?? "—"}</p>
              </div>
              {contract.value && (
                <div>
                  <p className="text-xs text-muted-foreground">Valor</p>
                  <p className="font-medium text-green-600">{formatBRL(contract.value)}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Criado em</p>
                <p className="font-medium">{formatDate(contract.created_at)}</p>
              </div>
              {contract.sent_at && (
                <div>
                  <p className="text-xs text-muted-foreground">Enviado em</p>
                  <p className="font-medium">{formatDate(contract.sent_at)}</p>
                </div>
              )}
              {contract.signed_at && (
                <div>
                  <p className="text-xs text-muted-foreground">Assinado em</p>
                  <p className="font-medium text-green-600">{formatDate(contract.signed_at)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Ações</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {contract.status === "draft" && (
                <Button className="w-full" onClick={handleSendForSignature} disabled={sending}>
                  {sending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Enviando...</> : <><Send className="h-4 w-4 mr-2" />Enviar para Assinatura</>}
                </Button>
              )}
              {contract.signature_token && contract.status !== "signed" && (
                <Button variant="outline" className="w-full" onClick={handleCopyLink}>
                  {copied ? <><Check className="h-4 w-4 mr-2" />Copiado!</> : <><Copy className="h-4 w-4 mr-2" />Copiar Link de Assinatura</>}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
