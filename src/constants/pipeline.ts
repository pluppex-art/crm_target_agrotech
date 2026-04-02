export const PIPELINE_STAGES = [
  { id: "new", label: "Novo", color: "bg-slate-100 text-slate-700" },
  { id: "contacted", label: "Contatado", color: "bg-blue-100 text-blue-700" },
  { id: "qualified", label: "Qualificado", color: "bg-purple-100 text-purple-700" },
  { id: "proposal", label: "Proposta", color: "bg-yellow-100 text-yellow-700" },
  { id: "negotiation", label: "Negociação", color: "bg-orange-100 text-orange-700" },
  { id: "won", label: "Ganho", color: "bg-green-100 text-green-700" },
  { id: "lost", label: "Perdido", color: "bg-red-100 text-red-700" },
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number]["id"];

/** Display config used in the Kanban sidebar progress widget */
export const KANBAN_STAGE_DISPLAY = [
  { id: "new", label: "Em Aberto", headerColor: "text-green-600", dotColor: "bg-green-500", chartColor: "#22c55e" },
  { id: "qualified", label: "Qualificação", headerColor: "text-teal-600", dotColor: "bg-teal-500", chartColor: "#14b8a6" },
  { id: "proposal", label: "Proposta", headerColor: "text-purple-600", dotColor: "bg-purple-500", chartColor: "#a855f7" },
  { id: "won", label: "Fechado", headerColor: "text-red-600", dotColor: "bg-red-500", chartColor: "#ef4444" },
] as const;

export const CONTACT_TYPES = [
  { id: "lead", label: "Lead" },
  { id: "prospect", label: "Prospect" },
  { id: "client", label: "Cliente" },
] as const;

export const CONTACT_SOURCES = [
  { id: "organic", label: "Orgânico" },
  { id: "google_ads", label: "Google Ads" },
  { id: "meta_ads", label: "Meta Ads" },
  { id: "referral", label: "Indicação" },
  { id: "direct", label: "Direto" },
  { id: "email", label: "Email" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "instagram", label: "Instagram" },
  { id: "other", label: "Outro" },
] as const;

export const ACTIVITY_TYPES = [
  { id: "note", label: "Nota", icon: "FileText" },
  { id: "call", label: "Ligação", icon: "Phone" },
  { id: "email", label: "Email", icon: "Mail" },
  { id: "whatsapp", label: "WhatsApp", icon: "MessageSquare" },
  { id: "meeting", label: "Reunião", icon: "Calendar" },
  { id: "stage_change", label: "Mudança de estágio", icon: "ArrowRight" },
  { id: "contract_sent", label: "Contrato enviado", icon: "FileSignature" },
] as const;

export const CONTRACT_STATUSES = [
  { id: "draft", label: "Rascunho", color: "bg-slate-100 text-slate-700" },
  { id: "sent", label: "Enviado", color: "bg-blue-100 text-blue-700" },
  { id: "signed", label: "Assinado", color: "bg-green-100 text-green-700" },
  { id: "cancelled", label: "Cancelado", color: "bg-red-100 text-red-700" },
] as const;

export const TRANSACTION_CATEGORIES = {
  revenue: [
    { id: "course_sale", label: "Venda de Curso" },
    { id: "service", label: "Serviço" },
    { id: "subscription", label: "Assinatura" },
    { id: "consulting", label: "Consultoria" },
    { id: "other_revenue", label: "Outro" },
  ],
  expense: [
    { id: "marketing", label: "Marketing" },
    { id: "technology", label: "Tecnologia" },
    { id: "personnel", label: "Pessoal" },
    { id: "operations", label: "Operações" },
    { id: "taxes", label: "Impostos" },
    { id: "other_expense", label: "Outro" },
  ],
};

export const CAMPAIGN_STATUSES = [
  { id: "draft", label: "Rascunho", color: "bg-slate-100 text-slate-700" },
  { id: "scheduled", label: "Agendado", color: "bg-blue-100 text-blue-700" },
  { id: "sending", label: "Enviando", color: "bg-yellow-100 text-yellow-700" },
  { id: "sent", label: "Enviado", color: "bg-green-100 text-green-700" },
  { id: "cancelled", label: "Cancelado", color: "bg-red-100 text-red-700" },
] as const;
