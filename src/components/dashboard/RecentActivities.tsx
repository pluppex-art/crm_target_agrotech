import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MessageSquare, Calendar, FileText, ArrowRight, StickyNote } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/format";
import type { Activity } from "@/lib/supabase/types";

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  note: StickyNote,
  call: Phone,
  email: Mail,
  whatsapp: MessageSquare,
  meeting: Calendar,
  stage_change: ArrowRight,
  contract_sent: FileText,
};

interface RecentActivitiesProps {
  activities: (Activity & { contacts?: { full_name: string } | null })[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhuma atividade registrada
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = ACTIVITY_ICONS[activity.type] ?? StickyNote;
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-tight line-clamp-2">{activity.description}</p>
                    {activity.contacts?.full_name && (
                      <p className="text-xs text-primary font-medium mt-0.5">{activity.contacts.full_name}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatRelativeTime(activity.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
