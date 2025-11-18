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
      agent_settings: {
        Row: {
          autonomy: string
          created_at: string | null
          emoji: string
          id: string
          length: string
          quiet_end: string
          quiet_start: string
          tone: string
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          autonomy?: string
          created_at?: string | null
          emoji?: string
          id?: string
          length?: string
          quiet_end?: string
          quiet_start?: string
          tone?: string
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          autonomy?: string
          created_at?: string | null
          emoji?: string
          id?: string
          length?: string
          quiet_end?: string
          quiet_start?: string
          tone?: string
          trainer_id?: string
          updated_at?: string | null
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
      ai_insights: {
        Row: {
          actionable_recommendations: Json | null
          confidence_score: number | null
          created_at: string
          data_source: Json | null
          description: string
          expires_at: string | null
          id: string
          insight_type: string
          organization_id: string
          priority: string | null
          status: string | null
          title: string
          trainer_id: string
        }
        Insert: {
          actionable_recommendations?: Json | null
          confidence_score?: number | null
          created_at?: string
          data_source?: Json | null
          description: string
          expires_at?: string | null
          id?: string
          insight_type: string
          organization_id: string
          priority?: string | null
          status?: string | null
          title: string
          trainer_id: string
        }
        Update: {
          actionable_recommendations?: Json | null
          confidence_score?: number | null
          created_at?: string
          data_source?: Json | null
          description?: string
          expires_at?: string | null
          id?: string
          insight_type?: string
          organization_id?: string
          priority?: string | null
          status?: string | null
          title?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      api_keys: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          organization_id: string
          permissions: Json | null
          rate_limit: number | null
          revoked_at: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          organization_id: string
          permissions?: Json | null
          rate_limit?: number | null
          revoked_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          organization_id?: string
          permissions?: Json | null
          rate_limit?: number | null
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          pii_fields: string[] | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          pii_fields?: string[] | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          pii_fields?: string[] | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
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
      automated_insights: {
        Row: {
          created_at: string
          data_points: Json
          dismissed: boolean | null
          id: string
          insight_category: string
          insight_text: string
          organization_id: string
          recommended_actions: Json | null
          significance_score: number | null
          trend_direction: string | null
        }
        Insert: {
          created_at?: string
          data_points: Json
          dismissed?: boolean | null
          id?: string
          insight_category: string
          insight_text: string
          organization_id: string
          recommended_actions?: Json | null
          significance_score?: number | null
          trend_direction?: string | null
        }
        Update: {
          created_at?: string
          data_points?: Json
          dismissed?: boolean | null
          id?: string
          insight_category?: string
          insight_text?: string
          organization_id?: string
          recommended_actions?: Json | null
          significance_score?: number | null
          trend_direction?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automated_insights_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          contact_id: string
          created_at: string | null
          ghl_appointment_id: string | null
          id: string
          last_synced_to_ghl_at: string | null
          notes: string | null
          scheduled_at: string
          session_type: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          sync_source: string | null
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          ghl_appointment_id?: string | null
          id?: string
          last_synced_to_ghl_at?: string | null
          notes?: string | null
          scheduled_at: string
          session_type?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          sync_source?: string | null
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          ghl_appointment_id?: string | null
          id?: string
          last_synced_to_ghl_at?: string | null
          notes?: string | null
          scheduled_at?: string
          session_type?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          sync_source?: string | null
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
      business_metrics: {
        Row: {
          calculation_query: string
          change_percentage: number | null
          created_at: string
          current_value: number | null
          display_format: string | null
          id: string
          last_calculated_at: string | null
          metric_name: string
          metric_type: string
          organization_id: string
          previous_value: number | null
          target_value: number | null
          time_period: string | null
          updated_at: string
        }
        Insert: {
          calculation_query: string
          change_percentage?: number | null
          created_at?: string
          current_value?: number | null
          display_format?: string | null
          id?: string
          last_calculated_at?: string | null
          metric_name: string
          metric_type: string
          organization_id: string
          previous_value?: number | null
          target_value?: number | null
          time_period?: string | null
          updated_at?: string
        }
        Update: {
          calculation_query?: string
          change_percentage?: number | null
          created_at?: string
          current_value?: number | null
          display_format?: string | null
          id?: string
          last_calculated_at?: string | null
          metric_name?: string
          metric_type?: string
          organization_id?: string
          previous_value?: number | null
          target_value?: number | null
          time_period?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_fraud_checks: {
        Row: {
          check_type: string
          flagged_at: string | null
          id: string
          notes: string | null
          rating_id: string | null
          resolved: boolean | null
        }
        Insert: {
          check_type: string
          flagged_at?: string | null
          id?: string
          notes?: string | null
          rating_id?: string | null
          resolved?: boolean | null
        }
        Update: {
          check_type?: string
          flagged_at?: string | null
          id?: string
          notes?: string | null
          rating_id?: string | null
          resolved?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_fraud_checks_rating_id_fkey"
            columns: ["rating_id"]
            isOneToOne: false
            referencedRelation: "challenge_ratings"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          ip_address: string
          request_count: number | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address: string
          request_count?: number | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: string
          request_count?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      challenge_ratings: {
        Row: {
          code_expires_at: string | null
          created_at: string | null
          device_fingerprint: string | null
          id: string
          ip_address: string | null
          proof_file_url: string | null
          rater_email: string
          rater_name: string
          rater_phone: string | null
          rating_communication: number
          rating_expertise: number
          rating_motivation: number
          rating_overall: number | null
          rating_results: number
          rating_value: number
          review_text: string | null
          trainer_city: string | null
          trainer_gym: string | null
          trainer_id: string | null
          trainer_name: string
          trainer_slug: string | null
          trainer_state: string | null
          updated_at: string | null
          verification_code: string
          verification_completed_at: string | null
          verification_method: string
          verification_status: string
        }
        Insert: {
          code_expires_at?: string | null
          created_at?: string | null
          device_fingerprint?: string | null
          id?: string
          ip_address?: string | null
          proof_file_url?: string | null
          rater_email: string
          rater_name: string
          rater_phone?: string | null
          rating_communication: number
          rating_expertise: number
          rating_motivation: number
          rating_overall?: number | null
          rating_results: number
          rating_value: number
          review_text?: string | null
          trainer_city?: string | null
          trainer_gym?: string | null
          trainer_id?: string | null
          trainer_name: string
          trainer_slug?: string | null
          trainer_state?: string | null
          updated_at?: string | null
          verification_code: string
          verification_completed_at?: string | null
          verification_method: string
          verification_status?: string
        }
        Update: {
          code_expires_at?: string | null
          created_at?: string | null
          device_fingerprint?: string | null
          id?: string
          ip_address?: string | null
          proof_file_url?: string | null
          rater_email?: string
          rater_name?: string
          rater_phone?: string | null
          rating_communication?: number
          rating_expertise?: number
          rating_motivation?: number
          rating_overall?: number | null
          rating_results?: number
          rating_value?: number
          review_text?: string | null
          trainer_city?: string | null
          trainer_gym?: string | null
          trainer_id?: string | null
          trainer_name?: string
          trainer_slug?: string | null
          trainer_state?: string | null
          updated_at?: string | null
          verification_code?: string
          verification_completed_at?: string | null
          verification_method?: string
          verification_status?: string
        }
        Relationships: []
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
          last_synced_to_ghl_at: string | null
          messages_sent_this_week: number | null
          messages_sent_today: number | null
          phone: string | null
          program_id: string | null
          sync_source: string | null
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
          last_synced_to_ghl_at?: string | null
          messages_sent_this_week?: number | null
          messages_sent_today?: number | null
          phone?: string | null
          program_id?: string | null
          sync_source?: string | null
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
          last_synced_to_ghl_at?: string | null
          messages_sent_this_week?: number | null
          messages_sent_today?: number | null
          phone?: string | null
          program_id?: string | null
          sync_source?: string | null
          tags?: string[] | null
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_ai: {
        Row: {
          contact_id: string
          context: Json | null
          conversation_state: string | null
          current_intent: string | null
          ended_at: string | null
          id: string
          last_message_at: string
          message_history: Json | null
          organization_id: string
          session_id: string
          started_at: string
          trainer_id: string
        }
        Insert: {
          contact_id: string
          context?: Json | null
          conversation_state?: string | null
          current_intent?: string | null
          ended_at?: string | null
          id?: string
          last_message_at?: string
          message_history?: Json | null
          organization_id: string
          session_id: string
          started_at?: string
          trainer_id: string
        }
        Update: {
          contact_id?: string
          context?: Json | null
          conversation_state?: string | null
          current_intent?: string | null
          ended_at?: string | null
          id?: string
          last_message_at?: string
          message_history?: Json | null
          organization_id?: string
          session_id?: string
          started_at?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_ai_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      custom_dashboards: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          filters: Json | null
          id: string
          is_default: boolean | null
          layout_config: Json
          name: string
          organization_id: string
          refresh_interval: number | null
          updated_at: string
          widgets: Json
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          filters?: Json | null
          id?: string
          is_default?: boolean | null
          layout_config: Json
          name: string
          organization_id: string
          refresh_interval?: number | null
          updated_at?: string
          widgets: Json
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          filters?: Json | null
          id?: string
          is_default?: boolean | null
          layout_config?: Json
          name?: string
          organization_id?: string
          refresh_interval?: number | null
          updated_at?: string
          widgets?: Json
        }
        Relationships: [
          {
            foreignKeyName: "custom_dashboards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      data_backups: {
        Row: {
          backup_status: string | null
          backup_type: string
          completed_at: string | null
          encryption_enabled: boolean | null
          error_message: string | null
          expires_at: string | null
          file_size_gb: number | null
          id: string
          retention_days: number | null
          started_at: string
          storage_location: string
          verification_status: string | null
        }
        Insert: {
          backup_status?: string | null
          backup_type: string
          completed_at?: string | null
          encryption_enabled?: boolean | null
          error_message?: string | null
          expires_at?: string | null
          file_size_gb?: number | null
          id?: string
          retention_days?: number | null
          started_at?: string
          storage_location: string
          verification_status?: string | null
        }
        Update: {
          backup_status?: string | null
          backup_type?: string
          completed_at?: string | null
          encryption_enabled?: boolean | null
          error_message?: string | null
          expires_at?: string | null
          file_size_gb?: number | null
          id?: string
          retention_days?: number | null
          started_at?: string
          storage_location?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      data_exports: {
        Row: {
          completed_at: string | null
          download_count: number | null
          expires_at: string | null
          export_type: string
          file_path: string | null
          file_size_kb: number | null
          filters: Json | null
          format: string
          id: string
          organization_id: string
          requested_at: string
          requested_by: string
          row_count: number | null
          status: string | null
          table_name: string
        }
        Insert: {
          completed_at?: string | null
          download_count?: number | null
          expires_at?: string | null
          export_type: string
          file_path?: string | null
          file_size_kb?: number | null
          filters?: Json | null
          format: string
          id?: string
          organization_id: string
          requested_at?: string
          requested_by: string
          row_count?: number | null
          status?: string | null
          table_name: string
        }
        Update: {
          completed_at?: string | null
          download_count?: number | null
          expires_at?: string | null
          export_type?: string
          file_path?: string | null
          file_size_kb?: number | null
          filters?: Json | null
          format?: string
          id?: string
          organization_id?: string
          requested_at?: string
          requested_by?: string
          row_count?: number | null
          status?: string | null
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_exports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      dfy_requests: {
        Row: {
          additional_notes: string | null
          business_name: string
          created_at: string | null
          current_ghl_account: string | null
          email: string | null
          id: string
          phone: string | null
          status: string | null
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          additional_notes?: string | null
          business_name: string
          created_at?: string | null
          current_ghl_account?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          status?: string | null
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          additional_notes?: string | null
          business_name?: string
          created_at?: string | null
          current_ghl_account?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          status?: string | null
          trainer_id?: string
          updated_at?: string | null
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
      generated_reports: {
        Row: {
          expires_at: string | null
          file_path: string | null
          file_size_kb: number | null
          generated_at: string
          generated_by: string | null
          id: string
          organization_id: string
          period_end: string | null
          period_start: string | null
          report_data: Json
          report_name: string
          template_id: string | null
        }
        Insert: {
          expires_at?: string | null
          file_path?: string | null
          file_size_kb?: number | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          organization_id: string
          period_end?: string | null
          period_start?: string | null
          report_data: Json
          report_name: string
          template_id?: string | null
        }
        Update: {
          expires_at?: string | null
          file_path?: string | null
          file_size_kb?: number | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          organization_id?: string
          period_end?: string | null
          period_start?: string | null
          report_data?: Json
          report_name?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      ghl_config: {
        Row: {
          access_token: string | null
          admin_notes: string | null
          appointments_synced: number | null
          avg_sync_duration_ms: number | null
          booking_widget_id: string | null
          company_id: string | null
          conflict_count: number | null
          contact_field_mapping: Json | null
          contacts_synced: number | null
          conversations_synced: number | null
          created_at: string | null
          default_channel: string | null
          email_enabled: boolean | null
          frequency_cap_daily: number | null
          frequency_cap_weekly: number | null
          id: string
          last_sync_at: string | null
          last_sync_error: string | null
          last_sync_status: string | null
          location_id: string | null
          primary_user_id: string | null
          provisioned_at: string | null
          provisioned_by: string | null
          provisioning_status: string | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          refresh_token: string | null
          setup_type: string | null
          sms_enabled: boolean | null
          sync_throughput_per_min: number | null
          templates: Json | null
          token_expires_at: string | null
          total_sync_count: number | null
          trainer_id: string
          updated_at: string | null
          webhook_registered: boolean | null
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          access_token?: string | null
          admin_notes?: string | null
          appointments_synced?: number | null
          avg_sync_duration_ms?: number | null
          booking_widget_id?: string | null
          company_id?: string | null
          conflict_count?: number | null
          contact_field_mapping?: Json | null
          contacts_synced?: number | null
          conversations_synced?: number | null
          created_at?: string | null
          default_channel?: string | null
          email_enabled?: boolean | null
          frequency_cap_daily?: number | null
          frequency_cap_weekly?: number | null
          id?: string
          last_sync_at?: string | null
          last_sync_error?: string | null
          last_sync_status?: string | null
          location_id?: string | null
          primary_user_id?: string | null
          provisioned_at?: string | null
          provisioned_by?: string | null
          provisioning_status?: string | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          refresh_token?: string | null
          setup_type?: string | null
          sms_enabled?: boolean | null
          sync_throughput_per_min?: number | null
          templates?: Json | null
          token_expires_at?: string | null
          total_sync_count?: number | null
          trainer_id: string
          updated_at?: string | null
          webhook_registered?: boolean | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          access_token?: string | null
          admin_notes?: string | null
          appointments_synced?: number | null
          avg_sync_duration_ms?: number | null
          booking_widget_id?: string | null
          company_id?: string | null
          conflict_count?: number | null
          contact_field_mapping?: Json | null
          contacts_synced?: number | null
          conversations_synced?: number | null
          created_at?: string | null
          default_channel?: string | null
          email_enabled?: boolean | null
          frequency_cap_daily?: number | null
          frequency_cap_weekly?: number | null
          id?: string
          last_sync_at?: string | null
          last_sync_error?: string | null
          last_sync_status?: string | null
          location_id?: string | null
          primary_user_id?: string | null
          provisioned_at?: string | null
          provisioned_by?: string | null
          provisioning_status?: string | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          refresh_token?: string | null
          setup_type?: string | null
          sms_enabled?: boolean | null
          sync_throughput_per_min?: number | null
          templates?: Json | null
          token_expires_at?: string | null
          total_sync_count?: number | null
          trainer_id?: string
          updated_at?: string | null
          webhook_registered?: boolean | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      ghl_sync_conflicts: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          ghl_data: Json
          ghl_updated_at: string
          id: string
          resolution_strategy: string | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          trainer_id: string
          trainu_data: Json
          trainu_updated_at: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          ghl_data: Json
          ghl_updated_at: string
          id?: string
          resolution_strategy?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          trainer_id: string
          trainu_data: Json
          trainu_updated_at: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          ghl_data?: Json
          ghl_updated_at?: string
          id?: string
          resolution_strategy?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          trainer_id?: string
          trainu_data?: Json
          trainu_updated_at?: string
        }
        Relationships: []
      }
      ghl_sync_metrics: {
        Row: {
          completed_at: string | null
          duration_ms: number | null
          error_details: Json | null
          id: string
          records_failed: number | null
          records_processed: number | null
          records_succeeded: number | null
          started_at: string
          sync_type: string
          throughput_per_min: number | null
          trainer_id: string
        }
        Insert: {
          completed_at?: string | null
          duration_ms?: number | null
          error_details?: Json | null
          id?: string
          records_failed?: number | null
          records_processed?: number | null
          records_succeeded?: number | null
          started_at: string
          sync_type: string
          throughput_per_min?: number | null
          trainer_id: string
        }
        Update: {
          completed_at?: string | null
          duration_ms?: number | null
          error_details?: Json | null
          id?: string
          records_failed?: number | null
          records_processed?: number | null
          records_succeeded?: number | null
          started_at?: string
          sync_type?: string
          throughput_per_min?: number | null
          trainer_id?: string
        }
        Relationships: []
      }
      ghl_sync_queue: {
        Row: {
          attempts: number | null
          created_at: string | null
          entity_id: string
          entity_type: string
          error_message: string | null
          id: string
          operation: string
          payload: Json
          processed_at: string | null
          status: string
          trainer_id: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          error_message?: string | null
          id?: string
          operation: string
          payload: Json
          processed_at?: string | null
          status?: string
          trainer_id: string
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          error_message?: string | null
          id?: string
          operation?: string
          payload?: Json
          processed_at?: string | null
          status?: string
          trainer_id?: string
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
      integration_events: {
        Row: {
          created_at: string
          event_data: Json
          event_name: string
          id: string
          integration_id: string
          severity: string | null
        }
        Insert: {
          created_at?: string
          event_data: Json
          event_name: string
          id?: string
          integration_id: string
          severity?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json
          event_name?: string
          id?: string
          integration_id?: string
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_events_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_messages: {
        Row: {
          content: string
          created_at: string
          delivered_at: string | null
          direction: string
          external_id: string | null
          from_address: string
          id: string
          integration_id: string
          metadata: Json | null
          organization_id: string
          platform: string
          read_at: string | null
          sent_at: string | null
          status: string | null
          to_address: string
        }
        Insert: {
          content: string
          created_at?: string
          delivered_at?: string | null
          direction: string
          external_id?: string | null
          from_address: string
          id?: string
          integration_id: string
          metadata?: Json | null
          organization_id: string
          platform: string
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          to_address: string
        }
        Update: {
          content?: string
          created_at?: string
          delivered_at?: string | null
          direction?: string
          external_id?: string | null
          from_address?: string
          id?: string
          integration_id?: string
          metadata?: Json | null
          organization_id?: string
          platform?: string
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          to_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_messages_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          credentials: Json
          display_name: string
          error_count: number | null
          id: string
          installed_at: string
          installed_by: string
          integration_type: string
          last_error: string | null
          last_sync_at: string | null
          organization_id: string
          provider: string
          settings: Json | null
          status: string | null
          sync_frequency: string | null
          updated_at: string
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          credentials: Json
          display_name: string
          error_count?: number | null
          id?: string
          installed_at?: string
          installed_by: string
          integration_type: string
          last_error?: string | null
          last_sync_at?: string | null
          organization_id: string
          provider: string
          settings?: Json | null
          status?: string | null
          sync_frequency?: string | null
          updated_at?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          credentials?: Json
          display_name?: string
          error_count?: number | null
          id?: string
          installed_at?: string
          installed_by?: string
          integration_type?: string
          last_error?: string | null
          last_sync_at?: string | null
          organization_id?: string
          provider?: string
          settings?: Json | null
          status?: string | null
          sync_frequency?: string | null
          updated_at?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          channel: string
          content: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          template_id: string | null
          tone: string | null
          trainer_id: string | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          channel?: string
          content: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          template_id?: string | null
          tone?: string | null
          trainer_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          channel?: string
          content?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          template_id?: string | null
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
      nlp_analyses: {
        Row: {
          analysis_type: string
          confidence_score: number | null
          contact_id: string | null
          created_at: string
          detected_intent: string | null
          entities: Json | null
          id: string
          input_text: string
          keywords: Json | null
          language: string | null
          organization_id: string
          processing_time_ms: number | null
          sentiment_label: string | null
          sentiment_score: number | null
          trainer_id: string
        }
        Insert: {
          analysis_type: string
          confidence_score?: number | null
          contact_id?: string | null
          created_at?: string
          detected_intent?: string | null
          entities?: Json | null
          id?: string
          input_text: string
          keywords?: Json | null
          language?: string | null
          organization_id: string
          processing_time_ms?: number | null
          sentiment_label?: string | null
          sentiment_score?: number | null
          trainer_id: string
        }
        Update: {
          analysis_type?: string
          confidence_score?: number | null
          contact_id?: string | null
          created_at?: string
          detected_intent?: string | null
          entities?: Json | null
          id?: string
          input_text?: string
          keywords?: Json | null
          language?: string | null
          organization_id?: string
          processing_time_ms?: number | null
          sentiment_label?: string | null
          sentiment_score?: number | null
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nlp_analyses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      organization_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role_id: string | null
          status: string | null
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by: string
          organization_id: string
          role_id?: string | null
          status?: string | null
          token: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role_id?: string | null
          status?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_users: {
        Row: {
          id: string
          joined_at: string
          last_active_at: string | null
          organization_id: string
          role_id: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          last_active_at?: string | null
          organization_id: string
          role_id?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          last_active_at?: string | null
          organization_id?: string
          role_id?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_email: string | null
          branding: Json | null
          created_at: string
          custom_domain: string | null
          id: string
          max_clients: number | null
          max_trainers: number | null
          name: string
          plan_tier: string
          settings: Json | null
          slug: string
          subscription_status: string | null
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          billing_email?: string | null
          branding?: Json | null
          created_at?: string
          custom_domain?: string | null
          id?: string
          max_clients?: number | null
          max_trainers?: number | null
          name: string
          plan_tier?: string
          settings?: Json | null
          slug: string
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          billing_email?: string | null
          branding?: Json | null
          created_at?: string
          custom_domain?: string | null
          id?: string
          max_clients?: number | null
          max_trainers?: number | null
          name?: string
          plan_tier?: string
          settings?: Json | null
          slug?: string
          subscription_status?: string | null
          trial_ends_at?: string | null
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
      programs: {
        Row: {
          created_at: string | null
          description: string | null
          duration_weeks: number | null
          id: string
          is_active: boolean | null
          name: string
          total_sessions: number | null
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_weeks?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          total_sessions?: number | null
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_weeks?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          total_sessions?: number | null
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: []
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
      report_templates: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          format: string | null
          id: string
          is_active: boolean | null
          metrics_included: Json | null
          name: string
          organization_id: string
          recipients: Json | null
          report_type: string
          schedule: string | null
          template_config: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          format?: string | null
          id?: string
          is_active?: boolean | null
          metrics_included?: Json | null
          name: string
          organization_id: string
          recipients?: Json | null
          report_type: string
          schedule?: string | null
          template_config: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          format?: string | null
          id?: string
          is_active?: boolean | null
          metrics_included?: Json | null
          name?: string
          organization_id?: string
          recipients?: Json | null
          report_type?: string
          schedule?: string | null
          template_config?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_system_role: boolean | null
          name: string
          organization_id: string
          permissions: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_system_role?: boolean | null
          name: string
          organization_id: string
          permissions?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_system_role?: boolean | null
          name?: string
          organization_id?: string
          permissions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audits: {
        Row: {
          affected_component: string | null
          assigned_to: string | null
          audit_type: string
          finding_description: string
          finding_title: string
          found_at: string
          id: string
          remediation_steps: string | null
          resolved_at: string | null
          severity: string
          status: string | null
        }
        Insert: {
          affected_component?: string | null
          assigned_to?: string | null
          audit_type: string
          finding_description: string
          finding_title: string
          found_at?: string
          id?: string
          remediation_steps?: string | null
          resolved_at?: string | null
          severity: string
          status?: string | null
        }
        Update: {
          affected_component?: string | null
          assigned_to?: string | null
          audit_type?: string
          finding_description?: string
          finding_title?: string
          found_at?: string
          id?: string
          remediation_steps?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string | null
        }
        Relationships: []
      }
      smart_content: {
        Row: {
          content_type: string
          created_at: string
          edited_content: string | null
          generated_content: string
          id: string
          organization_id: string
          personalization_data: Json | null
          prompt: string
          quality_score: number | null
          tone: string | null
          trainer_id: string
          used: boolean | null
        }
        Insert: {
          content_type: string
          created_at?: string
          edited_content?: string | null
          generated_content: string
          id?: string
          organization_id: string
          personalization_data?: Json | null
          prompt: string
          quality_score?: number | null
          tone?: string | null
          trainer_id: string
          used?: boolean | null
        }
        Update: {
          content_type?: string
          created_at?: string
          edited_content?: string | null
          generated_content?: string
          id?: string
          organization_id?: string
          personalization_data?: Json | null
          prompt?: string
          quality_score?: number | null
          tone?: string | null
          trainer_id?: string
          used?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "smart_content_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_usage: {
        Row: {
          ai_requests: number | null
          api_calls: number | null
          id: string
          messages_sent: number | null
          organization_id: string
          overage_charges: number | null
          period_end: string
          period_start: string
          recorded_at: string
          storage_gb: number | null
        }
        Insert: {
          ai_requests?: number | null
          api_calls?: number | null
          id?: string
          messages_sent?: number | null
          organization_id: string
          overage_charges?: number | null
          period_end: string
          period_start: string
          recorded_at?: string
          storage_gb?: number | null
        }
        Update: {
          ai_requests?: number | null
          api_calls?: number | null
          id?: string
          messages_sent?: number | null
          organization_id?: string
          overage_charges?: number | null
          period_end?: string
          period_start?: string
          recorded_at?: string
          storage_gb?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          direction: string
          error_details: Json | null
          id: string
          integration_id: string
          records_failed: number | null
          records_processed: number | null
          started_at: string | null
          status: string | null
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          direction: string
          error_details?: Json | null
          id?: string
          integration_id: string
          records_failed?: number | null
          records_processed?: number | null
          started_at?: string | null
          status?: string | null
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          direction?: string
          error_details?: Json | null
          id?: string
          integration_id?: string
          records_failed?: number | null
          records_processed?: number | null
          started_at?: string | null
          status?: string | null
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_jobs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
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
      test_suites: {
        Row: {
          created_at: string
          failed_tests: number | null
          id: string
          last_run_at: string | null
          last_run_duration_ms: number | null
          last_run_status: string | null
          name: string
          pass_rate: number | null
          passed_tests: number | null
          test_config: Json
          test_type: string
          total_tests: number | null
        }
        Insert: {
          created_at?: string
          failed_tests?: number | null
          id?: string
          last_run_at?: string | null
          last_run_duration_ms?: number | null
          last_run_status?: string | null
          name: string
          pass_rate?: number | null
          passed_tests?: number | null
          test_config: Json
          test_type: string
          total_tests?: number | null
        }
        Update: {
          created_at?: string
          failed_tests?: number | null
          id?: string
          last_run_at?: string | null
          last_run_duration_ms?: number | null
          last_run_status?: string | null
          name?: string
          pass_rate?: number | null
          passed_tests?: number | null
          test_config?: Json
          test_type?: string
          total_tests?: number | null
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
          bio: string | null
          created_at: string | null
          current_streak: number | null
          email: string | null
          first_name: string | null
          id: string
          last_active_date: string | null
          last_name: string | null
          level: number | null
          location: string | null
          longest_streak: number | null
          notification_email: boolean | null
          notification_marketing: boolean | null
          notification_progress_updates: boolean | null
          notification_session_reminders: boolean | null
          plan_tier: string | null
          total_clients_nudged: number | null
          total_messages_approved: number | null
          total_messages_edited: number | null
          updated_at: string | null
          xp: number | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          current_streak?: number | null
          email?: string | null
          first_name?: string | null
          id: string
          last_active_date?: string | null
          last_name?: string | null
          level?: number | null
          location?: string | null
          longest_streak?: number | null
          notification_email?: boolean | null
          notification_marketing?: boolean | null
          notification_progress_updates?: boolean | null
          notification_session_reminders?: boolean | null
          plan_tier?: string | null
          total_clients_nudged?: number | null
          total_messages_approved?: number | null
          total_messages_edited?: number | null
          updated_at?: string | null
          xp?: number | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          current_streak?: number | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_active_date?: string | null
          last_name?: string | null
          level?: number | null
          location?: string | null
          longest_streak?: number | null
          notification_email?: boolean | null
          notification_marketing?: boolean | null
          notification_progress_updates?: boolean | null
          notification_session_reminders?: boolean | null
          plan_tier?: string | null
          total_clients_nudged?: number | null
          total_messages_approved?: number | null
          total_messages_edited?: number | null
          updated_at?: string | null
          xp?: number | null
        }
        Relationships: []
      }
      trainer_verification_requests: {
        Row: {
          challenge_trainer_key: string
          claimed_by_email: string
          created_at: string
          device_fingerprint: string | null
          id: string
          ip_address: string | null
          proof_description: string | null
          proof_media_urls: string[] | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["verification_status"]
          trainer_city: string | null
          trainer_id: string | null
          trainer_name: string
          trainer_state: string | null
          updated_at: string
          verification_method: Database["public"]["Enums"]["verification_method"]
        }
        Insert: {
          challenge_trainer_key: string
          claimed_by_email: string
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: string | null
          proof_description?: string | null
          proof_media_urls?: string[] | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          trainer_city?: string | null
          trainer_id?: string | null
          trainer_name: string
          trainer_state?: string | null
          updated_at?: string
          verification_method: Database["public"]["Enums"]["verification_method"]
        }
        Update: {
          challenge_trainer_key?: string
          claimed_by_email?: string
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: string | null
          proof_description?: string | null
          proof_media_urls?: string[] | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          trainer_city?: string | null
          trainer_id?: string | null
          trainer_name?: string
          trainer_state?: string | null
          updated_at?: string
          verification_method?: Database["public"]["Enums"]["verification_method"]
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
      user_profiles: {
        Row: {
          created_at: string | null
          id: string
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          error_message: string | null
          event_type: string
          headers: Json | null
          id: string
          integration_id: string
          payload: Json
          processed: boolean | null
          processed_at: string | null
          received_at: string
          retry_count: number | null
        }
        Insert: {
          error_message?: string | null
          event_type: string
          headers?: Json | null
          id?: string
          integration_id: string
          payload: Json
          processed?: boolean | null
          processed_at?: string | null
          received_at?: string
          retry_count?: number | null
        }
        Update: {
          error_message?: string | null
          event_type?: string
          headers?: Json | null
          id?: string
          integration_id?: string
          payload?: Json
          processed?: boolean | null
          processed_at?: string | null
          received_at?: string
          retry_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
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
      challenge_leaderboard: {
        Row: {
          average_rating: number | null
          last_updated: string | null
          rank: number | null
          total_ratings: number | null
          trainer_city: string | null
          trainer_gym: string | null
          trainer_id: string | null
          trainer_key: string | null
          trainer_name: string | null
          trainer_state: string | null
        }
        Relationships: []
      }
      ghl_sync_health: {
        Row: {
          appointments_synced: number | null
          contacts_synced: number | null
          conversations_synced: number | null
          health_status: string | null
          last_sync_at: string | null
          last_sync_error: string | null
          last_sync_status: string | null
          location_id: string | null
          total_sync_count: number | null
          trainer_id: string | null
        }
        Insert: {
          appointments_synced?: number | null
          contacts_synced?: number | null
          conversations_synced?: number | null
          health_status?: never
          last_sync_at?: string | null
          last_sync_error?: string | null
          last_sync_status?: string | null
          location_id?: string | null
          total_sync_count?: number | null
          trainer_id?: string | null
        }
        Update: {
          appointments_synced?: number | null
          contacts_synced?: number | null
          conversations_synced?: number | null
          health_status?: never
          last_sync_at?: string | null
          last_sync_error?: string | null
          last_sync_status?: string | null
          location_id?: string | null
          total_sync_count?: number | null
          trainer_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_duplicate_claim: {
        Args: { p_email: string; p_trainer_key: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_message_counters: {
        Args: { contact_id: string }
        Returns: undefined
      }
      increment_trainer_stat: {
        Args: { stat_name: string; trainer_id: string }
        Returns: undefined
      }
      log_pii_access: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_pii_fields: string[]
          p_record_id: string
          p_table_name: string
        }
        Returns: string
      }
      refresh_challenge_leaderboard: { Args: never; Returns: undefined }
      user_in_organization: {
        Args: { _organization_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "client" | "trainer" | "gym_admin" | "admin"
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
      verification_method: "email" | "ghl_oauth" | "social_proof"
      verification_status: "pending" | "approved" | "rejected"
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
      app_role: ["client", "trainer", "gym_admin", "admin"],
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
      verification_method: ["email", "ghl_oauth", "social_proof"],
      verification_status: ["pending", "approved", "rejected"],
    },
  },
} as const
