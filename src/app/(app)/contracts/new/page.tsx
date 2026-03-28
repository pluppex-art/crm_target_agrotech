"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useContacts } from "@/hooks/useContacts";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const schema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  contact_id: z.string().min(1, "Contato obrigatório"),
  value: z.coerce.number().optional(),
  body_html: z.string().min(1, "Conteúdo obrigatório"),
});

type FormData = z.infer<typeof schema>;

const DEFAULT_CONTRACT = `<h2>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h2>
<p>As partes abaixo identificadas celebram o presente contrato conforme os termos a seguir:</p>
<h3>1. OBJETO</h3>
<p>O objeto deste contrato é a prestação dos seguintes serviços:</p>
<p>[Descreva os serviços aqui]</p>
<h3>2. VALOR E PAGAMENTO</h3>
<p>O valor total dos serviços é de R$ [valor], a ser pago conforme acordado.</p>
<h3>3. PRAZO</h3>
<p>O prazo de execução é de [prazo].</p>
<h3>4. ASSINATURAS</h3>
<p>As partes concordam com todos os termos acima descritos.</p>`;

export default function NewContractPage() {
  const router = useRouter();
  const { contacts } = useContacts();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { body_html: DEFAULT_CONTRACT },
  });

  const onSubmit = async (formData: FormData) => {
    setSaving(true);
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: contract, error } = await supabase
        .from("contracts")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert({ ...formData, status: "draft" } as any)
        .select()
        .single();

      if (error) throw error;
      toast.success("Contrato criado!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push(`/contracts/${(contract as any).id}`);
    } catch {
      toast.error("Erro ao criar contrato");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Novo Contrato">
        <Link href="/contracts"><Button variant="outline" size="sm">← Voltar</Button></Link>
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit as never)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Informações</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Título *</Label>
                  <Input {...register("title")} placeholder="Ex: Contrato de Consultoria - Cliente X" />
                  {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Contato *</Label>
                    <Select onValueChange={(v) => setValue("contact_id", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecionar contato" /></SelectTrigger>
                      <SelectContent>
                        {contacts.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.contact_id && <p className="text-xs text-destructive">{errors.contact_id.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Valor (R$)</Label>
                    <Input {...register("value")} type="number" step="0.01" min="0" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Conteúdo do Contrato</CardTitle></CardHeader>
              <CardContent>
                <Label>HTML do contrato</Label>
                <textarea
                  {...register("body_html")}
                  rows={20}
                  className="mt-1.5 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                />
                {errors.body_html && <p className="text-xs text-destructive mt-1">{errors.body_html.message}</p>}
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit">
            <CardHeader><CardTitle className="text-base">Ações</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Salvando...</> : "Salvar Rascunho"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
