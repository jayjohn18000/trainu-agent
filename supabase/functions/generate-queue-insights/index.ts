import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/responses.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

interface QueueInsight {
  id: string;
  title: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  rootCause: string;
  dataSource: string;
  actions: string[];
  clientNames: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Get trainer ID from auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const trainerId = user.id;

    // Query at-risk clients (no check-in in last 7 days OR low streak)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: atRiskClients, error: atRiskError } = await supabase
      .from('contacts')
      .select('id, first_name, last_name, last_checkin_at, current_streak, last_message_sent_at')
      .eq('trainer_id', trainerId)
      .or(`last_checkin_at.lt.${sevenDaysAgo.toISOString()},last_checkin_at.is.null`)
      .order('last_checkin_at', { ascending: true, nullsFirst: true })
      .limit(10);

    if (atRiskError) {
      console.error('Error fetching at-risk clients:', atRiskError);
    }

    // Query positive momentum clients (streak >= 2 AND recent check-in)
    const { data: positiveClients, error: positiveError } = await supabase
      .from('contacts')
      .select('id, first_name, last_name, last_checkin_at, current_streak')
      .eq('trainer_id', trainerId)
      .gte('current_streak', 2)
      .gte('last_checkin_at', sevenDaysAgo.toISOString())
      .order('current_streak', { ascending: false })
      .limit(10);

    if (positiveError) {
      console.error('Error fetching positive clients:', positiveError);
    }

    // Prepare data summaries for AI
    const atRiskSummary = (atRiskClients || []).slice(0, 3).map(c => ({
      name: `${c.first_name} ${c.last_name || ''}`.trim(),
      lastCheckin: c.last_checkin_at ? new Date(c.last_checkin_at).toLocaleDateString() : 'Never',
      streak: c.current_streak || 0,
      lastMessage: c.last_message_sent_at ? new Date(c.last_message_sent_at).toLocaleDateString() : 'Never',
    }));

    const positiveSummary = (positiveClients || []).slice(0, 5).map(c => ({
      name: `${c.first_name} ${c.last_name || ''}`.trim(),
      streak: c.current_streak || 0,
      lastCheckin: c.last_checkin_at ? new Date(c.last_checkin_at).toLocaleDateString() : 'Never',
    }));

    // Call Lovable AI to generate insights
    const aiPrompt = `You are analyzing client engagement data for a personal trainer. Generate 2 insights based on this real data:

AT-RISK CLIENTS (haven't checked in this week):
${JSON.stringify(atRiskSummary, null, 2)}

POSITIVE MOMENTUM CLIENTS (2+ week streak):
${JSON.stringify(positiveSummary, null, 2)}

Generate exactly 2 insights in this JSON format:
{
  "insights": [
    {
      "title": "Concise title with exact client count (e.g., '3 clients haven't checked in this week')",
      "description": "Brief description mentioning specific client names",
      "riskLevel": "high" | "low",
      "rootCause": "One-sentence analysis of the pattern",
      "actions": ["Action 1", "Action 2", "Action 3"]
    }
  ]
}

Rules:
- First insight should be about at-risk clients (riskLevel: "high")
- Second insight should be about positive momentum (riskLevel: "low")
- Use actual client names from the data
- Be specific and actionable
- Keep all text concise`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: aiPrompt,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`Lovable AI error: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    const parsedInsights = JSON.parse(aiContent);

    // Build final insights with real client names
    const insights: QueueInsight[] = [];

    // At-risk insight
    if (parsedInsights.insights[0] && atRiskClients && atRiskClients.length > 0) {
      const atRiskNames = atRiskClients.slice(0, 3).map(c => c.first_name);
      insights.push({
        id: '1',
        title: parsedInsights.insights[0].title,
        description: parsedInsights.insights[0].description,
        riskLevel: 'high',
        rootCause: parsedInsights.insights[0].rootCause,
        dataSource: 'Check-in History + Session Tracking',
        actions: parsedInsights.insights[0].actions,
        clientNames: atRiskNames,
      });
    }

    // Positive momentum insight
    if (parsedInsights.insights[1] && positiveClients && positiveClients.length > 0) {
      const positiveNames = positiveClients.slice(0, 5).map(c => c.first_name);
      insights.push({
        id: '2',
        title: parsedInsights.insights[1].title,
        description: parsedInsights.insights[1].description,
        riskLevel: 'low',
        rootCause: parsedInsights.insights[1].rootCause,
        dataSource: 'Streak Data + Check-in Compliance',
        actions: parsedInsights.insights[1].actions,
        clientNames: positiveNames,
      });
    }

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating insights:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate insights',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
