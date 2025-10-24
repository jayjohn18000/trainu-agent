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
      console.log('Unauthorized request to agent-feed');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: feed, error } = await supabase
      .from('activity_feed')
      .select('*')
      .eq('trainer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching feed:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formattedFeed = (feed || []).map(item => {
      const now = new Date();
      const created = new Date(item.created_at);
      const diff = Math.floor((now.getTime() - created.getTime()) / 1000 / 60);
      
      let ts;
      if (diff < 60) ts = `${diff} min ago`;
      else if (diff < 1440) ts = `${Math.floor(diff / 60)} hour${Math.floor(diff / 60) > 1 ? 's' : ''} ago`;
      else ts = `${Math.floor(diff / 1440)} day${Math.floor(diff / 1440) > 1 ? 's' : ''} ago`;

      return {
        id: item.id,
        ts,
        action: item.action,
        client: item.client_name,
        clientId: item.client_id,
        status: item.status,
        why: item.why,
        messagePreview: item.message_preview,
        confidence: item.confidence,
      };
    });

    return new Response(JSON.stringify(formattedFeed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in agent-feed:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
