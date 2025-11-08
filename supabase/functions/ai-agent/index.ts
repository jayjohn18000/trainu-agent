import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Tool {
  type: string;
  function: {
    name: string;
    description: string;
    parameters: any;
  };
}

const tools: Tool[] = [
  {
    type: "function",
    function: {
      name: "get_client_info",
      description: "Get detailed information about a specific client including risk score, engagement metrics, and upcoming sessions",
      parameters: {
        type: "object",
        properties: {
          client_name: { type: "string", description: "The client's name" }
        },
        required: ["client_name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_clients",
      description: "List all clients with optional filters like at-risk, engaged, or new clients",
      parameters: {
        type: "object",
        properties: {
          filter: { 
            type: "string", 
            enum: ["all", "at-risk", "engaged", "new"],
            description: "Filter clients by status" 
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "suggest_tags",
      description: "Analyze all clients and suggest appropriate tags based on behavior patterns",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "apply_tags",
      description: "Apply or remove tags for a specific client",
      parameters: {
        type: "object",
        properties: {
          contact_id: { type: "string", description: "The client's UUID" },
          tags_to_add: { type: "array", items: { type: "string" }, description: "Tags to add" },
          tags_to_remove: { type: "array", items: { type: "string" }, description: "Tags to remove" }
        },
        required: ["contact_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_trainer_stats",
      description: "Get the trainer's overall performance statistics and metrics",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_draft_message",
      description: "Create a draft message for a client. Use this when the trainer asks to draft, create, or send a message to a client. The message will be saved as a draft for review before sending.",
      parameters: {
        type: "object",
        properties: {
          contact_id: { 
            type: "string", 
            description: "The client's UUID" 
          },
          contact_name: { 
            type: "string", 
            description: "The client's name for context" 
          },
          message_context: { 
            type: "string", 
            description: "Why this message is needed (e.g., 'client facing personal challenges', 'at-risk client', 'post-session followup', 'check-in needed')" 
          },
          channel: { 
            type: "string", 
            enum: ["sms", "email"], 
            description: "Communication channel (defaults to sms)" 
          }
        },
        required: ["contact_id", "contact_name", "message_context"]
      }
    }
  }
];

const systemPrompt = `You are an AI fitness assistant helping a personal trainer manage their clients.
You have access to client data, bookings, engagement metrics, and message history.

Your capabilities:
- Answer questions about specific clients or overall performance
- Suggest intelligent tags based on client behavior patterns (at-risk, engaged, vip, new, needs-attention, high-performer, comeback)
- Provide insights about at-risk clients and engagement trends
- Analyze workout patterns and session attendance
- **CREATE DRAFT MESSAGES for clients** - You can and should create personalized, empathetic message drafts when requested

When creating drafts:
- Be empathetic and supportive, especially for clients facing personal challenges or hardships
- Personalize messages based on client history, current situation, and engagement metrics
- Keep messages concise but warm (1-3 sentences for SMS, more detailed for email)
- Use the client's context to make relevant, actionable suggestions
- Always create drafts for trainer review - never claim you cannot help with sensitive topics
- The draft will be saved for the trainer to review and approve before sending

Be concise, actionable, and supportive. Use the tools available to fetch real data.
Always cite specific metrics when making recommendations.
Use emojis sparingly but appropriately to make responses friendly.

Tag criteria:
- "at-risk": risk_score >= 75, missed_sessions >= 2, or no activity in 14+ days
- "engaged": response_rate >= 0.8, current_streak >= 3, high engagement
- "vip": Long-term clients, high session count, consistent attendance  
- "new": Created within last 30 days, fewer than 3 total sessions
- "comeback": Had gap in activity, recently returned
- "high-performer": Low risk score, high engagement, strong streak
- "needs-attention": Moderate risk (40-74), declining engagement`;

async function getClientInfo(supabase: any, trainerId: string, clientName: string) {
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*, insights(*)')
    .eq('trainer_id', trainerId)
    .ilike('first_name', `%${clientName}%`)
    .limit(1)
    .single();

  if (!contacts) return { error: "Client not found" };

  const { data: upcomingSessions } = await supabase
    .from('bookings')
    .select('*')
    .eq('contact_id', contacts.id)
    .eq('status', 'scheduled')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(1);

  return {
    name: `${contacts.first_name} ${contacts.last_name || ''}`.trim(),
    email: contacts.email,
    phone: contacts.phone,
    tags: contacts.tags || [],
    risk_score: contacts.insights?.[0]?.risk_score || 0,
    engagement_score: contacts.insights?.[0]?.engagement_score || 0,
    response_rate: contacts.insights?.[0]?.response_rate || 0,
    current_streak: contacts.insights?.[0]?.current_streak || 0,
    total_sessions: contacts.insights?.[0]?.total_sessions || 0,
    missed_sessions: contacts.insights?.[0]?.missed_sessions || 0,
    last_activity: contacts.insights?.[0]?.last_activity_at,
    next_session: upcomingSessions?.[0]
  };
}

async function listClients(supabase: any, trainerId: string, filter: string = 'all') {
  let query = supabase
    .from('contacts')
    .select('id, first_name, last_name, tags, insights(risk_score, engagement_score, current_streak)')
    .eq('trainer_id', trainerId);

  if (filter === 'at-risk') {
    query = query.gte('insights.risk_score', 75);
  } else if (filter === 'engaged') {
    query = query.gte('insights.engagement_score', 0.7);
  }

  const { data } = await query;
  return data || [];
}

async function suggestTags(supabase: any, trainerId: string) {
  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, tags, created_at, insights(*)')
    .eq('trainer_id', trainerId);

  if (!contacts) return [];

  const suggestions: any[] = [];
  const now = new Date();

  for (const contact of contacts) {
    const insight = contact.insights?.[0];
    if (!insight) continue;

    const currentTags = contact.tags || [];
    const createdDaysAgo = Math.floor((now.getTime() - new Date(contact.created_at).getTime()) / (1000 * 60 * 60 * 24));

    // At-risk logic
    if (insight.risk_score >= 75 && !currentTags.includes('at-risk')) {
      suggestions.push({
        contact_id: contact.id,
        contact_name: `${contact.first_name} ${contact.last_name || ''}`.trim(),
        suggested_tag: 'at-risk',
        reason: `Risk score ${insight.risk_score}, ${insight.missed_sessions} missed sessions`,
        confidence: 0.9,
        action: 'add'
      });
    }

    // Engaged logic
    if (insight.engagement_score >= 0.7 && insight.current_streak >= 3 && !currentTags.includes('engaged')) {
      suggestions.push({
        contact_id: contact.id,
        contact_name: `${contact.first_name} ${contact.last_name || ''}`.trim(),
        suggested_tag: 'engaged',
        reason: `${Math.round(insight.engagement_score * 100)}% engagement, ${insight.current_streak}-week streak`,
        confidence: 0.85,
        action: 'add'
      });
    }

    // VIP logic
    if (insight.total_sessions >= 20 && insight.risk_score < 40 && !currentTags.includes('vip')) {
      suggestions.push({
        contact_id: contact.id,
        contact_name: `${contact.first_name} ${contact.last_name || ''}`.trim(),
        suggested_tag: 'vip',
        reason: `${insight.total_sessions} sessions, low risk, consistent attendance`,
        confidence: 0.9,
        action: 'add'
      });
    }

    // New logic
    if (createdDaysAgo <= 30 && insight.total_sessions < 3 && !currentTags.includes('new')) {
      suggestions.push({
        contact_id: contact.id,
        contact_name: `${contact.first_name} ${contact.last_name || ''}`.trim(),
        suggested_tag: 'new',
        reason: `Joined ${createdDaysAgo} days ago, ${insight.total_sessions} sessions`,
        confidence: 0.95,
        action: 'add'
      });
    }

    // Remove at-risk if improved
    if (insight.risk_score < 50 && currentTags.includes('at-risk')) {
      suggestions.push({
        contact_id: contact.id,
        contact_name: `${contact.first_name} ${contact.last_name || ''}`.trim(),
        suggested_tag: 'at-risk',
        reason: `Risk improved to ${insight.risk_score}`,
        confidence: 0.8,
        action: 'remove'
      });
    }
  }

  return suggestions;
}

async function applyTags(supabase: any, trainerId: string, contactId: string, tagsToAdd: string[] = [], tagsToRemove: string[] = []) {
  const { data: contact } = await supabase
    .from('contacts')
    .select('tags')
    .eq('id', contactId)
    .eq('trainer_id', trainerId)
    .single();

  if (!contact) return { error: "Client not found" };

  let currentTags = contact.tags || [];
  
  // Add new tags
  if (tagsToAdd.length > 0) {
    currentTags = [...new Set([...currentTags, ...tagsToAdd])];
  }
  
  // Remove tags
  if (tagsToRemove.length > 0) {
    currentTags = currentTags.filter((tag: string) => !tagsToRemove.includes(tag));
  }

  await supabase
    .from('contacts')
    .update({ tags: currentTags })
    .eq('id', contactId)
    .eq('trainer_id', trainerId);

  return { success: true, tags: currentTags };
}

async function getTrainerStats(supabase: any, trainerId: string) {
  const { data: contacts, count: totalClients } = await supabase
    .from('contacts')
    .select('*, insights(risk_score)', { count: 'exact' })
    .eq('trainer_id', trainerId);

  const atRiskCount = contacts?.filter((c: any) => c.insights?.[0]?.risk_score >= 75).length || 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { count: sessionsThisMonth } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('trainer_id', trainerId)
    .eq('status', 'completed')
    .gte('scheduled_at', thirtyDaysAgo.toISOString());

  const { data: profile } = await supabase
    .from('trainer_profiles')
    .select('*')
    .eq('id', trainerId)
    .single();

  return {
    total_clients: totalClients || 0,
    at_risk_clients: atRiskCount,
    sessions_this_month: sessionsThisMonth || 0,
    messages_approved: profile?.total_messages_approved || 0,
    current_streak: profile?.current_streak || 0,
    level: profile?.level || 1,
    xp: profile?.xp || 0
  };
}

async function createDraftMessage(supabase: any, trainerId: string, contactId: string, contactName: string, messageContext: string, channel: string = 'sms') {
  console.log(`Creating draft message for ${contactName} (${contactId})`);
  
  // Get client details and insights for context
  const { data: contact } = await supabase
    .from('contacts')
    .select('*, insights(*)')
    .eq('id', contactId)
    .eq('trainer_id', trainerId)
    .single();

  if (!contact) {
    return { error: "Client not found or access denied" };
  }

  const insight = contact.insights?.[0];
  
  // Build context for AI message generation
  const contextPrompt = `Generate a ${channel === 'email' ? 'detailed' : 'concise'} ${channel} message for a fitness client.

Client: ${contactName}
Context: ${messageContext}
Metrics:
- Risk score: ${insight?.risk_score || 'unknown'}
- Engagement: ${insight?.engagement_score ? Math.round(insight.engagement_score * 100) + '%' : 'unknown'}
- Missed sessions: ${insight?.missed_sessions || 0}
- Current streak: ${insight?.current_streak || 0} weeks
- Last activity: ${insight?.last_activity_at || 'unknown'}

Requirements:
${channel === 'sms' ? '- Keep it under 160 characters if possible, max 2-3 sentences' : '- 2-4 paragraphs, warm and detailed'}
- Be empathetic and supportive
- Reference their specific situation
- Offer concrete next steps or encouragement
- Use a friendly, personal tone
- Do not use emojis
- Sign it naturally (no formal signature needed for SMS)

Generate only the message content, no subject line or formatting.`;

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    return { error: "AI service not configured" };
  }

  // Generate message content using AI
  const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'You are a supportive fitness trainer crafting personalized messages to clients.' },
        { role: 'user', content: contextPrompt }
      ]
    })
  });

  if (!aiResponse.ok) {
    console.error('AI generation failed:', await aiResponse.text());
    return { error: "Failed to generate message content" };
  }

  const aiData = await aiResponse.json();
  const messageContent = aiData.choices[0].message.content.trim();

  // Create draft message in database
  const { data: draft, error: insertError } = await supabase
    .from('messages')
    .insert({
      trainer_id: trainerId,
      contact_id: contactId,
      content: messageContent,
      status: 'draft', // CRITICAL: Always draft, requires approval
      channel: channel,
      confidence: 0.85,
      reasoning: messageContext,
      created_by: 'ai_agent'
    })
    .select()
    .single();

  if (insertError) {
    console.error('Draft creation error:', insertError);
    return { error: "Failed to save draft message" };
  }

  console.log(`Draft created successfully: ${draft.id}`);
  
  return {
    success: true,
    draft_id: draft.id,
    message_preview: messageContent.substring(0, 100) + (messageContent.length > 100 ? '...' : ''),
    channel: channel,
    status: 'draft',
    note: 'Draft created and ready for review in your Queue/Inbox'
  };
}

