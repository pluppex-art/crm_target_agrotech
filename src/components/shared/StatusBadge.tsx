import { cn } from "@/lib/utils/cn";
import { PIPELINE_STAGES, CONTRACT_STATUSES, CAMPAIGN_STATUSES } from "@/lib/utils/constants";

interface StatusBadgeProps {
  type: "pipeline" | "contract" | "campaign" | "custom";
  value: string;
  className?: string;
  customLabel?: string;
  customColor?: string;
}

export function StatusBadge({ type, value, className, customLabel, customColor }: StatusBadgeProps) {
  let label = customLabel ?? value;
  let color = customColor ?? "bg-slate-100 text-slate-700";

  if (type === "pipeline") {
    const stage = PIPELINE_STAGES.find((s) => s.id === value);
    if (stage) { label = stage.label; color = stage.color; }
  } else if (type === "contract") {
    const status = CONTRACT_STATUSES.find((s) => s.id === value);
    if (status) { label = status.label; color = status.color; }
  } else if (type === "campaign") {
    const status = CAMPAIGN_STATUSES.find((s) => s.id === value);
    if (status) { label = status.label; color = status.color; }
  }

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", color, className)}>
      {label}
    </span>
  );
}
