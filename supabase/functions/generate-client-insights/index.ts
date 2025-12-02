import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/responses.ts";
import { callAI } from "../_shared/ai-client.ts";
import { PROMPTS, getPromptVersion, type ClientInsightData } from "../_shared/prompts.ts";
import { getCachedOrGenerate, logAIUsage } from "../_shared/insight-cache.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

interface ClientInsight {
  title: string;
  description: string;
  actionable?: string;
  impact: 'high' | 'medium' | 'low';
  category: 'progress' | 'pattern' | 'recommendation';
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
      return errorResponse('Missing authorization', 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    const trainerId = user.id;

    // Get contactId from request body
    const body = await req.json().catch(() => ({}));
    const contactId = body.contactId;

    if (!contactId) {
      return errorResponse('contactId is required', 400);
    }

    // Verify contact belongs to trainer
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('id, first_name, last_name, created_at, last_checkin_at, current_streak')
      .eq('id', contactId)
      .eq('trainer_id', trainerId)
      .single();

    if (contactError || !contact) {
      return errorResponse('Contact not found', 404);
    }

    const clientName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Client';

    // Fetch check-in history
    const { data: checkins } = await supabase
      .from('contacts')
      .select('last_checkin_at, current_streak')
      .eq('id', contactId)
      .single();

    const checkinHistory = checkins?.last_checkin_at
      ? [
          {
            date: new Date(checkins.last_checkin_at).toLocaleDateString(),
            streak: checkins.current_streak || 0,
          },
        ]
      : [];

    // Calculate workout frequency
    const { data: bookings } = await supabase
      .from('bookings')
      .select('scheduled_at, status')
      .eq('contact_id', contactId)
      .order('scheduled_at', { ascending: false });

    const completedBookings = bookings?.filter((b) => b.status === 'completed') || [];
    const frequency =
      completedBookings.length > 0
        ? `${completedBookings.length} sessions in last 30 days`
        : 'No sessions recorded';

    // Fetch goals
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Calculate progress metrics
    const metrics = {
      streak: contact.current_streak || 0,
      sessionsCompleted: completedBookings.length,
      sessionsScheduled: bookings?.length || 0,
      completionRate: bookings?.length
        ? Math.round((completedBookings.length / bookings.length) * 100)
        : 0,
    };

    // Fetch recent messages
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const { data: messages } = await supabase
      .from('messages')
      .select('content, created_at, status')
      .eq('contact_id', contactId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    const messageContext = messages
      ?.map((m) => `${new Date(m.created_at).toLocaleDateString()}: ${m.content.substring(0, 100)}`)
      .join('\n') || 'No recent messages';

    // Fetch trainer notes
    const { data: notes } = await supabase
      .from('client_notes')
      .select('note, created_at')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false })
      .limit(5);

    const notesText = notes?.map((n) => `${new Date(n.created_at).toLocaleDateString()}: ${n.note}`).join('\n') || 'No notes';

    // Prepare data for AI
    const clientData: ClientInsightData = {
      clientName,
      checkins: checkinHistory,
      frequency,
      goals: goals || [],
      metrics,
      messageContext,
      notes: notesText,
    };

    // Generate insights with caching
    const prompt = PROMPTS.CLIENT_INSIGHTS.template(clientData);
    const fallback = () => ({
      insights: [
        {
          title: `You're on a ${contact.current_streak || 0} week streak!`,
          description: `Keep up the great work! Consistency is key to achieving your fitness goals.`,
          actionable: 'Schedule your next session',
          impact: 'high' as const,
          category: 'progress' as const,
        },
        {
          title: `You've completed ${completedBookings.length} sessions recently`,
          description: `Your workout frequency shows ${frequency}.`,
          actionable: 'Maintain this momentum',
          impact: 'medium' as const,
          category: 'pattern' as const,
        },
        {
          title: 'Ready for your next challenge?',
          description: `Consider setting a new goal or increasing workout intensity.`,
          actionable: 'Talk to your trainer',
          impact: 'high' as const,
          category: 'recommendation' as const,
        },
      ],
    });

    let aiResult: any;
    let latencyMs = 0;
    let usedFallback = false;

    const cacheResult = await getCachedOrGenerate(
      supabase,
      trainerId,
      contactId,
      'client',
      clientData,
      async () => {
        aiResult = await callAI(prompt, fallback);
        latencyMs = aiResult.latencyMs;
        usedFallback = aiResult.usedFallback;
        return aiResult.data;
      },
      10 // 10 minute cache
    );

    const aiData = cacheResult.data;

    // Log AI usage
    await logAIUsage(
      supabase,
      trainerId,
      'generate-client-insights',
      {
        latencyMs: latencyMs || 0,
        usedFallback: usedFallback,
        error: aiResult?.error,
      },
      cacheResult.fromCache,
      getPromptVersion('CLIENT_INSIGHTS')
    );

    // Return insights
    const insights: ClientInsight[] = aiData.insights || fallback().insights;

    return jsonResponse({ insights });
  } catch (error) {
    console.error('Error generating client insights:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to generate insights',
      500
    );
  }
});

