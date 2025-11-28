import { supabase } from "@/integrations/supabase/client";
import { Client, ClientDetail, ClientDataProvider, ClientListParams } from "./types";
import { APIError } from "@/lib/errors";
import { toTitleCase } from "@/lib/utils";

export class HttpClientProvider implements ClientDataProvider {
  async list(params: ClientListParams): Promise<{ items: Client[]; total: number }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new APIError("Not authenticated", 401, "UNAUTHORIZED");

    let query = supabase
      .from('contacts')
      .select('id, first_name, last_name, email, phone, tags', { count: 'exact' })
      .eq('trainer_id', user.id);

    // Search filter
    if (params.q) {
      const searchTerm = `%${params.q}%`;
      query = query.or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`);
    }

    // Tags filter
    if (params.tags && params.tags.length > 0) {
      query = query.overlaps('tags', params.tags);
    }

    // Sort
    const sortField = params.sort === 'name' ? 'first_name' : 'last_name';
    const sortDir = params.dir || 'asc';
    query = query.order(sortField, { ascending: sortDir === 'asc' });

    // Pagination
    const offset = params.offset || 0;
    const limit = params.limit || 50;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new APIError(error.message || "Failed to fetch clients", 500, "CLIENTS_LIST_ERROR");
    }

    // Map contacts to Client format
    const items: Client[] = (data || []).map(contact => ({
      id: contact.id,
      name: toTitleCase(`${contact.first_name || ''} ${contact.last_name || ''}`).trim(),
      email: contact.email || undefined,
      phone: contact.phone || undefined,
      tags: contact.tags || [],
      status: 'active' as const,
      risk: 0,
      lastActivity: new Date().toISOString(),
    }));

    return { items, total: count || 0 };
  }

  async get(id: string): Promise<ClientDetail> {
    if (!id || typeof id !== "string") {
      throw new APIError("Client ID is required", 400, "INVALID_ID");
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new APIError("Not authenticated", 401, "UNAUTHORIZED");

    const { data: contact, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .eq('trainer_id', user.id)
      .maybeSingle();

    if (error) {
      throw new APIError(error.message || "Failed to fetch client", 500, "CLIENT_GET_ERROR");
    }

    if (!contact) {
      throw new APIError("Client not found", 404, "CLIENT_NOT_FOUND");
    }

    // Map contact to ClientDetail format
    const clientDetail: ClientDetail = {
      id: contact.id,
      name: toTitleCase(`${contact.first_name || ''} ${contact.last_name || ''}`).trim(),
      email: contact.email || undefined,
      phone: contact.phone || undefined,
      tags: contact.tags || [],
      status: 'active',
      risk: 0,
      lastActivity: contact.updated_at,
      metrics: { streakDays: 0, workouts7d: 0, responseRate30d: 0 },
      goals: [],
      messages: [],
      sessions: [],
    };

    return clientDetail;
  }

  async nudge(
    id: string,
    body: { templateId: string; preview: string }
  ): Promise<{ ok: boolean }> {
    if (!id || typeof id !== "string") {
      throw new APIError("Client ID is required", 400, "INVALID_ID");
    }
    if (!body.templateId || !body.preview) {
      throw new APIError("Template ID and preview are required", 400, "INVALID_PARAMS");
    }

    const { data, error } = await supabase.functions.invoke("clients-nudge", {
      body: { id, ...body },
    });

    if (error) {
      throw new APIError(
        error.message || "Failed to send nudge",
        error.status || 500,
        error.code || "NUDGE_ERROR"
      );
    }

    return data as { ok: boolean };
  }

  async tag(id: string, tags: string[]): Promise<{ ok: boolean }> {
    if (!id || typeof id !== "string") {
      throw new APIError("Client ID is required", 400, "INVALID_ID");
    }
    if (!Array.isArray(tags)) {
      throw new APIError("Tags must be an array", 400, "INVALID_TAGS");
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new APIError("Not authenticated", 401, "UNAUTHORIZED");

    const { error } = await supabase
      .from('contacts')
      .update({ tags })
      .eq('id', id)
      .eq('trainer_id', user.id);

    if (error) {
      throw new APIError(error.message || "Failed to update tags", 500, "TAG_ERROR");
    }

    return { ok: true };
  }

  async note(id: string, note: string): Promise<{ ok: boolean; noteId: string }> {
    if (!id || typeof id !== "string") {
      throw new APIError("Client ID is required", 400, "INVALID_ID");
    }
    if (!note || typeof note !== "string" || note.trim().length === 0) {
      throw new APIError("Note is required", 400, "INVALID_NOTE");
    }

    const { data, error } = await supabase.functions.invoke("clients-note", {
      body: { id, note },
    });

    if (error) {
      throw new APIError(
        error.message || "Failed to save note",
        error.status || 500,
        error.code || "NOTE_ERROR"
      );
    }

    if (!data || typeof data !== "object" || !("noteId" in data)) {
      throw new APIError("Invalid response format from clients-note", 500, "INVALID_RESPONSE");
    }

    return data as { ok: boolean; noteId: string };
  }
}
