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
      name: "schedule_session",
      description: "Schedule a new training session for a client",
      parameters: {
        type: "object",
        properties: {
          contact_id: { type: "string", description: "The client's UUID" },
          scheduled_at: { type: "string", description: "ISO timestamp for session start time" },
          session_type: { type: "string", description: "Type of session (e.g., 'Personal Training', 'Check-in', 'Assessment')" },
          notes: { type: "string", description: "Optional session notes" }
        },
        required: ["contact_id", "scheduled_at"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_session",
      description: "Update an existing session (reschedule, change type, add notes, update status)",
      parameters: {
        type: "object",
        properties: {
          booking_id: { type: "string", description: "The session's UUID" },
          scheduled_at: { type: "string", description: "New ISO timestamp (optional)" },
          session_type: { type: "string", description: "New session type (optional)" },
          notes: { type: "string", description: "Updated notes (optional)" },
          status: { type: "string", enum: ["scheduled", "completed", "cancelled", "no_show"], description: "New status (optional)" }
        },
        required: ["booking_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "cancel_session",
      description: "Cancel a scheduled session",
      parameters: {
        type: "object",
        properties: {
          booking_id: { type: "string", description: "The session's UUID" },
          reason: { type: "string", description: "Optional cancellation reason" }
        },
        required: ["booking_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "assign_program",
      description: "Assign a training program to a client",
      parameters: {
        type: "object",
        properties: {
          contact_id: { type: "string", description: "The client's UUID" },
          program_id: { type: "string", description: "The program's UUID" }
        },
        required: ["contact_id", "program_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_programs",
      description: "List all available training programs",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  }
];

const systemPrompt = `You are an AI fitness assistant helping a personal trainer manage their clients.
You have REAL ACCESS to client data, bookings, engagement metrics, and message history through your tools.

🎯 YOUR MISSION: Help trainers save time by automating client management tasks.

📊 AVAILABLE TOOLS (USE THEM!):
- get_client_info: Get detailed info about a specific client
- list_clients: List all clients with filters (all/at-risk/engaged/new)
- suggest_tags: AI-powered tag suggestions based on client behavior
- apply_tags: Add/remove tags for clients
- get_trainer_stats: View trainer's overall performance metrics
- schedule_session: Book new training sessions
- update_session: Reschedule or modify existing sessions
- cancel_session: Cancel sessions with optional reason
- assign_program: Assign workout programs to clients
- list_programs: View available training programs

💡 WHEN TO USE TOOLS:
- When asked "Show me...", "What's...", "Who is..." → Use appropriate tool
- Tag suggestions → Use suggest_tags
- Scheduling requests → Use schedule_session
- Client questions → Use get_client_info or list_clients
- Stats questions → Use get_trainer_stats

⚡ RESPONSE STYLE:
- Be CONCISE (2-3 sentences max unless detailed breakdown needed)
- ALWAYS cite specific metrics from tool results
- Use emojis sparingly for visual clarity
- Focus on actionable insights, not explanations
- When tool fails, suggest alternative approach

🏷️ TAG CRITERIA:
- "at-risk": risk_score >= 75, missed_sessions >= 2, or no activity in 14+ days
- "engaged": response_rate >= 0.8, current_streak >= 3, high engagement
- "vip": Long-term clients, high session count, consistent attendance  
- "new": Created within last 30 days, fewer than 3 total sessions
- "comeback": Had gap in activity, recently returned
- "high-performer": Low risk score, high engagement, strong streak
- "needs-attention": Moderate risk (40-74), declining engagement

📅 SCHEDULING RULES:
- Default to 60-minute sessions if not specified
- Confirm client name and time clearly
- Session types: "Personal Training", "Group Class", "Assessment", "Check-in"

🎓 PROGRAM ASSIGNMENT:
- Consider client's fitness level and goals
- Explain WHY you're recommending the program
- Confirm client name and program name

REMEMBER: You're not just chatting - you have REAL tools to manage their business!`;

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

async function scheduleSession(supabase: any, trainerId: string, contactId: string, scheduledAt: string, sessionType: string = 'Personal Training', notes?: string) {
  // Validate contact belongs to trainer
  const { data: contact } = await supabase
    .from('contacts')
    .select('id, first_name, last_name')
    .eq('id', contactId)
    .eq('trainer_id', trainerId)
    .single();

  if (!contact) return { error: "Client not found or unauthorized" };

  // Insert booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      trainer_id: trainerId,
      contact_id: contactId,
      scheduled_at: scheduledAt,
      session_type: sessionType,
      notes: notes || null,
      status: 'scheduled'
    })
    .select()
    .single();

  if (error) {
    console.error('Schedule session error:', error);
    return { error: `Failed to schedule session: ${error.message}` };
  }

  return {
    success: true,
    booking,
    message: `✅ Scheduled ${sessionType} for ${contact.first_name} ${contact.last_name || ''} at ${new Date(scheduledAt).toLocaleString()}`
  };
}

async function updateSession(supabase: any, trainerId: string, bookingId: string, updates: any) {
  // Validate booking belongs to trainer
  const { data: existing } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .eq('trainer_id', trainerId)
    .single();

  if (!existing) return { error: "Session not found or unauthorized" };

  // Build update object
  const updateData: any = {};
  if (updates.scheduled_at) updateData.scheduled_at = updates.scheduled_at;
  if (updates.session_type) updateData.session_type = updates.session_type;
  if (updates.notes) updateData.notes = updates.notes;
  if (updates.status) updateData.status = updates.status;

  const { data: updated, error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', bookingId)
    .eq('trainer_id', trainerId)
    .select()
    .single();

  if (error) {
    console.error('Update session error:', error);
    return { error: `Failed to update session: ${error.message}` };
  }

  return { success: true, booking: updated, message: `✅ Session updated successfully` };
}

async function cancelSession(supabase: any, trainerId: string, bookingId: string, reason?: string) {
  // Validate booking belongs to trainer
  const { data: existing } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .eq('trainer_id', trainerId)
    .single();

  if (!existing) return { error: "Session not found or unauthorized" };

  const updateData: any = { status: 'cancelled' };
  if (reason) {
    updateData.notes = existing.notes ? `${existing.notes}\n\nCancellation reason: ${reason}` : `Cancellation reason: ${reason}`;
  }

  const { error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', bookingId)
    .eq('trainer_id', trainerId);

  if (error) {
    console.error('Cancel session error:', error);
    return { error: `Failed to cancel session: ${error.message}` };
  }

  return { success: true, message: `❌ Session cancelled` };
}

async function assignProgram(supabase: any, trainerId: string, contactId: string, programId: string) {
  // Validate contact belongs to trainer
  const { data: contact } = await supabase
    .from('contacts')
    .select('id, first_name, last_name')
    .eq('id', contactId)
    .eq('trainer_id', trainerId)
    .single();

  if (!contact) return { error: "Client not found or unauthorized" };

  // Validate program belongs to trainer
  const { data: program } = await supabase
    .from('programs')
    .select('*')
    .eq('id', programId)
    .eq('trainer_id', trainerId)
    .single();

  if (!program) return { error: "Program not found or unauthorized" };

  // Update contact with program
  const { error } = await supabase
    .from('contacts')
    .update({ program_id: programId })
    .eq('id', contactId)
    .eq('trainer_id', trainerId);

  if (error) {
    console.error('Assign program error:', error);
    return { error: `Failed to assign program: ${error.message}` };
  }

  return {
    success: true,
    message: `✅ Assigned "${program.name}" to ${contact.first_name} ${contact.last_name || ''} (${program.duration_weeks} weeks, ${program.total_sessions} sessions)`
  };
}

async function listPrograms(supabase: any, trainerId: string) {
  const { data: programs } = await supabase
    .from('programs')
    .select('*')
    .eq('trainer_id', trainerId)
    .eq('is_active', true)
    .order('name');

  return programs || [];
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
    case 'schedule_session':
      return await scheduleSession(supabase, trainerId, args.contact_id, args.scheduled_at, args.session_type, args.notes);
    case 'update_session':
      return await updateSession(supabase, trainerId, args.booking_id, args);
    case 'cancel_session':
      return await cancelSession(supabase, trainerId, args.booking_id, args.reason);
    case 'assign_program':
      return await assignProgram(supabase, trainerId, args.contact_id, args.program_id);
    case 'list_programs':
      return await listPrograms(supabase, trainerId);
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
