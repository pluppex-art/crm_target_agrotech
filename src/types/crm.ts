import type { Contact } from "@/lib/supabase/types";

export type { Contact };

export interface PipelineMetrics {
  totalContacts: number;
  totalValue: number;
  conversionRate: number;
  avgDays: number;
  monthlyGoal: number;
  byStage: Record<string, { count: number; value: number; percentage: number }>;
}

export interface MonthlyResult {
  month: string;
  value: number;
}

export interface KanbanCardProps {
  contact: Contact;
  onClick?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
}

export interface StageTab {
  id: string;
  label: string;
  count: number;
}
