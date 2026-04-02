"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PIPELINE_STAGES, CONTACT_TYPES, CONTACT_SOURCES } from "@/lib/utils/constants";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Contact } from "@/lib/supabase/types";
import { contactSchema } from "@/validators/contact.schema";
import type { ContactFormData } from "@/validators/contact.schema";

export type { ContactFormData };

interface ContactFormProps {
  defaultValues?: Partial<Contact>;
  onSubmit: (data: ContactFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ContactForm({ defaultValues, onSubmit, onCancel, isLoading }: ContactFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      full_name: defaultValues?.full_name ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      company: defaultValues?.company ?? "",
      cpf_cnpj: defaultValues?.cpf_cnpj ?? "",
      type: defaultValues?.type ?? "lead",
      pipeline_stage: defaultValues?.pipeline_stage ?? "new",
      source: defaultValues?.source ?? "",
      notes: defaultValues?.notes ?? "",
      deal_value: defaultValues?.deal_value ?? undefined,
      rating: defaultValues?.rating ?? undefined,
    },
  });

  const currentRating = watch("rating") ?? 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Nome completo *</Label>
          <Input id="full_name" {...register("full_name")} />
          {errors.full_name && (
            <p className="text-xs text-destructive">{errors.full_name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="company">Empresa / Produto</Label>
          <Input id="company" {...register("company")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefone / WhatsApp</Label>
          <Input id="phone" {...register("phone")} placeholder="(11) 99999-9999" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cpf_cnpj">CPF / CNPJ</Label>
          <Input id="cpf_cnpj" {...register("cpf_cnpj")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="deal_value">Valor da Oportunidade (R$)</Label>
          <Input
            id="deal_value"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            defaultValue={defaultValues?.deal_value ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setValue("deal_value", v === "" ? undefined : parseFloat(v));
            }}
          />
          {errors.deal_value && (
            <p className="text-xs text-destructive">{errors.deal_value.message as string}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Tipo</Label>
          <Select
            value={watch("type")}
            onValueChange={(v) => setValue("type", v as ContactFormData["type"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONTACT_TYPES.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Estágio do Pipeline</Label>
          <Select
            value={watch("pipeline_stage")}
            onValueChange={(v) => setValue("pipeline_stage", v as ContactFormData["pipeline_stage"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PIPELINE_STAGES.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Origem</Label>
          <Select
            value={watch("source") ?? ""}
            onValueChange={(v) => setValue("source", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar origem" />
            </SelectTrigger>
            <SelectContent>
              {CONTACT_SOURCES.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Avaliação do Lead</Label>
          <div className="flex items-center gap-1 pt-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setValue("rating", currentRating === n ? undefined : n)}
                className="focus:outline-none"
              >
                <Star
                  className={cn(
                    "h-6 w-6 transition-colors",
                    n <= (currentRating ?? 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-muted text-muted-foreground/40 hover:fill-yellow-200 hover:text-yellow-300"
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" {...register("notes")} rows={3} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Salvando...</> : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
