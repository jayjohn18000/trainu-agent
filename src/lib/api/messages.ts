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


