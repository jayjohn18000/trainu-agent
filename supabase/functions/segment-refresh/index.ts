import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { jsonResponse, errorResponse, optionsResponse } from '../_shared/responses.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return optionsResponse();
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Fetch all segments that should be refreshed
    // This fetches segments with rules that have a schedule (daily, weekly, etc.)
    const { data: segments, error: segError } = await supabase
      .from('segment_rules')
      .select('segment_id, segments(id, trainer_id, name)')
      .not('schedule', 'is', null);

    if (segError) {
      console.error('Error fetching segments:', segError);
      return errorResponse(segError.message, 500);
    }

    if (!segments || segments.length === 0) {
      return jsonResponse({ refreshed: 0 });
    }

    // Extract unique segment IDs
    const uniqueSegments = new Map();
    for (const rule of segments) {
      const seg = (rule as any).segments;
      if (seg && seg.id) {
        uniqueSegments.set(seg.id, seg);
      }
    }

    let refreshed = 0;

    // Refresh each unique segment
    for (const segment of uniqueSegments.values()) {
      try {
        // Call agent-segmentation runRuleNow
        const { data: result, error: runError } = await supabase.functions.invoke('agent-segmentation', {
          body: {
            action: 'runRuleNow',
            segmentId: segment.id,
          },
          headers: {
            // Use service role for internal call
            Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''}`,
          },
        });

        if (runError) {
          console.error(`Failed to refresh segment ${segment.id}:`, runError);
          continue;
        }

        refreshed++;
      } catch (err) {
        console.error(`Error refreshing segment ${segment.id}:`, err);
      }
    }

    return jsonResponse({ 
      refreshed,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Segment refresh error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message, 500);
  }
});

