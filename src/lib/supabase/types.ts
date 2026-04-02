export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    PostgrestVersion: "12"
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          avatar_url: string | null;
          role: "admin" | "gestor" | "usuario";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          avatar_url?: string | null;
          role?: "admin" | "gestor" | "usuario";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          email?: string;
          avatar_url?: string | null;
          role?: "admin" | "gestor" | "usuario";
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          company: string | null;
          cpf_cnpj: string | null;
          type: "lead" | "prospect" | "client";
          pipeline_stage:
            | "new"
            | "contacted"
            | "qualified"
            | "proposal"
            | "negotiation"
            | "won"
            | "lost";
          owner_id: string | null;
          tags: string[];
          notes: string | null;
          source: string | null;
          custom_fields: Json;
          deal_value: number | null;
          rating: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          cpf_cnpj?: string | null;
          type?: "lead" | "prospect" | "client";
          pipeline_stage?:
            | "new"
            | "contacted"
            | "qualified"
            | "proposal"
            | "negotiation"
            | "won"
            | "lost";
          owner_id?: string | null;
          tags?: string[];
          notes?: string | null;
          source?: string | null;
          custom_fields?: Json;
          deal_value?: number | null;
          rating?: number | null;
        };
        Update: {
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          cpf_cnpj?: string | null;
          type?: "lead" | "prospect" | "client";
          pipeline_stage?:
            | "new"
            | "contacted"
            | "qualified"
            | "proposal"
            | "negotiation"
            | "won"
            | "lost";
          owner_id?: string | null;
          tags?: string[];
          notes?: string | null;
          source?: string | null;
          custom_fields?: Json;
          deal_value?: number | null;
          rating?: number | null;
          updated_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          contact_id: string;
          user_id: string | null;
          type:
            | "note"
            | "call"
            | "email"
            | "whatsapp"
            | "meeting"
            | "stage_change"
            | "contract_sent";
          description: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          contact_id: string;
          user_id?: string | null;
          type:
            | "note"
            | "call"
            | "email"
            | "whatsapp"
            | "meeting"
            | "stage_change"
            | "contract_sent";
          description: string;
          metadata?: Json;
        };
        Update: {
          description?: string;
          metadata?: Json;
        };
      };
      conversations: {
        Row: {
          id: string;
          contact_id: string | null;
          channel: "chat" | "whatsapp" | "email";
          status: "open" | "closed" | "bot";
          assigned_to: string | null;
          n8n_session_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contact_id?: string | null;
          channel?: "chat" | "whatsapp" | "email";
          status?: "open" | "closed" | "bot";
          assigned_to?: string | null;
          n8n_session_id?: string | null;
        };
        Update: {
          contact_id?: string | null;
          channel?: "chat" | "whatsapp" | "email";
          status?: "open" | "closed" | "bot";
          assigned_to?: string | null;
          n8n_session_id?: string | null;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_type: "user" | "contact" | "agent";
          sender_id: string | null;
          content: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_type: "user" | "contact" | "agent";
          sender_id?: string | null;
          content: string;
          metadata?: Json;
        };
        Update: {
          content?: string;
          metadata?: Json;
        };
      };
      email_campaigns: {
        Row: {
          id: string;
          name: string;
          subject: string;
          from_name: string;
          from_email: string;
          body_html: string;
          body_text: string | null;
          status: "draft" | "scheduled" | "sending" | "sent" | "cancelled";
          scheduled_at: string | null;
          sent_at: string | null;
          created_by: string | null;
          stats: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          subject: string;
          from_name: string;
          from_email: string;
          body_html: string;
          body_text?: string | null;
          status?: "draft" | "scheduled" | "sending" | "sent" | "cancelled";
          scheduled_at?: string | null;
          created_by?: string | null;
          stats?: Json;
        };
        Update: {
          name?: string;
          subject?: string;
          from_name?: string;
          from_email?: string;
          body_html?: string;
          body_text?: string | null;
          status?: "draft" | "scheduled" | "sending" | "sent" | "cancelled";
          scheduled_at?: string | null;
          sent_at?: string | null;
          stats?: Json;
        };
      };
      email_lists: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
        };
      };
      email_templates: {
        Row: {
          id: string;
          name: string;
          subject: string;
          body_html: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          subject: string;
          body_html: string;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          subject?: string;
          body_html?: string;
        };
      };
      ad_campaigns: {
        Row: {
          id: string;
          name: string;
          platform: "google" | "meta";
          external_id: string | null;
          status: "active" | "paused" | "ended" | "draft";
          budget_daily: number | null;
          budget_total: number | null;
          start_date: string | null;
          end_date: string | null;
          metrics: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          platform: "google" | "meta";
          external_id?: string | null;
          status?: "active" | "paused" | "ended" | "draft";
          budget_daily?: number | null;
          budget_total?: number | null;
          start_date?: string | null;
          end_date?: string | null;
          metrics?: Json;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          platform?: "google" | "meta";
          external_id?: string | null;
          status?: "active" | "paused" | "ended" | "draft";
          budget_daily?: number | null;
          budget_total?: number | null;
          start_date?: string | null;
          end_date?: string | null;
          metrics?: Json;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          type: "revenue" | "expense";
          category: string;
          description: string;
          amount: number;
          date: string;
          contact_id: string | null;
          contract_id: string | null;
          status: "pending" | "confirmed" | "cancelled";
          payment_method: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: "revenue" | "expense";
          category: string;
          description: string;
          amount: number;
          date: string;
          contact_id?: string | null;
          contract_id?: string | null;
          status?: "pending" | "confirmed" | "cancelled";
          payment_method?: string | null;
          notes?: string | null;
          created_by?: string | null;
        };
        Update: {
          type?: "revenue" | "expense";
          category?: string;
          description?: string;
          amount?: number;
          date?: string;
          contact_id?: string | null;
          contract_id?: string | null;
          status?: "pending" | "confirmed" | "cancelled";
          payment_method?: string | null;
          notes?: string | null;
        };
      };
      contracts: {
        Row: {
          id: string;
          title: string;
          contact_id: string;
          value: number | null;
          body_html: string;
          status: "draft" | "sent" | "signed" | "cancelled";
          signed_at: string | null;
          sent_at: string | null;
          file_url: string | null;
          signature_token: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          contact_id: string;
          value?: number | null;
          body_html: string;
          status?: "draft" | "sent" | "signed" | "cancelled";
          signed_at?: string | null;
          sent_at?: string | null;
          file_url?: string | null;
          signature_token?: string | null;
          created_by?: string | null;
        };
        Update: {
          title?: string;
          contact_id?: string;
          value?: number | null;
          body_html?: string;
          status?: "draft" | "sent" | "signed" | "cancelled";
          signed_at?: string | null;
          sent_at?: string | null;
          file_url?: string | null;
          signature_token?: string | null;
          updated_at?: string;
        };
      };
      role_permissions: {
        Row: {
          id: string;
          role: "admin" | "gestor" | "usuario";
          resource: string;
          action: "view" | "create" | "edit" | "delete";
          allowed: boolean;
        };
        Insert: {
          id?: string;
          role: "admin" | "gestor" | "usuario";
          resource: string;
          action: "view" | "create" | "edit" | "delete";
          allowed: boolean;
        };
        Update: {
          allowed?: boolean;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_role: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
export type Activity = Database["public"]["Tables"]["activities"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type EmailCampaign =
  Database["public"]["Tables"]["email_campaigns"]["Row"];
export type EmailList = Database["public"]["Tables"]["email_lists"]["Row"];
export type EmailTemplate =
  Database["public"]["Tables"]["email_templates"]["Row"];
export type AdCampaign = Database["public"]["Tables"]["ad_campaigns"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type Contract = Database["public"]["Tables"]["contracts"]["Row"];
export type RolePermission =
  Database["public"]["Tables"]["role_permissions"]["Row"];
