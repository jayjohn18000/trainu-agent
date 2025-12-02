import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/responses.ts";
import { callAI } from "../_shared/ai-client.ts";
import { PROMPTS, getPromptVersion, type QueueData } from "../_shared/prompts.ts";
import { getCachedOrGenerate, logAIUsage } from "../_shared/insight-cache.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

interface QueueInsight {
  id: string;
  title: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  rootCause: string;
  evidence?: string[];
  diagnosticQuestions?: string[];
  strategies?: Array<{ strategy: string; successProbability: number }>;
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
      return errorResponse('Missing authorization', 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    const trainerId = user.id;

    // Query at-risk clients (no check-in in last 7 days OR low streak)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: atRiskClients, error: atRiskError } = await supabase
      .from('contacts')
      .select('id, first_name, last_name, last_checkin_at, current_streak, last_message_sent_at, created_at')
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
      .select('id, first_name, last_name, last_checkin_at, current_streak, created_at')
      .eq('trainer_id', trainerId)
      .gte('current_streak', 2)
      .gte('last_checkin_at', sevenDaysAgo.toISOString())
      .order('current_streak', { ascending: false })
      .limit(10);

    if (positiveError) {
      console.error('Error fetching positive clients:', positiveError);
    }

    // Fetch detailed data for at-risk clients
    const atRiskDetails = await Promise.all(
      (atRiskClients || []).slice(0, 3).map(async (c) => {
        const daysAgo = c.last_checkin_at
          ? Math.floor((Date.now() - new Date(c.last_checkin_at).getTime()) / 86400000)
          : 999;

        // Fetch recent messages
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const { data: messages } = await supabase
          .from('messages')
          .select('content, created_at, status')
          .eq('contact_id', c.id)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(10);

        const recentMessages = messages
          ?.map((m) => `${new Date(m.created_at).toLocaleDateString()}: ${m.content.substring(0, 50)}...`)
          .join('; ') || 'No recent messages';

        // Simple sentiment analysis (count positive/negative words)
        const positiveWords = ['great', 'good', 'excited', 'love', 'thanks', 'awesome', 'amazing'];
        const negativeWords = ['can\'t', 'won\'t', 'busy', 'sorry', 'tired', 'hard', 'difficult'];
        const messageText = messages?.map((m) => m.content.toLowerCase()).join(' ') || '';
        const positiveCount = positiveWords.filter((w) => messageText.includes(w)).length;
        const negativeCount = negativeWords.filter((w) => messageText.includes(w)).length;
        const sentimentTrend = negativeCount > positiveCount ? 'declining' : positiveCount > negativeCount ? 'positive' : 'neutral';

        // Fetch booking pattern
        const { data: bookings } = await supabase
          .from('bookings')
          .select('scheduled_at, status')
          .eq('contact_id', c.id)
          .order('scheduled_at', { ascending: false })
          .limit(10);

        const bookingPattern = bookings
          ?.map((b) => `${b.status}: ${new Date(b.scheduled_at).toLocaleDateString()}`)
          .join('; ') || 'No recent bookings';

        // Calculate response time change
        const responseTimes: number[] = [];
        if (messages && messages.length > 1) {
          for (let i = 0; i < messages.length - 1; i++) {
            const sent = new Date(messages[i].created_at).getTime();
            const received = new Date(messages[i + 1].created_at).getTime();
            if (received > sent) {
              responseTimes.push((received - sent) / (1000 * 60 * 60));
            }
          }
        }
        const responseTimeChange =
          responseTimes.length > 2
            ? responseTimes[0] > responseTimes[responseTimes.length - 1]
              ? 'improving'
              : 'declining'
            : 'stable';

        return {
          name: `${c.first_name} ${c.last_name || ''}`.trim(),
          daysAgo,
          recentMessages,
          sentimentTrend,
          bookingPattern,
          responseTimeChange,
        };
      })
    );

    // Fetch detailed data for positive clients
    const positiveDetails = await Promise.all(
      (positiveClients || []).slice(0, 5).map(async (c) => {
        const { data: messages } = await supabase
          .from('messages')
          .select('status')
          .eq('contact_id', c.id)
          .limit(20);

        const engagementScore = messages ? (messages.filter((m) => m.status === 'read').length / messages.length) * 100 : 0;

        return {
          name: `${c.first_name} ${c.last_name || ''}`.trim(),
          streak: c.current_streak || 0,
          engagementScore: Math.round(engagementScore),
          progressIndicators: `${c.current_streak} week streak, ${Math.round(engagementScore)}% engagement`,
        };
      })
    );

    // Prepare data for AI
    const queueData: QueueData = {
      atRiskClients: atRiskDetails,
      positiveClients: positiveDetails,
    };

    // Generate insights with caching
    const prompt = PROMPTS.QUEUE_INSIGHTS.template(queueData);
    const fallback = () => ({
      insights: [
        {
          title: `${atRiskClients?.length || 0} clients haven't checked in this week`,
          description: `These clients may need re-engagement: ${atRiskDetails.map((c) => c.name).join(', ')}`,
          riskLevel: 'high' as const,
          rootCause: 'Lack of recent engagement',
          evidence: [],
          diagnosticQuestions: [],
          strategies: [],
          clientNames: atRiskDetails.map((c) => c.name),
        },
        {
          title: `${positiveClients?.length || 0} clients showing strong momentum`,
          description: `These clients are maintaining excellent streaks: ${positiveDetails.map((c) => c.name).join(', ')}`,
          riskLevel: 'low' as const,
          rootCause: 'Consistent engagement',
          evidence: [],
          diagnosticQuestions: [],
          strategies: [],
          clientNames: positiveDetails.map((c) => c.name),
        },
      ],
    });

    let aiResult: any;
    let latencyMs = 0;
    let usedFallback = false;

    const cacheResult = await getCachedOrGenerate(
      supabase,
      trainerId,
      null,
      'queue',
      queueData,
      async () => {
        aiResult = await callAI(prompt, fallback);
        latencyMs = aiResult.latencyMs;
        usedFallback = aiResult.usedFallback;
        return aiResult.data;
      },
      10 // 10 minute cache for queue insights
    );

    const aiData = cacheResult.data;
    const insights: QueueInsight[] = [];

    // Log AI usage
    await logAIUsage(
      supabase,
      trainerId,
      'generate-queue-insights',
      {
        latencyMs: latencyMs || 0,
        usedFallback: usedFallback,
        error: aiResult?.error,
      },
      cacheResult.fromCache,
      getPromptVersion('QUEUE_INSIGHTS')
    );

    // Build insights from AI response
    if (aiData.insights && aiData.insights.length >= 2) {
      // At-risk insight
      if (aiData.insights[0] && atRiskClients && atRiskClients.length > 0) {
        const atRiskNames = atRiskClients.slice(0, 3).map((c) => c.first_name);
        insights.push({
          id: '1',
          title: aiData.insights[0].title,
          description: aiData.insights[0].description,
          riskLevel: 'high',
          rootCause: aiData.insights[0].rootCause,
          evidence: aiData.insights[0].evidence || [],
          diagnosticQuestions: aiData.insights[0].diagnosticQuestions || [],
          strategies: aiData.insights[0].strategies || [],
          dataSource: 'Check-in History + Session Tracking + Message Analysis',
          actions: aiData.insights[0].strategies?.map((s: any) => s.strategy) || aiData.insights[0].actions || [],
          clientNames: atRiskNames,
        });
      }

      // Positive momentum insight
      if (aiData.insights[1] && positiveClients && positiveClients.length > 0) {
        const positiveNames = positiveClients.slice(0, 5).map((c) => c.first_name);
        insights.push({
          id: '2',
          title: aiData.insights[1].title,
          description: aiData.insights[1].description,
          riskLevel: 'low',
          rootCause: aiData.insights[1].rootCause,
          evidence: aiData.insights[1].evidence || [],
          diagnosticQuestions: aiData.insights[1].diagnosticQuestions || [],
          strategies: aiData.insights[1].strategies || [],
          dataSource: 'Streak Data + Check-in Compliance + Engagement Metrics',
          actions: aiData.insights[1].strategies?.map((s: any) => s.strategy) || aiData.insights[1].actions || [],
          clientNames: positiveNames,
        });
      }
    }

    return jsonResponse({ insights });
  } catch (error) {
    console.error('Error generating insights:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to generate insights',
      500
    );
  }
});
