import { supabase } from "@/integrations/supabase/client";

export interface Event {
  id: string;
  trainer_id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Insight {
  id: string;
  trainer_id: string;
  contact_id: string;
  risk_score: number;
  last_activity_at: string;
  total_sessions: number;
  missed_sessions: number;
  response_rate: number;
  current_streak: number;
  engagement_score: number;
  updated_at: string;
}

export async function createEvent(data: {
  trainer_id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  metadata?: Record<string, unknown>;
}): Promise<{ id: string }> {
  const { data: result, error } = await supabase
    .from('events')
    .insert(data)
    .select('id')
    .single();

  if (error) throw error;
  return result;
}

export async function createOrUpdateInsight(data: {
  trainer_id: string;
  contact_id: string;
  risk_score?: number;
  last_activity_at?: string;
}): Promise<{ id: string }> {
  // Check if insight exists
  const { data: existing } = await supabase
    .from('insights')
    .select('id')
    .eq('trainer_id', data.trainer_id)
    .eq('contact_id', data.contact_id)
    .single();

  if (existing) {
    // Update existing
    const { data: result, error } = await supabase
      .from('insights')
      .update({
        risk_score: data.risk_score,
        last_activity_at: data.last_activity_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select('id')
      .single();

    if (error) throw error;
    return result;
  } else {
    // Create new
    const { data: result, error } = await supabase
      .from('insights')
      .insert({
        trainer_id: data.trainer_id,
        contact_id: data.contact_id,
        risk_score: data.risk_score || 50,
        last_activity_at: data.last_activity_at || new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) throw error;
    return result;
  }
}

export interface InsightWithDraft {
  id: string;
  contact_id: string;
  contact_name: string;
  event_type: string;
  risk_score: number;
  updated_at: string;
  draft_id?: string | null;
}

export async function getRecentInsightsWithDrafts(limit = 5): Promise<InsightWithDraft[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Fetch recent insights (last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: insights, error: insightsError } = await supabase
    .from('insights')
    .select('*')
    .eq('trainer_id', user.id)
    .gte('updated_at', oneDayAgo)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (insightsError) throw insightsError;
  if (!insights || insights.length === 0) return [];

  // Fetch contacts for these insights
  const contactIds = [...new Set(insights.map(i => i.contact_id))];
  const { data: contacts, error: contactsError } = await supabase
    .from('contacts')
    .select('id, first_name, last_name')
    .in('id', contactIds);

  if (contactsError) throw contactsError;

  // Fetch recent events for these contacts to get event_type
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('entity_id, event_type')
    .eq('trainer_id', user.id)
    .eq('entity_type', 'contact')
    .in('entity_id', contactIds)
    .order('created_at', { ascending: false });

  if (eventsError) throw eventsError;

  // Fetch draft messages for these contacts
  const { data: drafts, error: draftsError } = await supabase
    .from('messages')
    .select('id, contact_id')
    .eq('trainer_id', user.id)
    .eq('status', 'draft')
    .in('contact_id', contactIds)
    .order('created_at', { ascending: false });

  if (draftsError) throw draftsError;

  // Join data in JavaScript
  const contactMap = new Map(contacts?.map(c => [c.id, c]) || []);
  const eventMap = new Map<string, string>();
  events?.forEach(e => {
    if (e.entity_id && !eventMap.has(e.entity_id)) {
      eventMap.set(e.entity_id, e.event_type);
    }
  });
  const draftMap = new Map<string, string>();
  drafts?.forEach(d => {
    if (d.contact_id && !draftMap.has(d.contact_id)) {
      draftMap.set(d.contact_id, d.id);
    }
  });

  return insights.map(insight => {
    const contact = contactMap.get(insight.contact_id);
    const contactName = contact 
      ? `${contact.first_name} ${contact.last_name || ''}`.trim()
      : 'Unknown Client';
    const eventType = eventMap.get(insight.contact_id) || 'action';
    const draftId = draftMap.get(insight.contact_id) || null;

    return {
      id: insight.id,
      contact_id: insight.contact_id,
      contact_name: contactName,
      event_type: eventType,
      risk_score: insight.risk_score,
      updated_at: insight.updated_at,
      draft_id: draftId,
    };
  });
}

