import { supabase } from "@/integrations/supabase/client";

export interface Note {
  id: string;
  trainer_id: string;
  contact_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export async function createNote(clientId: string, content: string): Promise<Note> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (content.length > 500) {
    throw new Error('Note content cannot exceed 500 characters');
  }

  const { data, error } = await supabase
    .from('client_notes')
    .insert({
      trainer_id: user.id,
      contact_id: clientId,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listNotes(clientId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('client_notes')
    .select('*')
    .eq('contact_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function deleteNote(noteId: string): Promise<void> {
  const { error } = await supabase
    .from('client_notes')
    .delete()
    .eq('id', noteId);

  if (error) throw error;
}

