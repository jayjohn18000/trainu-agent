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

