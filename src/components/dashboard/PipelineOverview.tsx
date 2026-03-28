import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PIPELINE_STAGES } from "@/lib/utils/constants";

interface PipelineOverviewProps {
  counts: Record<string, number>;
}

export function PipelineOverview({ counts }: PipelineOverviewProps) {
  const total = Object.values(counts).reduce((sum, c) => sum + c, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pipeline de Vendas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {PIPELINE_STAGES.map((stage) => {
          const count = counts[stage.id] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={stage.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{stage.label}</span>
                <span className="font-semibold">{count}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
