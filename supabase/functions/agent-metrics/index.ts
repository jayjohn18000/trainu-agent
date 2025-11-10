import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { jsonResponse, errorResponse, optionsResponse } from '../_shared/responses.ts'
import { ALLOWED_TABLES } from '../_shared/constants.ts'
import type { MetricDSL, DSLFilter } from '../_shared/types.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

// Build Supabase query from DSL
function buildQuery(
  supabase: SupabaseClient,
  dsl: MetricDSL,
  userId: string,
  dateFilter?: { start: string; end: string }
) {
  let query = supabase.from(dsl.table).select('*', { 
    count: 'exact', 
    head: dsl.metric === 'count' 
  });
  
  // Apply filters
  if (dsl.filters) {
    for (const f of dsl.filters) {
      const { field, op, value } = f;
      if (op === 'eq') query = query.eq(field, value);
      else if (op === 'neq') query = query.neq(field, value);
      else if (op === 'gt') query = query.gt(field, value);
      else if (op === 'gte') query = query.gte(field, value);
      else if (op === 'lt') query = query.lt(field, value);
      else if (op === 'lte') query = query.lte(field, value);
      else if (op === 'in') query = query.in(field, value);
      else if (op === 'like') query = query.like(field, value);
    }
  }

  // Trainer filter (always apply for non-trainer tables)
  if (dsl.table !== 'trainer_profiles') {
    query = query.eq('trainer_id', userId);
  }

  // Apply date filter for trend calculation
  if (dateFilter && dsl.table !== 'trainer_profiles') {
    query = query.gte('created_at', dateFilter.start).lt('created_at', dateFilter.end);
  }

  return query;
}

// Calculate metric value from query results
function calculateMetricValue(
  metric: string,
  data: any[] | null,
  count: number | null,
  dsl: MetricDSL
): number {
  if (metric === 'count') {
    return count ?? 0;
  } else if (metric === 'sum' && data && data.length > 0) {
    const sumField = dsl.sumField || 'amount_cents';
    return data.reduce((acc: number, row: any) => acc + (Number(row[sumField]) || 0), 0);
  } else if (metric === 'avg' && data && data.length > 0) {
    const avgField = dsl.avgField || 'amount_cents';
    const sum = data.reduce((acc: number, row: any) => acc + (Number(row[avgField]) || 0), 0);
    return sum / data.length;
  }
  return 0;
}

// Calculate trend by comparing with previous period
async function calculateTrend(
  supabase: SupabaseClient,
  dsl: MetricDSL,
  currentValue: number,
  userId: string
): Promise<number> {
  if (!dsl.period) return 0;
  
  const periodMap: Record<string, number> = { '7d': 7, '30d': 30 };
  const days = periodMap[dsl.period] || 0;
  if (days === 0) return 0;
  
  const prevEnd = new Date();
  prevEnd.setDate(prevEnd.getDate() - days);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - days);
  
  // Build previous period query with date filter
  const prevQuery = buildQuery(supabase, dsl, userId, {
    start: prevStart.toISOString(),
    end: prevEnd.toISOString(),
  });
  
  const { data: prevData, count: prevCount } = await prevQuery;
  const prevValue = calculateMetricValue(dsl.metric, prevData, prevCount, dsl);
  
  if (prevValue === 0) return currentValue > 0 ? 1.0 : 0;
  return (currentValue - prevValue) / prevValue;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return optionsResponse();
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = req.method === 'POST' ? await req.json() : {};
    const action = body?.action;

    if (action === 'runQuery' && req.method === 'POST') {
      const { dsl_json } = body;
      if (!dsl_json || typeof dsl_json !== 'object') {
        return errorResponse('dsl_json required', 400);
      }

      // Validate DSL structure
      const dslSchema = z.object({
        table: z.enum(['contacts', 'bookings', 'messages', 'activity_feed', 'trainer_profiles'] as any),
        metric: z.enum(['count', 'sum', 'avg']),
        title: z.string().max(100).optional(),
        period: z.enum(['7d', '30d', 'all']).optional(),
        sumField: z.string().max(50).optional(),
        avgField: z.string().max(50).optional(),
        filters: z.array(z.object({
          field: z.string().max(50),
          op: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'like']),
          value: z.union([z.string(), z.number(), z.array(z.string())])
        })).max(10).optional()
      });

      const validation = dslSchema.safeParse(dsl_json);
      if (!validation.success) {
        return errorResponse('Invalid DSL structure: ' + validation.error.message, 400);
      }

      const dsl = validation.data as MetricDSL;
      
      // Validate table name (prevent SQL injection)
      if (!ALLOWED_TABLES.includes(dsl.table)) {
        return errorResponse('Invalid table name', 400);
      }

      // Build and execute query for current period
      const query = buildQuery(supabase, dsl, user.id);
      const { data, count, error } = await query;
      if (error) throw error;

      // Calculate metric value
      const value = calculateMetricValue(dsl.metric, data, count, dsl);

      // Calculate trend (compares with previous period)
      const trend = await calculateTrend(supabase, dsl, value, user.id);

      const card = {
        title: dsl.title || `${dsl.metric}(${dsl.table})`,
        value,
        trend,
        period: dsl.period || 'all',
        query: dsl_json,
      };

      return jsonResponse({ card });
    }

    if (action === 'saveQuery' && req.method === 'POST') {
      const { name, dsl_json, starred } = body;
      
      if (!name || !dsl_json) {
        return errorResponse('name and dsl_json required', 400);
      }

      const { data, error } = await supabase
        .from('saved_queries')
        .insert({ trainer_id: user.id, name, dsl_json, starred: !!starred })
        .select()
        .single();
      if (error) throw error;
      return jsonResponse({ saved: data });
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message, 500);
  }
});
