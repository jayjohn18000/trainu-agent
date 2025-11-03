import { supabase } from "@/integrations/supabase/client";

export interface Message {
  id: string;
  trainer_id: string;
  contact_id: string;
  status: "draft" | "queued" | "sent" | "delivered" | "read" | "failed";
  content: string;
  channel: "sms" | "email" | "both";
  confidence: number | null;
  why_reasons: string[] | null;
  scheduled_for: string | null;
  created_at: string;
}

export interface Conversation {
  contact_id: string;
  contact_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export async function listConversations(): Promise<Conversation[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get all messages with contact info
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('id, contact_id, content, created_at, status')
    .eq('trainer_id', user.id)
    .in('status', ['sent', 'delivered', 'read'])
    .order('created_at', { ascending: false });

  if (messagesError) throw messagesError;

  // Get contact details
  const contactIds = [...new Set(messages?.map(m => m.contact_id) || [])];
  const { data: contacts, error: contactsError } = await supabase
    .from('contacts')
    .select('id, first_name, last_name')
    .in('id', contactIds);

  if (contactsError) throw contactsError;

  // Group messages by contact and get latest
  const conversationsMap = new Map<string, Conversation>();
  
  messages?.forEach(msg => {
    const contact = contacts?.find(c => c.id === msg.contact_id);
    if (!contact) return;

    const existing = conversationsMap.get(msg.contact_id);
    if (!existing) {
      conversationsMap.set(msg.contact_id, {
        contact_id: msg.contact_id,
        contact_name: `${contact.first_name} ${contact.last_name || ''}`.trim(),
        last_message: msg.content,
        last_message_time: msg.created_at,
        unread_count: 0,
      });
    }
  });

  return Array.from(conversationsMap.values());
}

export async function listMessagesForContact(contactId: string): Promise<Message[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('trainer_id', user.id)
    .eq('contact_id', contactId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function sendMessage(contactId: string, content: string): Promise<{ id: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .insert({
      trainer_id: user.id,
      contact_id: contactId,
      content,
      channel: 'sms',
      status: 'sent',
    })
    .select('id')
    .single();

  if (error) throw error;
  return data;
}

export async function listDraftsAndQueued(limit = 20): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, trainer_id, contact_id, status, content, channel, confidence, why_reasons, scheduled_for, created_at, updated_at")
    .in("status", ["draft", "queued"])
    .order("updated_at", { ascending: false })
    .order("confidence", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function approveMessage(messageId: string) {
  const { data, error } = await supabase.functions.invoke("queue-management", {
    body: { action: "approve", messageId },
  });
  if (error) throw error;
  return data as { queued: boolean; scheduled_for?: string; deferred_by_quiet_hours?: boolean };
}

export async function sendNow(messageId: string) {
  const { data, error } = await supabase.functions.invoke("send-message", {
    body: { messageId },
  });
  if (error) throw error;
  return data as { sent?: boolean; deferred?: boolean; scheduled_for?: string };
}

export async function createDraftMessage(
  contactId: string,
  content: string,
  channel: 'sms' | 'email' | 'both' = 'sms'
): Promise<{ id: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .insert({
      trainer_id: user.id,
      contact_id: contactId,
      content,
      channel,
      status: 'draft',
    })
    .select('id')
    .single();

  if (error) throw error;
  return data;
}


