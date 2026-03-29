"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Contact } from "@/lib/supabase/types";

/**
 * Manages contact mutations client-side.
 * Initial data is fetched server-side and passed as `initialContacts`.
 */
export function useContacts(initialContacts: Contact[] = []) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);

  const createContact = useCallback(
    async (contact: Omit<Contact, "id" | "created_at" | "updated_at">) => {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      const { data, error: err } = await db
        .from("contacts")
        .insert(contact)
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
      const db = supabase as any;
      const { data, error: err } = await db
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase as any)
      .from("contacts")
      .delete()
      .eq("id", id);

    if (err) throw new Error(err.message);
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
    contacts,
    setContacts,
    createContact,
    updateContact,
    deleteContact,
  };
}
