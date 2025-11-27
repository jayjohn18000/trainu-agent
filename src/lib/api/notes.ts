import { supabase } from "@/integrations/supabase/client";

export type NoteType = 'goal' | 'milestone' | 'quick_note';

export interface Note {
  id: string;
  trainer_id: string;
  contact_id: string;
  content: string;
  note_type: NoteType;
  created_at: string;
  updated_at: string;
}

export async function createNote(
  clientId: string, 
  content: string, 
  noteType: NoteType = 'quick_note'
): Promise<Note> {
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
      note_type: noteType,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Note;
}

export async function listNotes(clientId: string): Promise<Note[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('client_notes')
    .select('*')
    .eq('contact_id', clientId)
    .eq('trainer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Note[];
}

export async function updateNote(noteId: string, content: string): Promise<Note> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (content.length > 500) {
    throw new Error('Note content cannot exceed 500 characters');
  }

  const { data, error } = await supabase
    .from('client_notes')
    .update({ content: content.trim() })
    .eq('id', noteId)
    .eq('trainer_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data as Note;
}

export async function deleteNote(noteId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('client_notes')
    .delete()
    .eq('id', noteId)
    .eq('trainer_id', user.id);

  if (error) throw error;
}
