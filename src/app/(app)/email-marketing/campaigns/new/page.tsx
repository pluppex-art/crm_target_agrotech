"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

const schema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  subject: z.string().min(1, "Assunto obrigatório"),
  from_name: z.string().min(1, "Nome do remetente obrigatório"),
  from_email: z.string().email("Email inválido"),
  body_html: z.string().min(1, "Conteúdo obrigatório"),
});

type FormData = z.infer<typeof schema>;

export default function NewCampaignPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      from_name: "Target Agrotech",
      from_email: "contato@targetagrotech.com.br",
    },
  });

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: campaign, error } = await supabase
        .from("email_campaigns")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert({ ...data, status: "draft" } as any)
        .select()
        .single();

      if (error) throw error;
      toast.success("Campanha criada!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push(`/email-marketing/campaigns/${(campaign as any).id}`);
    } catch {
      toast.error("Erro ao criar campanha");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Nova Campanha" description="Crie uma nova campanha de email">
        <Link href="/email-marketing">
          <Button variant="outline" size="sm">← Voltar</Button>
        </Link>
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Nome da campanha</Label>
                  <Input {...register("name")} placeholder="Ex: Newsletter Março 2026" />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Assunto do email</Label>
                  <Input {...register("subject")} placeholder="Ex: Novidades do mês!" />
                  {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Nome do remetente</Label>
                    <Input {...register("from_name")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email do remetente</Label>
                    <Input {...register("from_email")} type="email" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conteúdo do Email</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  <Label>HTML do email</Label>
                  <Textarea
                    {...register("body_html")}
                    rows={15}
                    placeholder="<html><body>Conteúdo do email...</body></html>"
                    className="font-mono text-xs"
                  />
                  {errors.body_html && <p className="text-xs text-destructive">{errors.body_html.message}</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Salvando...</> : "Salvar como Rascunho"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
