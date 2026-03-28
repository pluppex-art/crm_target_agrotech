import { cn } from "@/lib/utils/cn";
import { Bot, User, X } from "lucide-react";

type ConversationStatus = "open" | "closed" | "bot";

interface AgentStatusBadgeProps {
  status: ConversationStatus;
  className?: string;
}

const STATUS_CONFIG: Record<ConversationStatus, { label: string; icon: React.ElementType; className: string }> = {
  bot: { label: "Agente IA", icon: Bot, className: "bg-purple-100 text-purple-700" },
  open: { label: "Aberto", icon: User, className: "bg-green-100 text-green-700" },
  closed: { label: "Encerrado", icon: X, className: "bg-slate-100 text-slate-700" },
};

export function AgentStatusBadge({ status, className }: AgentStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", config.className, className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
