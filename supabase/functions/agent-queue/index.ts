// DEPRECATED: This edge function is no longer used.
// The Queue page now queries the messages table directly for better consistency.
// This function remains for backwards compatibility only.

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
      console.log('Unauthorized request to agent-queue');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: queue, error } = await supabase
      .from('queue_items')
      .select('*')
      .eq('trainer_id', user.id)
      .eq('status', 'review')
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Error fetching queue:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formattedQueue = (queue || []).map(item => ({
      id: item.id,
      clientId: item.client_id,
      clientName: item.client_name,
      preview: item.preview,
      confidence: item.confidence,
      scheduledFor: item.scheduled_for || 'Today',
      why: item.why || [],
      status: item.status,
      createdAt: item.created_at,
    }));

    return new Response(JSON.stringify(formattedQueue), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in agent-queue:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
