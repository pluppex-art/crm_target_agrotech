import { z } from "zod";

export const contactSchema = z.object({
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  cpf_cnpj: z.string().optional().or(z.literal("")),
  type: z.enum(["lead", "prospect", "client"]),
  pipeline_stage: z.enum([
    "new",
    "contacted",
    "qualified",
    "proposal",
    "negotiation",
    "won",
    "lost",
  ]),
  source: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  deal_value: z.number().nonnegative("Valor deve ser positivo").optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