async function executeTool(supabase: any, trainerId: string, toolName: string, args: any) {
  console.log(`Executing tool: ${toolName}`, args);
  
  switch (toolName) {
    case 'get_client_info':
      return await getClientInfo(supabase, trainerId, args.client_name);
    case 'list_clients':
      return await listClients(supabase, trainerId, args.filter);
    case 'suggest_tags':
      return await suggestTags(supabase, trainerId);
    case 'apply_tags':
      return await applyTags(supabase, trainerId, args.contact_id, args.tags_to_add, args.tags_to_remove);
    case 'get_trainer_stats':
      return await getTrainerStats(supabase, trainerId);
    case 'create_draft_message':
      return await createDraftMessage(supabase, trainerId, args.contact_id, args.contact_name, args.message_context, args.channel);
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { message } = await req.json();

    // Get conversation history
    const { data: history } = await supabase
      .from('conversation_history')
      .select('*')
      .eq('trainer_id', user.id)
      .order('created_at', { ascending: true })
      .limit(20);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map((h: any) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    // Save user message
    await supabase
      .from('conversation_history')
      .insert({
        trainer_id: user.id,
        role: 'user',
        content: message
      });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Call AI with tools
    let response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        tools,
        tool_choice: 'auto'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI API error:', error);
      throw new Error('AI API request failed');
    }

    let result = await response.json();
    let assistantMessage = result.choices[0].message;
    let toolCalls = assistantMessage.tool_calls || [];

    // Execute tools if requested
    while (toolCalls.length > 0) {
      console.log(`Processing ${toolCalls.length} tool calls`);
      
      const toolMessages = [];
      for (const toolCall of toolCalls) {
        const toolResult = await executeTool(
          supabase,
          user.id,
          toolCall.function.name,
          JSON.parse(toolCall.function.arguments)
        );
        
        toolMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult)
        });
      }

      // Call AI again with tool results
      messages.push(assistantMessage);
      messages.push(...toolMessages);

      response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages,
          tools,
          tool_choice: 'auto'
        })
      });

      result = await response.json();
      assistantMessage = result.choices[0].message;
      toolCalls = assistantMessage.tool_calls || [];
    }

    // Save assistant message
    await supabase
      .from('conversation_history')
      .insert({
        trainer_id: user.id,
        role: 'assistant',
        content: assistantMessage.content
      });

    return new Response(JSON.stringify({ 
      message: assistantMessage.content 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
