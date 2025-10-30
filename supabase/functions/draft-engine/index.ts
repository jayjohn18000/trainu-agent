import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DraftRequest {
  contactId: string;
  triggerType: 'booking_confirmed' | 'booking_upcoming' | 'missed_session' | 'no_activity' | 'milestone';
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

    const { contactId, triggerType }: DraftRequest = await req.json();

    // Fetch contact data
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .eq('trainer_id', user.id)
      .single();

    if (contactError || !contact) {
      console.error('Contact not found:', contactError);
      return new Response(JSON.stringify({ error: 'Contact not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch recent bookings
    const { data: recentBookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('contact_id', contactId)
      .order('scheduled_at', { ascending: false })
      .limit(3);

    // Fetch insights
    const { data: insights } = await supabase
      .from('insights')
      .select('*')
      .eq('contact_id', contactId)
      .single();

    // Build context and prompt based on trigger type
    const { systemPrompt, userPrompt, confidence, whyReasons } = buildPrompt(
      contact,
      triggerType,
      recentBookings || [],
      insights
    );

    // Call Lovable AI to generate message
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 200,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'AI generation failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const generatedMessage = aiData.choices?.[0]?.message?.content || 'Hey! Just checking in.';

    // Insert draft message into messages table
    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert({
        trainer_id: user.id,
        contact_id: contactId,
        status: 'draft',
        content: generatedMessage,
        channel: 'sms',
        confidence,
        why_reasons: whyReasons,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to insert message:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to create draft' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log event
    await supabase.from('events').insert({
      trainer_id: user.id,
      event_type: 'draft_generated',
      entity_type: 'message',
      entity_id: message.id,
      metadata: { triggerType, confidence, contactId },
    });

    return new Response(
      JSON.stringify({
        messageId: message.id,
        content: generatedMessage,
        confidence,
        why: whyReasons,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in draft-engine:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildPrompt(
  contact: any,
  triggerType: string,
  bookings: any[],
  insights: any
): { systemPrompt: string; userPrompt: string; confidence: number; whyReasons: string[] } {
  const clientName = `${contact.first_name} ${contact.last_name || ''}`.trim();
  let systemPrompt = 'You are a helpful AI assistant for personal trainers. Generate concise, friendly messages under 160 characters for SMS.';
  let userPrompt = '';
  let confidence = 0.7;
  let whyReasons: string[] = [];

  switch (triggerType) {
    case 'booking_confirmed': {
      const nextBooking = bookings[0];
      const sessionDate = nextBooking ? new Date(nextBooking.scheduled_at).toLocaleDateString() : 'soon';
      const sessionTime = nextBooking ? new Date(nextBooking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      const sessionType = nextBooking?.session_type || 'session';
      
      userPrompt = `Generate a friendly confirmation message for ${clientName} about their ${sessionType} on ${sessionDate} at ${sessionTime}. Keep it under 160 characters for SMS. Tone: encouraging and professional.`;
      confidence = 0.85;
      whyReasons = [
        'New booking created',
        'Client expects confirmation',
        'High engagement opportunity',
      ];
      break;
    }

    case 'booking_upcoming': {
      const upcomingBooking = bookings[0];
      const sessionDate = upcomingBooking ? new Date(upcomingBooking.scheduled_at).toLocaleDateString() : 'tomorrow';
      const sessionTime = upcomingBooking ? new Date(upcomingBooking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      
      userPrompt = `Generate a friendly reminder message for ${clientName} about their upcoming session on ${sessionDate} at ${sessionTime}. Keep it under 160 characters. Add a motivational note.`;
      confidence = 0.82;
      whyReasons = [
        'Session scheduled within 24 hours',
        'Reminder reduces no-shows',
        'Keeps client engaged',
      ];
      break;
    }

    case 'missed_session': {
      const missedDate = bookings[0] ? new Date(bookings[0].scheduled_at).toLocaleDateString() : 'last session';
      
      userPrompt = `${clientName} missed their session on ${missedDate}. Generate an empathetic re-engagement message asking if they want to reschedule. Keep it under 160 characters. Tone: encouraging, not pushy or judgmental.`;
      confidence = 0.70;
      whyReasons = [
        'Missed session detected',
        'Re-engagement opportunity',
        'Risk of client churn',
      ];
      break;
    }

    case 'no_activity': {
      const daysSinceActivity = insights?.last_activity_at 
        ? Math.floor((Date.now() - new Date(insights.last_activity_at).getTime()) / (1000 * 60 * 60 * 24))
        : 7;
      
      userPrompt = `${clientName} has been inactive for ${daysSinceActivity} days. Generate a friendly check-in message to re-engage them. Keep it under 160 characters. Tone: warm and supportive.`;
      confidence = 0.75;
      whyReasons = [
        `${daysSinceActivity}+ days of inactivity`,
        'Risk of client attrition',
        'Early intervention opportunity',
      ];
      break;
    }

    case 'milestone': {
      const totalSessions = insights?.total_sessions || 5;
      const streak = insights?.current_streak || 3;
      
      userPrompt = `${clientName} just completed session #${totalSessions} and has a ${streak}-day streak. Generate a congratulatory message celebrating their milestone and asking for feedback. Keep it under 160 characters. Tone: enthusiastic and proud.`;
      confidence = 0.90;
      whyReasons = [
        `Milestone reached: ${totalSessions} sessions`,
        `${streak}-day streak active`,
        'High engagement moment',
      ];
      break;
    }

    default:
      userPrompt = `Generate a friendly check-in message for ${clientName}. Keep it under 160 characters.`;
      whyReasons = ['General check-in'];
  }

  return { systemPrompt, userPrompt, confidence, whyReasons };
}