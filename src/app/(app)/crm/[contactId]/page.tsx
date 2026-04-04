import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Phone, Mail, Building2, MapPin, Hash, Calendar,
  StickyNote, PhoneCall, MessageSquare, ArrowRight, FileText
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Contact, Activity, Contract } from "@/lib/supabase/types";

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  note: StickyNote,
  call: PhoneCall,
  email: Mail,
  whatsapp: MessageSquare,
  meeting: Calendar,
  stage_change: ArrowRight,
  contract_sent: FileText,
};

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId } = await params;
  const supabase = await createClient();

  const [contactRes, activitiesRes, contractsRes] = await Promise.all([
    supabase.from("contacts").select("*").eq("id", contactId).single(),
    supabase.from("activities").select("*").eq("contact_id", contactId).order("created_at", { ascending: false }),
    supabase.from("contracts").select("id, title, status, value, created_at").eq("contact_id", contactId),
  ]);

  const contact = contactRes.data as unknown as Contact | null;
  const activities = activitiesRes.data as unknown as Activity[];
  const contracts = contractsRes.data as unknown as Array<Pick<Contract, "id" | "title" | "status" | "value" | "created_at">>;

  if (!contact) notFound();

  return (
    <div>
      <PageHeader title={contact.full_name} description={contact.company ?? undefined}>
        <StatusBadge type="pipeline" value={contact.pipeline_stage} />
        <Link href="/crm">
          <Button variant="outline" size="sm">← Voltar</Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {contact.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{contact.email}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{contact.phone}</span>
              </div>
            )}
            {contact.company && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4 shrink-0" />
                <span>{contact.company}</span>
              </div>
            )}
            {contact.cpf_cnpj && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Hash className="h-4 w-4 shrink-0" />
                <span>{contact.cpf_cnpj}</span>
              </div>
            )}
            {contact.source && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>Origem: {contact.source}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>Criado em {formatDate(contact.created_at)}</span>
            </div>

            {contact.tags.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-wrap gap-1">
                  {contact.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}

            {contact.notes && (
              <>
                <Separator />
                <p className="text-muted-foreground text-xs whitespace-pre-line">{contact.notes}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Linha do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            {(!activities || activities.length === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma atividade registrada
              </p>
            ) : (
              <div className="relative space-y-4">
                <div className="absolute left-3.5 top-0 bottom-0 w-px bg-border" />
                {activities.map((activity) => {
                  const Icon = ACTIVITY_ICONS[activity.type] ?? StickyNote;
                  return (
                    <div key={activity.id} className="flex gap-3 relative">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted border-2 border-background z-10">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 pb-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDateTime(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contracts */}
        {contracts && contracts.length > 0 && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base">Contratos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {contracts.map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between py-3">
                    <div>
                      <Link
                        href={`/contracts/${contract.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {contract.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(contract.created_at)}
                      </p>
                    </div>
                    <StatusBadge type="contract" value={contract.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
