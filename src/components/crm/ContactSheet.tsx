"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ContactForm, type ContactFormData } from "./ContactForm";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Contact } from "@/lib/supabase/types";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface ContactSheetProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (contact: Contact) => void;
}

export function ContactSheet({ contact, open, onOpenChange, onUpdated }: ContactSheetProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ContactFormData) => {
    if (!contact) return;
    setIsLoading(true);
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: updated, error } = await (supabase as any)
        .from("contacts")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", contact.id)
        .select()
        .single();

      if (error) throw error;
      toast.success("Contato atualizado com sucesso!");
      onUpdated?.(updated as Contact);
      onOpenChange(false);
    } catch {
      toast.error("Erro ao atualizar contato");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Editar Contato</SheetTitle>
          <SheetDescription>
            {contact?.full_name}
            {contact && (
              <Link href={`/crm/${contact.id}`} className="ml-2">
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Ver completo
                </Button>
              </Link>
            )}
          </SheetDescription>
        </SheetHeader>
        {contact && (
          <ContactForm
            defaultValues={contact}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isLoading={isLoading}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
