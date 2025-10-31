import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { jsonResponse, errorResponse, optionsResponse } from '../_shared/responses.ts'
import type { DSLFilter, SegmentDSL, ClientData } from '../_shared/types.ts'

// Helper to evaluate a single filter against a client value
function evaluateFilter(filter: DSLFilter, clientVal: any): boolean {
  const { op, value } = filter;
  
  switch (op) {
    case 'eq':
      return clientVal === value;
    case 'neq':
      return clientVal !== value;
    case 'gt':
      return Number(clientVal) > Number(value);
    case 'gte':
      return Number(clientVal) >= Number(value);
    case 'lt':
      return Number(clientVal) < Number(value);
    case 'lte':
      return Number(clientVal) <= Number(value);
    case 'in':
      return Array.isArray(value) && value.includes(clientVal);
    case 'contains':
      return Array.isArray(clientVal) && clientVal.includes(value);
    default:
      return false;
  }
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

    if (action === 'upsertRule' && req.method === 'POST') {
      const { segmentId, name, dsl_json, schedule } = body;
      
      // Validate DSL structure
      if (!dsl_json || typeof dsl_json !== 'object') {
        return errorResponse('dsl_json required and must be object', 400);
      }
      if (!dsl_json.filters || !Array.isArray(dsl_json.filters)) {
        return errorResponse('dsl_json.filters array required', 400);
      }

      if (segmentId) {
        const { data, error } = await supabase
          .from('segment_rules')
          .insert({ trainer_id: user.id, segment_id: segmentId, name, dsl_json, schedule })
          .select()
          .single();
        if (error) throw error;
        return jsonResponse({ rule: data });
      } else {
        const { data: segment, error: segErr } = await supabase
          .from('segments')
          .insert({ trainer_id: user.id, name })
          .select()
          .single();
        if (segErr) throw segErr;
        const { data: rule, error: ruleErr } = await supabase
          .from('segment_rules')
          .insert({ trainer_id: user.id, segment_id: segment.id, name, dsl_json, schedule })
          .select()
          .single();
        if (ruleErr) throw ruleErr;
        return jsonResponse({ segment, rule });
      }
    }

    if (action === 'runRuleNow' && req.method === 'POST') {
      const { segmentId } = body;
      if (!segmentId) {
        return errorResponse('segmentId required', 400);
      }

      // Fetch segment rules
      const { data: rules, error: rulesError } = await supabase
        .from('segment_rules')
        .select('*')
        .eq('segment_id', segmentId)
        .eq('trainer_id', user.id);

      if (rulesError || !rules || rules.length === 0) {
        return errorResponse('Segment or rules not found', 404);
      }

      // Fetch all clients for trainer
      const { data: allClients, error: clientsError } = await supabase
        .from('clients')
        .select('id, risk, status, lastActivity, tags, opt_out')
        .eq('trainer_id', user.id);

      if (clientsError) throw clientsError;

      // Evaluate each rule's DSL against clients
      const affectedIds: string[] = [];
      for (const rule of rules) {
        const dsl = rule.dsl_json as SegmentDSL;
        if (!dsl?.filters) continue;

        for (const client of (allClients || [])) {
          let matches = true;
          for (const filter of dsl.filters) {
            const clientVal = (client as any)[filter.field];
            
            // Fixed logic bug: proper parentheses for operator precedence
            if (!evaluateFilter(filter, clientVal)) {
              matches = false;
              break;
            }
          }

          if (matches && !client.opt_out) {
            affectedIds.push(client.id);
          }
        }
      }

      // Update segment last_run
      await supabase
        .from('segments')
        .update({ last_run: new Date().toISOString() })
        .eq('id', segmentId)
        .eq('trainer_id', user.id);

      return jsonResponse({ affectedClientIds: [...new Set(affectedIds)] });
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message, 500);
  }
});


