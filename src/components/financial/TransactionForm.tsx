"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TRANSACTION_CATEGORIES } from "@/lib/utils/constants";
import { Loader2 } from "lucide-react";

const schema = z.object({
  type: z.enum(["revenue", "expense"]),
  category: z.string().min(1, "Categoria obrigatória"),
  description: z.string().min(1, "Descrição obrigatória"),
  amount: z.coerce.number().min(0.01, "Valor deve ser maior que zero"),
  date: z.string().min(1, "Data obrigatória"),
  status: z.enum(["pending", "confirmed", "cancelled"]),
  payment_method: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type TransactionFormData = z.infer<typeof schema>;

interface TransactionFormProps {
  type: "revenue" | "expense";
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const PAYMENT_METHODS = [
  { id: "pix", label: "PIX" },
  { id: "credit_card", label: "Cartão de Crédito" },
  { id: "debit_card", label: "Cartão de Débito" },
  { id: "bank_transfer", label: "Transferência Bancária" },
  { id: "boleto", label: "Boleto" },
  { id: "cash", label: "Dinheiro" },
];

export function TransactionForm({ type, onSubmit, onCancel, isLoading }: TransactionFormProps) {
  const categories = TRANSACTION_CATEGORIES[type];
  const today = new Date().toISOString().split("T")[0];

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TransactionFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      type,
      date: today,
      status: "confirmed",
    },
  });

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Categoria</Label>
          <Select onValueChange={(v) => setValue("category", v)}>
            <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={watch("status")} onValueChange={(v) => setValue("status", v as TransactionFormData["status"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Descrição *</Label>
        <Input {...register("description")} />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Valor (R$) *</Label>
          <Input {...register("amount")} type="number" step="0.01" min="0" />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Data *</Label>
          <Input {...register("date")} type="date" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Forma de pagamento</Label>
        <Select onValueChange={(v) => setValue("payment_method", v)}>
          <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Observações</Label>
        <Textarea {...register("notes")} rows={2} />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Salvando...</> : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
