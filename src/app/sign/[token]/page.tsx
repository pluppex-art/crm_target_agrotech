"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, AlertCircle, Sprout } from "lucide-react";
import type { Contract } from "@/lib/supabase/types";

export default function SignContractPage() {
  const { token } = useParams() as { token: string };
  const [contract, setContract] = useState<Contract & { contacts?: { full_name: string } | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("contracts")
      .select("*, contacts(full_name)")
      .eq("signature_token", token)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError("Contrato não encontrado ou link inválido.");
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setContract(data as any);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((data as any).status === "signed") setSigned(true);
        }
        setLoading(false);
      });
  }, [token]);

  const handleSign = async () => {
    setSigning(true);
    try {
      const res = await fetch("/api/contracts/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSigned(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao assinar contrato");
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Sprout className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">Target Agrotech CRM</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center py-16 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h2 className="text-lg font-semibold mb-2">Link Inválido</h2>
              <p className="text-sm text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        ) : signed ? (
          <Card>
            <CardContent className="flex flex-col items-center py-16 text-center">
              <CheckCircle className="h-14 w-14 text-green-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Contrato Assinado!</h2>
              <p className="text-sm text-muted-foreground">
                {contract?.title} foi assinado com sucesso.
              </p>
              {contract?.signed_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  Assinado em: {new Date(contract.signed_at).toLocaleString("pt-BR")}
                </p>
              )}
            </CardContent>
          </Card>
        ) : contract ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{contract.title}</CardTitle>
                {contract.contacts?.full_name && (
                  <p className="text-sm text-muted-foreground">Para: {contract.contacts.full_name}</p>
                )}
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: contract.body_html }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Ao clicar em &ldquo;Assinar Contrato&rdquo;, você confirma que leu e concorda
                  com todos os termos descritos acima.
                </p>
                <Button
                  className="w-full sm:w-auto"
                  size="lg"
                  onClick={handleSign}
                  disabled={signing}
                >
                  {signing ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Assinando...</>
                  ) : (
                    <><CheckCircle className="h-4 w-4 mr-2" />Assinar Contrato</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
