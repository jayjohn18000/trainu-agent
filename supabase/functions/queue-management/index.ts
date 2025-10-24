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

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Get Queue Items
    if (action === 'getQueue' && req.method === 'GET') {
      const { data, error } = await supabase
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

      return new Response(JSON.stringify({ queue: data || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Approve Queue Item
    if (action === 'approve' && req.method === 'POST') {
      const { id } = await req.json();

      // Get queue item
      const { data: item } = await supabase
        .from('queue_items')
        .select('*')
        .eq('id', id)
        .eq('trainer_id', user.id)
        .single();

      if (!item) {
        return new Response(JSON.stringify({ error: 'Item not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update queue item status
      await supabase
        .from('queue_items')
        .update({ status: 'approved' })
        .eq('id', id);

      // Add to activity feed
      await supabase
        .from('activity_feed')
        .insert({
          trainer_id: user.id,
          action: 'sent',
          client_name: item.client_name,
          client_id: item.client_id,
          status: 'success',
          message_preview: item.preview,
          confidence: item.confidence,
          why: item.why.join(', '),
        });

      // Update trainer stats
      await supabase.rpc('increment_trainer_stat', {
        trainer_id: user.id,
        stat_name: 'total_messages_approved',
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Edit Queue Item
    if (action === 'edit' && req.method === 'POST') {
      const { id, message, tone } = await req.json();

      await supabase
        .from('queue_items')
        .update({ 
          preview: message,
          status: 'edited',
        })
        .eq('id', id)
        .eq('trainer_id', user.id);

      // Update trainer stats
      await supabase.rpc('increment_trainer_stat', {
        trainer_id: user.id,
        stat_name: 'total_messages_edited',
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Batch Approve
    if (action === 'batchApprove' && req.method === 'POST') {
      const { minConfidence } = await req.json();

      // Get items to approve
      const { data: items } = await supabase
        .from('queue_items')
        .select('*')
        .eq('trainer_id', user.id)
        .eq('status', 'review')
        .gte('confidence', minConfidence || 0.8);

      if (!items || items.length === 0) {
        return new Response(JSON.stringify({ approved: 0 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Approve all items
      const ids = items.map(i => i.id);
      await supabase
        .from('queue_items')
        .update({ status: 'approved' })
        .in('id', ids);

      // Add to activity feed
      const feedItems = items.map(item => ({
        trainer_id: user.id,
        action: 'sent',
        client_name: item.client_name,
        client_id: item.client_id,
        status: 'success',
        message_preview: item.preview,
        confidence: item.confidence,
        why: item.why.join(', '),
      }));

      await supabase
        .from('activity_feed')
        .insert(feedItems);

      return new Response(JSON.stringify({ approved: items.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
