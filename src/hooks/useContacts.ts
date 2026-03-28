"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Contact } from "@/lib/supabase/types";

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    const supabase = createClient();
    setIsLoading(true);

    const { data, error: err } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setContacts(data ?? []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const createContact = useCallback(
    async (contact: Parameters<ReturnType<typeof createClient>["from"]> extends never ? never : Omit<Contact, "id" | "created_at" | "updated_at">) => {
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from("contacts")
        .insert(contact as never)
        .select()
        .single();

      if (err) throw new Error(err.message);
      setContacts((prev) => [data as Contact, ...prev]);
      return data as Contact;
    },
    []
  );

  const updateContact = useCallback(
    async (id: string, updates: Partial<Contact>) => {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: err } = await (supabase as any)
        .from("contacts")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (err) throw new Error(err.message);
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? (data as Contact) : c))
      );
      return data as Contact;
    },
    []
  );

  const deleteContact = useCallback(async (id: string) => {
    const supabase = createClient();
    const { error: err } = await supabase
      .from("contacts")
      .delete()
      .eq("id", id);

    if (err) throw new Error(err.message);
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
    contacts,
    isLoading,
    error,
    refetch: fetchContacts,
    createContact,
    updateContact,
    deleteContact,
  };
}
