import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = req.method === 'POST' ? await req.json() : {};
    const action = body?.action;

    if (action === 'upsertRule' && req.method === 'POST') {
      const { segmentId, name, dsl_json, schedule } = body;
      if (segmentId) {
        const { data, error } = await supabase
          .from('segment_rules')
          .insert({ trainer_id: user.id, segment_id: segmentId, name, dsl_json, schedule })
          .select()
          .single();
        if (error) throw error;
        return new Response(JSON.stringify({ rule: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
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
        return new Response(JSON.stringify({ segment, rule }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (action === 'runRuleNow' && req.method === 'POST') {
      const { segmentId } = body;
      // Stub: return empty affected list for now
      return new Response(JSON.stringify({ affectedClientIds: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


