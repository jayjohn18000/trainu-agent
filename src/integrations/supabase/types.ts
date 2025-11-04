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
      ab_test_assignments: {
        Row: {
          assigned_at: string | null
          client_id: string
          id: string
          test_id: string
          variant_id: string
        }
        Insert: {
          assigned_at?: string | null
          client_id: string
          id?: string
          test_id: string
          variant_id: string
        }
        Update: {
          assigned_at?: string | null
          client_id?: string
          id?: string
          test_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_assignments_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_assignments_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "ab_test_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_test_events: {
        Row: {
          event_type: string
          event_value: Json | null
          id: string
          occurred_at: string | null
          performance_id: string
        }
        Insert: {
          event_type: string
          event_value?: Json | null
          id?: string
          occurred_at?: string | null
          performance_id: string
        }
        Update: {
          event_type?: string
          event_value?: Json | null
          id?: string
          occurred_at?: string | null
          performance_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_events_performance_id_fkey"
            columns: ["performance_id"]
            isOneToOne: false
            referencedRelation: "ab_test_performance"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_test_performance: {
        Row: {
          assignment_id: string
          click_event: boolean | null
          client_id: string
          conversion_event: boolean | null
          engagement_score: number | null
          id: string
          recorded_at: string | null
          response_time_minutes: number | null
          test_id: string
          variant_id: string
        }
        Insert: {
          assignment_id: string
          click_event?: boolean | null
          client_id: string
          conversion_event?: boolean | null
          engagement_score?: number | null
          id?: string
          recorded_at?: string | null
          response_time_minutes?: number | null
          test_id: string
          variant_id: string
        }
        Update: {
          assignment_id?: string
          click_event?: boolean | null
          client_id?: string
          conversion_event?: boolean | null
          engagement_score?: number | null
          id?: string
          recorded_at?: string | null
          response_time_minutes?: number | null
          test_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_performance_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "ab_test_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_performance_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_performance_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_performance_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "ab_test_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_test_variants: {
        Row: {
          content_modifications: Json | null
          created_at: string | null
          id: string
          is_control: boolean | null
          strategy_config: Json | null
          template_id: string | null
          test_id: string
          traffic_split: number
          variant_index: number
          variant_name: string
        }
        Insert: {
          content_modifications?: Json | null
          created_at?: string | null
          id?: string
          is_control?: boolean | null
          strategy_config?: Json | null
          template_id?: string | null
          test_id: string
          traffic_split: number
          variant_index: number
          variant_name: string
        }
        Update: {
          content_modifications?: Json | null
          created_at?: string | null
          id?: string
          is_control?: boolean | null
          strategy_config?: Json | null
          template_id?: string | null
          test_id?: string
          traffic_split?: number
          variant_index?: number
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_variants_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_tests: {
        Row: {
          completed_at: string | null
          created_at: string | null
          effect_size: number | null
          hypothesis: string
          id: string
          sample_size_target: number | null
          significance_level: number | null
          status: string
          target_audience: Json | null
          target_metrics: Json | null
          test_duration_days: number
          test_name: string
          test_type: string
          trainer_id: string
          updated_at: string | null
          winner_variant_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          effect_size?: number | null
          hypothesis: string
          id?: string
          sample_size_target?: number | null
          significance_level?: number | null
          status?: string
          target_audience?: Json | null
          target_metrics?: Json | null
          test_duration_days: number
          test_name: string
          test_type: string
          trainer_id: string
          updated_at?: string | null
          winner_variant_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          effect_size?: number | null
          hypothesis?: string
          id?: string
          sample_size_target?: number | null
          significance_level?: number | null
          status?: string
          target_audience?: Json | null
          target_metrics?: Json | null
          test_duration_days?: number
          test_name?: string
          test_type?: string
          trainer_id?: string
          updated_at?: string | null
          winner_variant_id?: string | null
        }
        Relationships: []
      }
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
      analytics_events: {
        Row: {
          client_id: string | null
          event_name: string
          id: string
          ip_address: unknown
          properties: Json | null
          session_id: string | null
          source: string | null
          timestamp: string | null
          trainer_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          event_name: string
          id?: string
          ip_address?: unknown
          properties?: Json | null
          session_id?: string | null
          source?: string | null
          timestamp?: string | null
          trainer_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          event_name?: string
          id?: string
          ip_address?: unknown
          properties?: Json | null
          session_id?: string | null
          source?: string | null
          timestamp?: string | null
          trainer_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      api_endpoint_status: {
        Row: {
          consecutive_failures: number | null
          details: Json | null
          endpoint: string
          id: string
          last_check: string | null
          last_successful: string | null
          response_time_ms: number | null
          status: number | null
        }
        Insert: {
          consecutive_failures?: number | null
          details?: Json | null
          endpoint: string
          id?: string
          last_check?: string | null
          last_successful?: string | null
          response_time_ms?: number | null
          status?: number | null
        }
        Update: {
          consecutive_failures?: number | null
          details?: Json | null
          endpoint?: string
          id?: string
          last_check?: string | null
          last_successful?: string | null
          response_time_ms?: number | null
          status?: number | null
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
      client_nudge_history: {
        Row: {
          booking_generated: boolean | null
          campaign_id: string
          contact_id: string
          created_at: string
          effectiveness_score: number | null
          id: string
          response_received: boolean | null
          response_time_hours: number | null
          revenue_attributed: number | null
          sent_at: string | null
          template_id: string
          trainer_id: string
        }
        Insert: {
          booking_generated?: boolean | null
          campaign_id: string
          contact_id: string
          created_at?: string
          effectiveness_score?: number | null
          id?: string
          response_received?: boolean | null
          response_time_hours?: number | null
          revenue_attributed?: number | null
          sent_at?: string | null
          template_id: string
          trainer_id: string
        }
        Update: {
          booking_generated?: boolean | null
          campaign_id?: string
          contact_id?: string
          created_at?: string
          effectiveness_score?: number | null
          id?: string
          response_received?: boolean | null
          response_time_hours?: number | null
          revenue_attributed?: number | null
          sent_at?: string | null
          template_id?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_nudge_history_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "nudge_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_nudge_history_contact_id_fkey"
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
      cost_tracking_metrics: {
        Row: {
          billing_period: string | null
          cost_per_unit: number | null
          cost_usd: number
          id: string
          metadata: Json | null
          recorded_at: string | null
          service_name: string
          usage_units: number | null
        }
        Insert: {
          billing_period?: string | null
          cost_per_unit?: number | null
          cost_usd: number
          id?: string
          metadata?: Json | null
          recorded_at?: string | null
          service_name: string
          usage_units?: number | null
        }
        Update: {
          billing_period?: string | null
          cost_per_unit?: number | null
          cost_usd?: number
          id?: string
          metadata?: Json | null
          recorded_at?: string | null
          service_name?: string
          usage_units?: number | null
        }
        Relationships: []
      }
      database_performance_metrics: {
        Row: {
          active_connections: number | null
          connection_time_ms: number | null
          database_size_gb: number | null
          id: string
          query_cache_hit_rate: number | null
          recorded_at: string | null
          slow_query_count: number | null
          total_query_count: number | null
        }
        Insert: {
          active_connections?: number | null
          connection_time_ms?: number | null
          database_size_gb?: number | null
          id?: string
          query_cache_hit_rate?: number | null
          recorded_at?: string | null
          slow_query_count?: number | null
          total_query_count?: number | null
        }
        Update: {
          active_connections?: number | null
          connection_time_ms?: number | null
          database_size_gb?: number | null
          id?: string
          query_cache_hit_rate?: number | null
          recorded_at?: string | null
          slow_query_count?: number | null
          total_query_count?: number | null
        }
        Relationships: []
      }
      edge_function_metrics: {
        Row: {
          cpu_usage_percentage: number | null
          error_count: number | null
          executed_at: string | null
          execution_time_ms: number | null
          function_name: string
          id: string
          memory_usage_mb: number | null
          trainer_id: string | null
        }
        Insert: {
          cpu_usage_percentage?: number | null
          error_count?: number | null
          executed_at?: string | null
          execution_time_ms?: number | null
          function_name: string
          id?: string
          memory_usage_mb?: number | null
          trainer_id?: string | null
        }
        Update: {
          cpu_usage_percentage?: number | null
          error_count?: number | null
          executed_at?: string | null
          execution_time_ms?: number | null
          function_name?: string
          id?: string
          memory_usage_mb?: number | null
          trainer_id?: string | null
        }
        Relationships: []
      }
      engagement_trends: {
        Row: {
          breakdown: Json | null
          date: string
          engagement_rate: number | null
          id: string
          meeting_count: number | null
          message_count: number | null
          nudge_count: number | null
          response_rate: number | null
          total_events: number | null
          trainer_id: string
        }
        Insert: {
          breakdown?: Json | null
          date: string
          engagement_rate?: number | null
          id?: string
          meeting_count?: number | null
          message_count?: number | null
          nudge_count?: number | null
          response_rate?: number | null
          total_events?: number | null
          trainer_id: string
        }
        Update: {
          breakdown?: Json | null
          date?: string
          engagement_rate?: number | null
          id?: string
          meeting_count?: number | null
          message_count?: number | null
          nudge_count?: number | null
          response_rate?: number | null
          total_events?: number | null
          trainer_id?: string
        }
        Relationships: []
      }
      error_events: {
        Row: {
          client_id: string | null
          error_message: string
          error_type: string
          id: string
          request_context: Json | null
          resolution_notes: string | null
          resolved: boolean | null
          resolved_at: string | null
          service_name: string
          severity: string
          stack_trace: string | null
          timestamp: string | null
          trainer_id: string | null
          user_context: Json | null
        }
        Insert: {
          client_id?: string | null
          error_message: string
          error_type: string
          id?: string
          request_context?: Json | null
          resolution_notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          service_name: string
          severity?: string
          stack_trace?: string | null
          timestamp?: string | null
          trainer_id?: string | null
          user_context?: Json | null
        }
        Update: {
          client_id?: string | null
          error_message?: string
          error_type?: string
          id?: string
          request_context?: Json | null
          resolution_notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          service_name?: string
          severity?: string
          stack_trace?: string | null
          timestamp?: string | null
          trainer_id?: string | null
          user_context?: Json | null
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
      frontend_performance_logs: {
        Row: {
          first_contentful_paint: number | null
          id: string
          largest_contentful_paint: number | null
          load_time_ms: number
          logged_at: string | null
          page_url: string
          session_id: string | null
          time_to_interactive: number | null
          user_agent: string | null
        }
        Insert: {
          first_contentful_paint?: number | null
          id?: string
          largest_contentful_paint?: number | null
          load_time_ms: number
          logged_at?: string | null
          page_url: string
          session_id?: string | null
          time_to_interactive?: number | null
          user_agent?: string | null
        }
        Update: {
          first_contentful_paint?: number | null
          id?: string
          largest_contentful_paint?: number | null
          load_time_ms?: number
          logged_at?: string | null
          page_url?: string
          session_id?: string | null
          time_to_interactive?: number | null
          user_agent?: string | null
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
      lifecycle_analytics: {
        Row: {
          client_id: string
          current_stage: string
          days_in_stage: number | null
          engagement_score: number | null
          id: string
          key_indicators: Json | null
          lifecycle_metrics: Json | null
          next_action_recommended: string | null
          predicted_churn_date: string | null
          risk_score: number | null
          stage_confidence: number | null
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          current_stage: string
          days_in_stage?: number | null
          engagement_score?: number | null
          id?: string
          key_indicators?: Json | null
          lifecycle_metrics?: Json | null
          next_action_recommended?: string | null
          predicted_churn_date?: string | null
          risk_score?: number | null
          stage_confidence?: number | null
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          current_stage?: string
          days_in_stage?: number | null
          engagement_score?: number | null
          id?: string
          key_indicators?: Json | null
          lifecycle_metrics?: Json | null
          next_action_recommended?: string | null
          predicted_churn_date?: string | null
          risk_score?: number | null
          stage_confidence?: number | null
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lifecycle_analytics_client_id_fkey"
            columns: ["client_id"]
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
      nudge_analytics: {
        Row: {
          average_response_time_hours: number | null
          clients_re_engaged: number | null
          created_at: string
          date: string
          id: string
          most_effective_template: string | null
          revenue_attributed: number | null
          total_campaigns_created: number | null
          total_campaigns_sent: number | null
          total_responses_received: number | null
          trainer_id: string
        }
        Insert: {
          average_response_time_hours?: number | null
          clients_re_engaged?: number | null
          created_at?: string
          date: string
          id?: string
          most_effective_template?: string | null
          revenue_attributed?: number | null
          total_campaigns_created?: number | null
          total_campaigns_sent?: number | null
          total_responses_received?: number | null
          trainer_id: string
        }
        Update: {
          average_response_time_hours?: number | null
          clients_re_engaged?: number | null
          created_at?: string
          date?: string
          id?: string
          most_effective_template?: string | null
          revenue_attributed?: number | null
          total_campaigns_created?: number | null
          total_campaigns_sent?: number | null
          total_responses_received?: number | null
          trainer_id?: string
        }
        Relationships: []
      }
      nudge_campaigns: {
        Row: {
          campaign_type: string
          contact_id: string
          content: string
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          priority_score: number
          response_received_at: string | null
          scheduled_for: string
          sent_at: string | null
          status: string | null
          template_id: string
          trainer_id: string
          urgency_level: number | null
        }
        Insert: {
          campaign_type: string
          contact_id: string
          content: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          priority_score: number
          response_received_at?: string | null
          scheduled_for: string
          sent_at?: string | null
          status?: string | null
          template_id: string
          trainer_id: string
          urgency_level?: number | null
        }
        Update: {
          campaign_type?: string
          contact_id?: string
          content?: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          priority_score?: number
          response_received_at?: string | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string | null
          template_id?: string
          trainer_id?: string
          urgency_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nudge_campaigns_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      nudge_settings: {
        Row: {
          auto_send_enabled: boolean | null
          created_at: string
          daily_limit: number | null
          enabled: boolean | null
          id: string
          min_hours_between_nudges: number | null
          min_risk_threshold: number | null
          preferred_channels: string[] | null
          quiet_hours_end: number | null
          quiet_hours_start: number | null
          trainer_id: string
          updated_at: string
        }
        Insert: {
          auto_send_enabled?: boolean | null
          created_at?: string
          daily_limit?: number | null
          enabled?: boolean | null
          id?: string
          min_hours_between_nudges?: number | null
          min_risk_threshold?: number | null
          preferred_channels?: string[] | null
          quiet_hours_end?: number | null
          quiet_hours_start?: number | null
          trainer_id: string
          updated_at?: string
        }
        Update: {
          auto_send_enabled?: boolean | null
          created_at?: string
          daily_limit?: number | null
          enabled?: boolean | null
          id?: string
          min_hours_between_nudges?: number | null
          min_risk_threshold?: number | null
          preferred_channels?: string[] | null
          quiet_hours_end?: number | null
          quiet_hours_start?: number | null
          trainer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      nudge_templates: {
        Row: {
          active: boolean | null
          content_template: string
          created_at: string
          id: string
          max_frequency_per_week: number | null
          name: string
          optimal_days: number[] | null
          optimal_hours: number[] | null
          personalization_fields: string[] | null
          template_id: string
          template_type: string
          trainer_id: string
          triggers: string[] | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          content_template: string
          created_at?: string
          id?: string
          max_frequency_per_week?: number | null
          name: string
          optimal_days?: number[] | null
          optimal_hours?: number[] | null
          personalization_fields?: string[] | null
          template_id: string
          template_type: string
          trainer_id: string
          triggers?: string[] | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          content_template?: string
          created_at?: string
          id?: string
          max_frequency_per_week?: number | null
          name?: string
          optimal_days?: number[] | null
          optimal_hours?: number[] | null
          personalization_fields?: string[] | null
          template_id?: string
          template_type?: string
          trainer_id?: string
          triggers?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      performance_alerts: {
        Row: {
          actual_value: number
          alert_type: string
          created_at: string | null
          id: string
          metric_name: string
          resolution_notes: string | null
          resolved: boolean | null
          resolved_at: string | null
          service_name: string | null
          severity: string
          threshold_value: number
        }
        Insert: {
          actual_value: number
          alert_type: string
          created_at?: string | null
          id?: string
          metric_name: string
          resolution_notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          service_name?: string | null
          severity: string
          threshold_value: number
        }
        Update: {
          actual_value?: number
          alert_type?: string
          created_at?: string | null
          id?: string
          metric_name?: string
          resolution_notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          service_name?: string | null
          severity?: string
          threshold_value?: number
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          client_id: string | null
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at: string | null
          service_name: string | null
          trainer_id: string | null
        }
        Insert: {
          client_id?: string | null
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at?: string | null
          service_name?: string | null
          trainer_id?: string | null
        }
        Update: {
          client_id?: string | null
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number
          recorded_at?: string | null
          service_name?: string | null
          trainer_id?: string | null
        }
        Relationships: []
      }
      predictive_insights: {
        Row: {
          actual_outcome: boolean | null
          client_id: string
          confidence_level: number
          created_at: string | null
          id: string
          model_version: string | null
          outcome_date: string | null
          prediction_factors: Json | null
          prediction_type: string
          prediction_value: number
          recommended_actions: Json | null
          timeframe_days: number
          trainer_id: string
        }
        Insert: {
          actual_outcome?: boolean | null
          client_id: string
          confidence_level: number
          created_at?: string | null
          id?: string
          model_version?: string | null
          outcome_date?: string | null
          prediction_factors?: Json | null
          prediction_type: string
          prediction_value: number
          recommended_actions?: Json | null
          timeframe_days: number
          trainer_id: string
        }
        Update: {
          actual_outcome?: boolean | null
          client_id?: string
          confidence_level?: number
          created_at?: string | null
          id?: string
          model_version?: string | null
          outcome_date?: string | null
          prediction_factors?: Json | null
          prediction_type?: string
          prediction_value?: number
          recommended_actions?: Json | null
          timeframe_days?: number
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictive_insights_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      query_performance_logs: {
        Row: {
          affected_rows: number | null
          executed_at: string | null
          execution_time_ms: number
          id: string
          query_text: string
          query_type: string | null
          table_name: string | null
          trainer_id: string | null
        }
        Insert: {
          affected_rows?: number | null
          executed_at?: string | null
          execution_time_ms: number
          id?: string
          query_text: string
          query_type?: string | null
          table_name?: string | null
          trainer_id?: string | null
        }
        Update: {
          affected_rows?: number | null
          executed_at?: string | null
          execution_time_ms?: number
          id?: string
          query_text?: string
          query_type?: string | null
          table_name?: string | null
          trainer_id?: string | null
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
      resource_utilization: {
        Row: {
          capacity_gb: number | null
          id: string
          recorded_at: string | null
          resource_type: string
          service_name: string | null
          used_gb: number | null
          utilization_percentage: number
        }
        Insert: {
          capacity_gb?: number | null
          id?: string
          recorded_at?: string | null
          resource_type: string
          service_name?: string | null
          used_gb?: number | null
          utilization_percentage: number
        }
        Update: {
          capacity_gb?: number | null
          id?: string
          recorded_at?: string | null
          resource_type?: string
          service_name?: string | null
          used_gb?: number | null
          utilization_percentage?: number
        }
        Relationships: []
      }
      system_health_metrics: {
        Row: {
          details: Json | null
          health_score: number | null
          id: string
          recorded_at: string | null
          response_time_ms: number | null
          service_name: string
          status: string
        }
        Insert: {
          details?: Json | null
          health_score?: number | null
          id?: string
          recorded_at?: string | null
          response_time_ms?: number | null
          service_name: string
          status: string
        }
        Update: {
          details?: Json | null
          health_score?: number | null
          id?: string
          recorded_at?: string | null
          response_time_ms?: number | null
          service_name?: string
          status?: string
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
      trainer_performance_metrics: {
        Row: {
          automation_efficiency: number | null
          client_satisfaction_score: number | null
          engagement_improvement: number | null
          id: string
          performance_period: string
          period_end: string
          period_start: string
          recorded_at: string | null
          response_time_avg: number | null
          retention_rate: number | null
          revenue_per_client: number | null
          trainer_id: string
          trend_direction: string | null
        }
        Insert: {
          automation_efficiency?: number | null
          client_satisfaction_score?: number | null
          engagement_improvement?: number | null
          id?: string
          performance_period: string
          period_end: string
          period_start: string
          recorded_at?: string | null
          response_time_avg?: number | null
          retention_rate?: number | null
          revenue_per_client?: number | null
          trainer_id: string
          trend_direction?: string | null
        }
        Update: {
          automation_efficiency?: number | null
          client_satisfaction_score?: number | null
          engagement_improvement?: number | null
          id?: string
          performance_period?: string
          period_end?: string
          period_start?: string
          recorded_at?: string | null
          response_time_avg?: number | null
          retention_rate?: number | null
          revenue_per_client?: number | null
          trainer_id?: string
          trend_direction?: string | null
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
      user_experience_metrics: {
        Row: {
          bounce_rate: number | null
          id: string
          load_time_ms: number
          page_name: string
          recorded_at: string | null
          session_id: string | null
          time_to_interactive: number | null
          trainer_id: string | null
          user_satisfaction: number | null
        }
        Insert: {
          bounce_rate?: number | null
          id?: string
          load_time_ms: number
          page_name: string
          recorded_at?: string | null
          session_id?: string | null
          time_to_interactive?: number | null
          trainer_id?: string | null
          user_satisfaction?: number | null
        }
        Update: {
          bounce_rate?: number | null
          id?: string
          load_time_ms?: number
          page_name?: string
          recorded_at?: string | null
          session_id?: string | null
          time_to_interactive?: number | null
          trainer_id?: string | null
          user_satisfaction?: number | null
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
