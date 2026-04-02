import { createClient } from "@/lib/supabase/client";
import type { Contact } from "@/lib/supabase/types";

export type ContactInsert = Omit<Contact, "id" | "created_at" | "updated_at">;
export type ContactUpdate = Partial<ContactInsert>;

export const contactService = {
  async getAll(): Promise<Contact[]> {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const { data, error } = await db
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getById(id: string): Promise<Contact | null> {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const { data, error } = await db
      .from("contacts")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(payload: ContactInsert): Promise<Contact> {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const { data, error } = await db
      .from("contacts")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, payload: ContactUpdate): Promise<Contact> {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const { data, error } = await db
      .from("contacts")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const { error } = await db.from("contacts").delete().eq("id", id);
    if (error) throw error;
  },

  /** Move contact to a different pipeline stage and log activity. */
  async moveStage(id: string, newStage: string, stageLabel: string): Promise<void> {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const { error } = await db
      .from("contacts")
      .update({ pipeline_stage: newStage, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    await db.from("activities").insert({
      contact_id: id,
      type: "stage_change",
      description: `Movido para ${stageLabel}`,
    });
  },
};
