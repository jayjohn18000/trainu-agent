import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { corsHeaders } from '../_shared/responses.ts'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const checks = {
    db: false,
    ghl: false,
    ai: false,
    timestamp: new Date().toISOString()
  };

  try {
    // DB check
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { error: dbErr } = await supabase
      .from('messages')
      .select('id')
      .limit(1);
    
    checks.db = !dbErr;

    // GHL check (if configured)
    const GHL_API_BASE = Deno.env.get('GHL_API_BASE');
    const GHL_ACCESS_TOKEN = Deno.env.get('GHL_ACCESS_TOKEN');

    if (GHL_API_BASE && GHL_ACCESS_TOKEN) {
      try {
        const ghlRes = await fetch(`${GHL_API_BASE}/locations/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${GHL_ACCESS_TOKEN}`,
            'Version': '2021-07-28'
          }
        });
        checks.ghl = ghlRes.ok || ghlRes.status === 401; // 401 means API is reachable
      } catch (ghlError) {
        console.error('GHL health check failed:', ghlError);
        checks.ghl = false;
      }
    } else {
      checks.ghl = true; // Not configured, so consider it "healthy"
    }

    // AI check (Lovable AI Gateway)
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (LOVABLE_API_KEY) {
      try {
        const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [{ role: 'user', content: 'health check' }],
            max_completion_tokens: 5
          })
        });
        checks.ai = aiRes.ok;
      } catch (aiError) {
        console.error('AI health check failed:', aiError);
        checks.ai = false;
      }
    } else {
      checks.ai = false;
    }

    const allHealthy = checks.db && checks.ai;
    const status = allHealthy ? 'healthy' : 'degraded';

    return new Response(
      JSON.stringify({
        status,
        services: checks
      }),
      {
        status: allHealthy ? 200 : 503,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Health check error:', error);
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        services: checks
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
