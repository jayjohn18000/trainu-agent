// Shared TypeScript types for Edge Functions

export interface DSLFilter {
  field: string;
  op: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like' | 'contains';
  value: any;
}

export interface SegmentDSL {
  filters: DSLFilter[];
}

export interface MetricDSL {
  table: string;
  metric: 'count' | 'sum' | 'avg';
  filters?: DSLFilter[];
  period?: '7d' | '30d';
  title?: string;
  sumField?: string;
  avgField?: string;
}

export interface ClientData {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  opt_out?: boolean;
  ghl_contact_id?: string;
  risk?: number;
  status?: string;
  lastActivity?: string;
  tags?: string[];
}

export type IntegrationSource = 'ghl' | 'mindbody' | 'trainerize' | 'truecoach' | 'apple_health' | 'oura';

export interface IntegrationStatus {
  id: string;
  trainer_id: string;
  integration_name: IntegrationSource;
  connection_status: 'connected' | 'disconnected' | 'error' | 'syncing' | 'warning';
  last_sync_at?: string;
  next_sync_at?: string;
  last_error?: string;
  last_error_at?: string;
  error_count: number;
  records_synced: number;
  records_updated: number;
  sync_duration_ms?: number;
  api_calls_used?: number;
}

export interface IntegrationActivityLog {
  id: string;
  trainer_id: string;
  integration_name: IntegrationSource;
  activity_type: string;
  activity_message: string;
  activity_data?: Record<string, any>;
  created_at: string;
}

