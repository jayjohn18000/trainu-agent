import { supabase } from "@/integrations/supabase/client";

export interface Note {
  id: string;
  trainer_id: string;
  contact_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Mock implementation until client_notes table is created
export async function createNote(clientId: string, content: string): Promise<Note> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (content.length > 500) {
    throw new Error('Note content cannot exceed 500 characters');
  }

  // Return mock note for now
  const mockNote: Note = {
    id: crypto.randomUUID(),
    trainer_id: user.id,
    contact_id: clientId,
    content: content.trim(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return mockNote;
}

export async function listNotes(clientId: string): Promise<Note[]> {
  // Return empty array until table is created
  return [];
}

export async function deleteNote(noteId: string): Promise<void> {
  // No-op until table is created
  return;
}
