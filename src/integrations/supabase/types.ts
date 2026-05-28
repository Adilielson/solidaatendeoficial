export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_settings: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          instructions: string | null
          name: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          instructions?: string | null
          name?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          instructions?: string | null
          name?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          ai_global_enabled: boolean
          business_hours: Json
          created_at: string
          followup_enabled: boolean
          followup_intervals_hours: number[]
          followup_template_first: string
          followup_template_second: string
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          slug: string
          uazapi_admin_token: string | null
          uazapi_server_url: string | null
          updated_at: string
          voice_enabled: boolean
          voice_id: string
        }
        Insert: {
          ai_global_enabled?: boolean
          business_hours?: Json
          created_at?: string
          followup_enabled?: boolean
          followup_intervals_hours?: number[]
          followup_template_first?: string
          followup_template_second?: string
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          slug: string
          uazapi_admin_token?: string | null
          uazapi_server_url?: string | null
          updated_at?: string
          voice_enabled?: boolean
          voice_id?: string
        }
        Update: {
          ai_global_enabled?: boolean
          business_hours?: Json
          created_at?: string
          followup_enabled?: boolean
          followup_intervals_hours?: number[]
          followup_template_first?: string
          followup_template_second?: string
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          slug?: string
          uazapi_admin_token?: string | null
          uazapi_server_url?: string | null
          updated_at?: string
          voice_enabled?: boolean
          voice_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "companies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["company_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["company_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["company_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          company_id: string
          created_at: string
          email: string | null
          id: string
          last_contact_at: string | null
          lead_status: Database["public"]["Enums"]["lead_status"]
          metadata: Json | null
          name: string | null
          phone: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          email?: string | null
          id?: string
          last_contact_at?: string | null
          lead_status?: Database["public"]["Enums"]["lead_status"]
          metadata?: Json | null
          name?: string | null
          phone: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          email?: string | null
          id?: string
          last_contact_at?: string | null
          lead_status?: Database["public"]["Enums"]["lead_status"]
          metadata?: Json | null
          name?: string | null
          phone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          ai_enabled: boolean
          assigned_to: string | null
          company_id: string
          contact_id: string
          created_at: string
          followup_count: number
          followup_status: Database["public"]["Enums"]["followup_status"]
          id: string
          last_followup_at: string | null
          last_message_at: string | null
          status: Database["public"]["Enums"]["conversation_status"]
          subject: string | null
          triage_completed_at: string | null
          updated_at: string
          whatsapp_instance_id: string | null
        }
        Insert: {
          ai_enabled?: boolean
          assigned_to?: string | null
          company_id: string
          contact_id: string
          created_at?: string
          followup_count?: number
          followup_status?: Database["public"]["Enums"]["followup_status"]
          id?: string
          last_followup_at?: string | null
          last_message_at?: string | null
          status?: Database["public"]["Enums"]["conversation_status"]
          subject?: string | null
          triage_completed_at?: string | null
          updated_at?: string
          whatsapp_instance_id?: string | null
        }
        Update: {
          ai_enabled?: boolean
          assigned_to?: string | null
          company_id?: string
          contact_id?: string
          created_at?: string
          followup_count?: number
          followup_status?: Database["public"]["Enums"]["followup_status"]
          id?: string
          last_followup_at?: string | null
          last_message_at?: string | null
          status?: Database["public"]["Enums"]["conversation_status"]
          subject?: string | null
          triage_completed_at?: string | null
          updated_at?: string
          whatsapp_instance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_whatsapp_instance_id_fkey"
            columns: ["whatsapp_instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_purchases: {
        Row: {
          amount: number
          company_id: string
          contact_id: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          occurred_at: string
          product_id: string | null
          product_name: string
          purchase_type: string
          updated_at: string
        }
        Insert: {
          amount?: number
          company_id: string
          contact_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          occurred_at?: string
          product_id?: string | null
          product_name: string
          purchase_type?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          company_id?: string
          contact_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          occurred_at?: string
          product_id?: string | null
          product_name?: string
          purchase_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      followup_logs: {
        Row: {
          attempt_number: number
          company_id: string
          conversation_id: string
          error: string | null
          id: string
          message: string
          sent_at: string
          status: Database["public"]["Enums"]["followup_send_status"]
          template_used: string
        }
        Insert: {
          attempt_number: number
          company_id: string
          conversation_id: string
          error?: string | null
          id?: string
          message: string
          sent_at?: string
          status: Database["public"]["Enums"]["followup_send_status"]
          template_used: string
        }
        Update: {
          attempt_number?: number
          company_id?: string
          conversation_id?: string
          error?: string | null
          id?: string
          message?: string
          sent_at?: string
          status?: Database["public"]["Enums"]["followup_send_status"]
          template_used?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          direction: Database["public"]["Enums"]["message_direction"]
          id: string
          is_from_bot: boolean
          media_type: string | null
          media_url: string | null
          sender_id: string | null
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          direction: Database["public"]["Enums"]["message_direction"]
          id?: string
          is_from_bot?: boolean
          media_type?: string | null
          media_url?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          direction?: Database["public"]["Enums"]["message_direction"]
          id?: string
          is_from_bot?: boolean
          media_type?: string | null
          media_url?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          agent_limit: number
          annual_price: number
          created_at: string
          features: Json | null
          id: string
          message_limit: number
          monthly_price: number
          name: string
          status: Database["public"]["Enums"]["plan_status"]
          updated_at: string
        }
        Insert: {
          agent_limit?: number
          annual_price?: number
          created_at?: string
          features?: Json | null
          id?: string
          message_limit?: number
          monthly_price?: number
          name: string
          status?: Database["public"]["Enums"]["plan_status"]
          updated_at?: string
        }
        Update: {
          agent_limit?: number
          annual_price?: number
          created_at?: string
          features?: Json | null
          id?: string
          message_limit?: number
          monthly_price?: number
          name?: string
          status?: Database["public"]["Enums"]["plan_status"]
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price: number | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sandbox_sessions: {
        Row: {
          company_id: string
          created_at: string
          id: string
          lead_status: Database["public"]["Enums"]["lead_status"] | null
          messages: Json
          mode: string
          summary: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          lead_status?: Database["public"]["Enums"]["lead_status"] | null
          messages?: Json
          mode?: string
          summary?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          lead_status?: Database["public"]["Enums"]["lead_status"] | null
          messages?: Json
          mode?: string
          summary?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          company_id: string
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: Database["public"]["Enums"]["subscription_status"]
        }
        Insert: {
          company_id: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status?: Database["public"]["Enums"]["subscription_status"]
        }
        Update: {
          company_id?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      triage_flows: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "triage_flows_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      triage_steps: {
        Row: {
          conclusion_action:
            | Database["public"]["Enums"]["conclusion_action"]
            | null
          created_at: string
          field_type: Database["public"]["Enums"]["field_type"]
          flow_id: string
          id: string
          is_required: boolean
          options: Json | null
          order_position: number
          question: string
        }
        Insert: {
          conclusion_action?:
            | Database["public"]["Enums"]["conclusion_action"]
            | null
          created_at?: string
          field_type?: Database["public"]["Enums"]["field_type"]
          flow_id: string
          id?: string
          is_required?: boolean
          options?: Json | null
          order_position?: number
          question: string
        }
        Update: {
          conclusion_action?:
            | Database["public"]["Enums"]["conclusion_action"]
            | null
          created_at?: string
          field_type?: Database["public"]["Enums"]["field_type"]
          flow_id?: string
          id?: string
          is_required?: boolean
          options?: Json | null
          order_position?: number
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "triage_steps_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "triage_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_instances: {
        Row: {
          company_id: string
          created_at: string
          id: string
          instance_name: string
          instance_token: string | null
          is_connected: boolean
          last_connection_at: string | null
          phone_number: string | null
          qrcode_base64: string | null
          server_url: string | null
          status: Database["public"]["Enums"]["whatsapp_status"]
          token_label: string | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          instance_name: string
          instance_token?: string | null
          is_connected?: boolean
          last_connection_at?: string | null
          phone_number?: string | null
          qrcode_base64?: string | null
          server_url?: string | null
          status?: Database["public"]["Enums"]["whatsapp_status"]
          token_label?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          instance_name?: string
          instance_token?: string | null
          is_connected?: boolean
          last_connection_at?: string | null
          phone_number?: string | null
          qrcode_base64?: string | null
          server_url?: string | null
          status?: Database["public"]["Enums"]["whatsapp_status"]
          token_label?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_instances_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_default_triage_flow: {
        Args: { _company_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_company_admin: { Args: { _company_id: string }; Returns: boolean }
      is_company_member: { Args: { _company_id: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      unaccent_safe: { Args: { txt: string }; Returns: string }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "user"
      company_role: "admin" | "agent"
      conclusion_action: "transfer" | "schedule" | "discard"
      conversation_status: "open" | "closed" | "pending"
      field_type: "text" | "list"
      followup_send_status: "sent" | "failed" | "blocked" | "invalid_number"
      followup_status: "active" | "exhausted" | "failed" | "disabled"
      instance_status: "connected" | "disconnected" | "connecting"
      lead_status: "unclassified" | "qualified" | "discarded"
      message_direction: "inbound" | "outbound"
      plan_status: "active" | "draft"
      subscription_status: "active" | "canceled" | "past_due" | "trialing"
      whatsapp_status: "connected" | "disconnected" | "pending"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "user"],
      company_role: ["admin", "agent"],
      conclusion_action: ["transfer", "schedule", "discard"],
      conversation_status: ["open", "closed", "pending"],
      field_type: ["text", "list"],
      followup_send_status: ["sent", "failed", "blocked", "invalid_number"],
      followup_status: ["active", "exhausted", "failed", "disabled"],
      instance_status: ["connected", "disconnected", "connecting"],
      lead_status: ["unclassified", "qualified", "discarded"],
      message_direction: ["inbound", "outbound"],
      plan_status: ["active", "draft"],
      subscription_status: ["active", "canceled", "past_due", "trialing"],
      whatsapp_status: ["connected", "disconnected", "pending"],
    },
  },
} as const
