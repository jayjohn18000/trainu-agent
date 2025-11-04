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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_feed: {
        Row: {
          action: string
          client_id: string | null
          client_name: string
          confidence: number | null
          created_at: string | null
          ghl_channel: string | null
          ghl_delivered_at: string | null
          ghl_message_id: string | null
          ghl_read_at: string | null
          ghl_status: string | null
          id: string
          message_preview: string | null
          status: string | null
          trainer_id: string | null
          why: string | null
        }
        Insert: {
          action: string
          client_id?: string | null
          client_name: string
          confidence?: number | null
          created_at?: string | null
          ghl_channel?: string | null
          ghl_delivered_at?: string | null
          ghl_message_id?: string | null
          ghl_read_at?: string | null
          ghl_status?: string | null
          id?: string
          message_preview?: string | null
          status?: string | null
          trainer_id?: string | null
          why?: string | null
        }
        Update: {
          action?: string
          client_id?: string | null
          client_name?: string
          confidence?: number | null
          created_at?: string | null
          ghl_channel?: string | null
          ghl_delivered_at?: string | null
          ghl_message_id?: string | null
          ghl_read_at?: string | null
          ghl_status?: string | null
          id?: string
          message_preview?: string | null
          status?: string | null
          trainer_id?: string | null
          why?: string | null
        }
        Relationships: []
      }
      agent_status: {
        Row: {
          avg_response_time: string | null
          clients_at_risk: number | null
          id: string
          messages_sent_today: number | null
          response_rate: number | null
          state: string | null
          trainer_id: string | null
          updated_at: string | null
        }
        Insert: {
          avg_response_time?: string | null
          clients_at_risk?: number | null
          id?: string
          messages_sent_today?: number | null
          response_rate?: number | null
          state?: string | null
          trainer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avg_response_time?: string | null
          clients_at_risk?: number | null
          id?: string
          messages_sent_today?: number | null
          response_rate?: number | null
          state?: string | null
          trainer_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      auto_approval_settings: {
        Row: {
          created_at: string
          enabled: boolean
          high_confidence_threshold: number
          id: string
          max_daily_auto_approvals: number
          preview_window_minutes: number
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          high_confidence_threshold?: number
          id?: string
          max_daily_auto_approvals?: number
          preview_window_minutes?: number
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          high_confidence_threshold?: number
          id?: string
          max_daily_auto_approvals?: number
          preview_window_minutes?: number
          trainer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          contact_id: string
          created_at: string | null
          ghl_appointment_id: string | null
          id: string
          notes: string | null
          scheduled_at: string
          session_type: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          ghl_appointment_id?: string | null
          id?: string
          notes?: string | null
          scheduled_at: string
          session_type?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          ghl_appointment_id?: string | null
          id?: string
          notes?: string | null
          scheduled_at?: string
          session_type?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          consent_status: Database["public"]["Enums"]["consent_status"] | null
          created_at: string | null
          email: string | null
          first_name: string
          ghl_contact_id: string | null
          id: string
          last_message_sent_at: string | null
          last_name: string | null
          messages_sent_this_week: number | null
          messages_sent_today: number | null
          phone: string | null
          tags: string[] | null
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          consent_status?: Database["public"]["Enums"]["consent_status"] | null
          created_at?: string | null
          email?: string | null
          first_name: string
          ghl_contact_id?: string | null
          id?: string
          last_message_sent_at?: string | null
          last_name?: string | null
          messages_sent_this_week?: number | null
          messages_sent_today?: number | null
          phone?: string | null
          tags?: string[] | null
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          consent_status?: Database["public"]["Enums"]["consent_status"] | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          ghl_contact_id?: string | null
          id?: string
          last_message_sent_at?: string | null
          last_name?: string | null
          messages_sent_this_week?: number | null
          messages_sent_today?: number | null
          phone?: string | null
          tags?: string[] | null
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      conversation_history: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          tool_calls: Json | null
          trainer_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          tool_calls?: Json | null
          trainer_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          tool_calls?: Json | null
          trainer_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          metadata: Json | null
          trainer_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          trainer_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          trainer_id?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          enabled: boolean | null
          flag_name: string
          id: string
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          enabled?: boolean | null
          flag_name: string
          id?: string
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          enabled?: boolean | null
          flag_name?: string
          id?: string
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ghl_config: {
        Row: {
          booking_widget_id: string | null
          contact_field_mapping: Json | null
          created_at: string | null
          default_channel: string | null
          email_enabled: boolean | null
          frequency_cap_daily: number | null
          frequency_cap_weekly: number | null
          id: string
          location_id: string
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sms_enabled: boolean | null
          templates: Json | null
          trainer_id: string
          updated_at: string | null
          webhook_registered: boolean | null
        }
        Insert: {
          booking_widget_id?: string | null
          contact_field_mapping?: Json | null
          created_at?: string | null
          default_channel?: string | null
          email_enabled?: boolean | null
          frequency_cap_daily?: number | null
          frequency_cap_weekly?: number | null
          id?: string
          location_id: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_enabled?: boolean | null
          templates?: Json | null
          trainer_id: string
          updated_at?: string | null
          webhook_registered?: boolean | null
        }
        Update: {
          booking_widget_id?: string | null
          contact_field_mapping?: Json | null
          created_at?: string | null
          default_channel?: string | null
          email_enabled?: boolean | null
          frequency_cap_daily?: number | null
          frequency_cap_weekly?: number | null
          id?: string
          location_id?: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_enabled?: boolean | null
          templates?: Json | null
          trainer_id?: string
          updated_at?: string | null
          webhook_registered?: boolean | null
        }
        Relationships: []
      }
      insights: {
        Row: {
          contact_id: string
          current_streak: number | null
          engagement_score: number | null
          id: string
          last_activity_at: string | null
          missed_sessions: number | null
          response_rate: number | null
          risk_score: number | null
          total_sessions: number | null
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          contact_id: string
          current_streak?: number | null
          engagement_score?: number | null
          id?: string
          last_activity_at?: string | null
          missed_sessions?: number | null
          response_rate?: number | null
          risk_score?: number | null
          total_sessions?: number | null
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          contact_id?: string
          current_streak?: number | null
          engagement_score?: number | null
          id?: string
          last_activity_at?: string | null
          missed_sessions?: number | null
          response_rate?: number | null
          risk_score?: number | null
          total_sessions?: number | null
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insights_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          name: string
          tone: string | null
          trainer_id: string | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          name: string
          tone?: string | null
          trainer_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          name?: string
          tone?: string | null
          trainer_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          auto_approval_at: string | null
          channel: Database["public"]["Enums"]["message_channel"] | null
          confidence: number | null
          contact_id: string
          content: string
          created_at: string | null
          edit_count: number
          expires_at: string | null
          generated_by: string | null
          ghl_delivered_at: string | null
          ghl_message_id: string | null
          ghl_read_at: string | null
          ghl_status: string | null
          id: string
          scheduled_for: string | null
          status: Database["public"]["Enums"]["message_status"] | null
          trainer_id: string
          updated_at: string | null
          why_reasons: string[] | null
        }
        Insert: {
          auto_approval_at?: string | null
          channel?: Database["public"]["Enums"]["message_channel"] | null
          confidence?: number | null
          contact_id: string
          content: string
          created_at?: string | null
          edit_count?: number
          expires_at?: string | null
          generated_by?: string | null
          ghl_delivered_at?: string | null
          ghl_message_id?: string | null
          ghl_read_at?: string | null
          ghl_status?: string | null
          id?: string
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["message_status"] | null
          trainer_id: string
          updated_at?: string | null
          why_reasons?: string[] | null
        }
        Update: {
          auto_approval_at?: string | null
          channel?: Database["public"]["Enums"]["message_channel"] | null
          confidence?: number | null
          contact_id?: string
          content?: string
          created_at?: string | null
          edit_count?: number
          expires_at?: string | null
          generated_by?: string | null
          ghl_delivered_at?: string | null
          ghl_message_id?: string | null
          ghl_read_at?: string | null
          ghl_status?: string | null
          id?: string
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["message_status"] | null
          trainer_id?: string
          updated_at?: string | null
          why_reasons?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      queue_items: {
        Row: {
          client_id: string
          client_name: string
          confidence: number | null
          created_at: string | null
          id: string
          preview: string
          scheduled_for: string | null
          status: string | null
          trainer_id: string | null
          updated_at: string | null
          why: string[] | null
        }
        Insert: {
          client_id: string
          client_name: string
          confidence?: number | null
          created_at?: string | null
          id?: string
          preview: string
          scheduled_for?: string | null
          status?: string | null
          trainer_id?: string | null
          updated_at?: string | null
          why?: string[] | null
        }
        Update: {
          client_id?: string
          client_name?: string
          confidence?: number | null
          created_at?: string | null
          id?: string
          preview?: string
          scheduled_for?: string | null
          status?: string | null
          trainer_id?: string | null
          updated_at?: string | null
          why?: string[] | null
        }
        Relationships: []
      }
      tag_suggestions: {
        Row: {
          applied: boolean | null
          applied_at: string | null
          confidence: number | null
          contact_id: string
          created_at: string | null
          id: string
          reason: string
          suggested_tag: string
          trainer_id: string
        }
        Insert: {
          applied?: boolean | null
          applied_at?: string | null
          confidence?: number | null
          contact_id: string
          created_at?: string | null
          id?: string
          reason: string
          suggested_tag: string
          trainer_id: string
        }
        Update: {
          applied?: boolean | null
          applied_at?: string | null
          confidence?: number | null
          contact_id?: string
          created_at?: string | null
          id?: string
          reason?: string
          suggested_tag?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tag_suggestions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_achievements: {
        Row: {
          achievement_description: string | null
          achievement_id: string
          achievement_name: string
          id: string
          trainer_id: string | null
          unlocked_at: string | null
        }
        Insert: {
          achievement_description?: string | null
          achievement_id: string
          achievement_name: string
          id?: string
          trainer_id?: string | null
          unlocked_at?: string | null
        }
        Update: {
          achievement_description?: string | null
          achievement_id?: string
          achievement_name?: string
          id?: string
          trainer_id?: string | null
          unlocked_at?: string | null
        }
        Relationships: []
      }
      trainer_edits: {
        Row: {
          created_at: string
          edit_type: string
          edited_content: string
          id: string
          message_id: string
          original_confidence: number | null
          original_content: string
          trainer_id: string
        }
        Insert: {
          created_at?: string
          edit_type?: string
          edited_content: string
          id?: string
          message_id: string
          original_confidence?: number | null
          original_content: string
          trainer_id: string
        }
        Update: {
          created_at?: string
          edit_type?: string
          edited_content?: string
          id?: string
          message_id?: string
          original_confidence?: number | null
          original_content?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_edits_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_profiles: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_active_date: string | null
          level: number | null
          longest_streak: number | null
          total_clients_nudged: number | null
          total_messages_approved: number | null
          total_messages_edited: number | null
          updated_at: string | null
          xp: number | null
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id: string
          last_active_date?: string | null
          level?: number | null
          longest_streak?: number | null
          total_clients_nudged?: number | null
          total_messages_approved?: number | null
          total_messages_edited?: number | null
          updated_at?: string | null
          xp?: number | null
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_active_date?: string | null
          level?: number | null
          longest_streak?: number | null
          total_clients_nudged?: number | null
          total_messages_approved?: number | null
          total_messages_edited?: number | null
          updated_at?: string | null
          xp?: number | null
        }
        Relationships: []
      }
      xp_history: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          reason: string
          trainer_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          reason: string
          trainer_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          reason?: string
          trainer_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_message_counters: {
        Args: { contact_id: string }
        Returns: undefined
      }
      increment_trainer_stat: {
        Args: { stat_name: string; trainer_id: string }
        Returns: undefined
      }
    }
    Enums: {
      booking_status:
        | "scheduled"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "no_show"
      consent_status: "active" | "pending" | "opted_out"
      message_channel: "sms" | "email" | "both"
      message_status:
        | "draft"
        | "queued"
        | "sent"
        | "delivered"
        | "read"
        | "failed"
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
      booking_status: [
        "scheduled",
        "confirmed",
        "cancelled",
        "completed",
        "no_show",
      ],
      consent_status: ["active", "pending", "opted_out"],
      message_channel: ["sms", "email", "both"],
      message_status: [
        "draft",
        "queued",
        "sent",
        "delivered",
        "read",
        "failed",
      ],
    },
  },
} as const
