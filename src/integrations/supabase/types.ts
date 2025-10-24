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
      increment_trainer_stat: {
        Args: { stat_name: string; trainer_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
