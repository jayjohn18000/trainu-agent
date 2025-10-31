import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { jsonResponse, errorResponse, optionsResponse } from '../_shared/responses.ts'

interface IntentResult {
  intent: 'checkin' | 'confirm' | 'recover' | 'general';
  confidence: number;
}

// Extract helper for name parsing
function getFirstName(clientName: string | null): string {
  return clientName ? clientName.split(' ')[0] : 'there';
}

// Extract intent detection logic for testability
function detectIntent(text: string, hasClientContext: boolean): IntentResult {
  const lower = text.toLowerCase().trim();
  let intent: IntentResult['intent'] = 'general';
  let confidence = hasClientContext ? 0.85 : 0.75;
  
  if (lower.match(/check|check.?in|progress|workout|how.*going/i)) {
    intent = 'checkin';
    confidence += 0.05;
  } else if (lower.match(/confirm|session|appointment|schedule/i)) {
    intent = 'confirm';
    confidence += 0.05;
  } else if (lower.match(/no.?show|missed|cancel|recover|reschedule/i)) {
    intent = 'recover';
    confidence += 0.05;
  }
  
  return { intent, confidence };
}

// Infer channel based on text properties
function inferChannel(text: string): 'sms' | 'email' | 'both' {
  const lower = text.toLowerCase();
  
  if (text.length > 200 || lower.includes('email') || lower.includes('detailed')) {
    return 'email';
  } else if (lower.includes('both') || lower.includes('sms.*email')) {
    return 'both';
  }
  
  return 'sms';
}

// Generate draft body based on intent
function generateDraftBody(
  intent: string,
  text: string,
  clientName: string | null,
  context?: any
): string {
  const name = getFirstName(clientName);
  
  switch (intent) {
    case 'checkin': {
      let body = `Hey ${name}, quick check-in — how did your last workout go?`;
      if (context?.recent_activity) {
        body += ` I saw you ${context.recent_activity}.`;
      }
      return body;
    }
    
    case 'confirm': {
      const when = context?.session_type 
        ? `your ${context.session_type} session` 
        : 'your next session';
      return `Hi ${name}, can you confirm ${when}? Reply YES to confirm or NO to reschedule.`;
    }
    
    case 'recover':
      return `Hey ${name}, missed you last time. Everything okay? I can help you get back on track — want to pick a new time?`;
    
    default:
      // Use original text, trim if needed
      return text.slice(0, 280);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return optionsResponse();
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = req.method === 'POST' ? await req.json() : {};
    const action = body?.action;

    if (action === 'nlToDrafts' && req.method === 'POST') {
      const { text, context } = body;
      if (!text || typeof text !== 'string') {
        return errorResponse('text required', 400);
      }

      // Fetch client if context provides ID
      let clientName: string | null = null;
      if (context?.client_id) {
        const { data: client } = await supabase
          .from('clients')
          .select('id, name')
          .eq('id', context.client_id)
          .eq('trainer_id', user.id)
          .single();
        if (client) clientName = (client as any).name;
      }

      // Detect intent and infer channel
      const { intent, confidence } = detectIntent(text, !!context?.client_id);
      const inferredChannel = inferChannel(text);
      
      // Generate draft body
      const draftBody = generateDraftBody(intent, text, clientName, context);

      const drafts = [
        {
          channel: inferredChannel,
          body: draftBody,
          client_id: context?.client_id ?? null,
          metadata: {
            source: 'nlToDrafts',
            intent,
            confidence,
            parsed_at: new Date().toISOString(),
          },
        },
      ];

      // Optionally return multiple variants (tone variations)
      if (intent === 'general' && text.length > 50) {
        drafts.push({
          channel: inferredChannel,
          body: text.slice(0, 280),
          client_id: context?.client_id ?? null,
          metadata: { 
            source: 'nlToDrafts', 
            intent: 'general', 
            confidence: confidence - 0.10, 
            variant: 'casual' 
          },
        });
      }

      return jsonResponse({ drafts });
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message, 500);
  }
});
