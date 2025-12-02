import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/responses.ts";
import { callAI } from "../_shared/ai-client.ts";
import { generateFallbackChurnInsight } from "../_shared/fallback-insights.ts";
import { PROMPTS, getPromptVersion, type ChurnData } from "../_shared/prompts.ts";
import { getCachedOrGenerate, logAIUsage } from "../_shared/insight-cache.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create user client for auth
    const userClient = createClient(
      SUPABASE_URL ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    );

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const trainerId = user.id;

    // Create service role client for data operations
    const supabase = createClient(
      SUPABASE_URL ?? '',
      SUPABASE_SERVICE_ROLE_KEY ?? ''
    );

    // Fetch all contacts for this trainer
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id, first_name, last_name, created_at, last_message_sent_at, messages_sent_this_week, current_streak, last_checkin_at')
      .eq('trainer_id', trainerId);

    if (contactsError) {
      console.error('Error fetching contacts:', contactsError);
      return errorResponse('Failed to fetch contacts', 500);
    }

    if (!contacts || contacts.length === 0) {
      return jsonResponse({ updated: 0 });
    }

    const now = new Date();
    let updated = 0;
    let aiSuccess = 0;
    let fallbackUsed = 0;

    // Process each contact
    for (const contact of contacts) {
      try {
        // Fetch comprehensive data for this client
        const contactId = contact.id;
        const relationshipWeeks = Math.floor(
          (now.getTime() - new Date(contact.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000)
        );

        // Fetch messages (last 30 days)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const { data: messages } = await supabase
          .from('messages')
          .select('id, content, created_at, status')
          .eq('contact_id', contactId)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(50);

        const messageCount = messages?.filter(m => m.status === 'sent').length || 0;
        const messagesReceived = messages?.filter(m => m.status === 'read').length || 0;

        // Calculate response time trends
        const responseTimes: number[] = [];
        if (messages && messages.length > 1) {
          for (let i = 0; i < messages.length - 1; i++) {
            const sent = new Date(messages[i].created_at).getTime();
            const received = new Date(messages[i + 1].created_at).getTime();
            if (received > sent) {
              responseTimes.push((received - sent) / (1000 * 60 * 60)); // hours
            }
          }
        }
        const avgResponseTime = responseTimes.length > 0
          ? `${Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)}h`
          : 'N/A';
        const responseTimeTrend = responseTimes.length > 2
          ? (responseTimes[0] > responseTimes[responseTimes.length - 1] ? 'improving' : 'declining')
          : 'stable';

        // Fetch bookings
        const { data: bookings } = await supabase
          .from('bookings')
          .select('scheduled_at, status')
          .eq('contact_id', contactId);

        const sessionsScheduled = bookings?.length || 0;
        const sessionsCompleted = bookings?.filter(b => b.status === 'completed').length || 0;
        const sessionsCancelled = bookings?.filter(b => b.status === 'cancelled').length || 0;
        const noShows = bookings?.filter(b => b.status === 'no_show').length || 0;
        const lastSession = bookings
          ?.filter(b => b.status === 'completed')
          .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())[0];
        const lastSessionDate = lastSession
          ? new Date(lastSession.scheduled_at).toLocaleDateString()
          : 'Never';

        // Fetch program data
        const { data: programAssignment } = await supabase
          .from('contacts')
          .select('program_id, programs(name)')
          .eq('id', contactId)
          .single();

        const programName = (programAssignment?.programs as any)?.name || null;
        const programCompletion = 0; // TODO: Calculate from program progress
        const exercisesLogged = 0; // TODO: Calculate from exercise logs

        // Fetch recent notes
        const { data: notes } = await supabase
          .from('client_notes')
          .select('note, created_at')
          .eq('contact_id', contactId)
          .order('created_at', { ascending: false })
          .limit(5);

        const recentNotes = notes?.map(n => `${new Date(n.created_at).toLocaleDateString()}: ${n.note}`).join('\n') || undefined;

        // Calculate streak trend
        const streakTrend = (contact.current_streak || 0) >= 4 ? 'strong' : (contact.current_streak || 0) >= 2 ? 'moderate' : 'weak';

        // Prepare data for AI
        const churnData: ChurnData = {
          clientName: `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Client',
          relationshipWeeks: relationshipWeeks,
          status: contact.last_checkin_at ? 'active' : 'inactive',
          messageCount,
          messagesReceived,
          avgResponseTime,
          responseTimeTrend,
          sessionsScheduled,
          sessionsCompleted,
          sessionsCancelled,
          noShows,
          lastSessionDate,
          currentStreak: contact.current_streak || 0,
          peakStreak: contact.current_streak || 0, // TODO: Track peak streak
          streakTrend,
          preferredDays: [], // TODO: Extract from booking patterns
          timePreference: 'unknown', // TODO: Extract from booking patterns
          programName: programName || undefined,
          programCompletion,
          exercisesLogged,
          recentNotes,
        };

        // Generate insight with caching
        const prompt = PROMPTS.CHURN_PREDICTION.template(churnData);
        const fallback = () => generateFallbackChurnInsight(contact);

        let aiResult: any;
        let latencyMs = 0;
        let usedFallback = false;

      const cacheResult = await getCachedOrGenerate(
        supabase as any,
          trainerId,
          contactId,
          'churn',
          churnData,
          async () => {
            const startTime = Date.now();
            aiResult = await callAI(prompt, fallback);
            latencyMs = aiResult.latencyMs;
            usedFallback = aiResult.usedFallback;
            return aiResult.data;
          },
          60 // 60 minute cache
        );

        const insight = cacheResult.data;
        const finalUsedFallback = usedFallback || insight.reasoning?.includes('fallback') || false;

        // Log AI usage
        await logAIUsage(
          supabase as any,
          trainerId,
          'calculate-insights',
          {
            latencyMs: latencyMs || 0,
            usedFallback: finalUsedFallback,
            error: aiResult?.error,
          },
          cacheResult.fromCache,
          getPromptVersion('CHURN_PREDICTION')
        );

        if (finalUsedFallback) fallbackUsed++;
        else aiSuccess++;

        // Update insights table
        await supabase.from('insights').upsert(
          {
            trainer_id: trainerId,
            contact_id: contactId,
            risk_score: Math.round((insight.churnProbability || 0) * 100),
            churn_probability: insight.churnProbability,
            confidence_level: insight.confidenceLevel,
            risk_category: insight.riskCategory,
            risk_factors: insight.riskFactors,
            positive_indicators: insight.positiveIndicators,
            warning_signals: insight.earlyWarningSignals,
            recommended_actions: insight.recommendedActions,
            ai_reasoning: insight.reasoning,
            used_fallback: finalUsedFallback,
            prompt_version: getPromptVersion('CHURN_PREDICTION'),
            last_activity_at: contact.last_message_sent_at || null,
            current_streak: contact.current_streak || 0,
          },
          { onConflict: 'contact_id' }
        );

        updated++;
      } catch (error) {
        console.error(`Error processing contact ${contact.id}:`, error);
        // Continue with next contact
      }
    }

    return jsonResponse({
      updated,
      aiSuccess,
      fallbackUsed,
      cacheHits: updated - aiSuccess - fallbackUsed,
    });
  } catch (e) {
    console.error('calculate-insights error', e);
    return errorResponse('Internal Error', 500);
  }
});
