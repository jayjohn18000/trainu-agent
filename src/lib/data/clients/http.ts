import { supabase } from "@/integrations/supabase/client";
import { Client, ClientDetail, ClientDataProvider, ClientListParams } from "./types";
import { APIError } from "@/lib/errors";

export class HttpClientProvider implements ClientDataProvider {
  async list(params: ClientListParams): Promise<{ items: Client[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.set("q", params.q);
    if (params.tags && params.tags.length > 0) queryParams.set("tags", params.tags.join(","));
    if (params.status) queryParams.set("status", params.status);
    if (params.riskMin !== undefined && params.riskMin !== null) queryParams.set("riskMin", String(params.riskMin));
    if (params.riskMax !== undefined && params.riskMax !== null) queryParams.set("riskMax", String(params.riskMax));
    if (params.hasNext !== undefined && params.hasNext !== null) queryParams.set("hasNext", String(params.hasNext));
    if (params.sort) queryParams.set("sort", params.sort);
    if (params.dir) queryParams.set("dir", params.dir);
    if (params.offset !== undefined && params.offset !== null) queryParams.set("offset", String(params.offset));
    if (params.limit !== undefined && params.limit !== null) queryParams.set("limit", String(params.limit));

    const { data, error } = await supabase.functions.invoke("clients-list", {
      body: { params: Object.fromEntries(queryParams) },
    });

    if (error) {
      throw new APIError(
        error.message || "Failed to fetch clients",
        error.status || 500,
        error.code || "CLIENTS_LIST_ERROR"
      );
    }

    if (!data || typeof data !== "object" || !("items" in data) || !("total" in data)) {
      throw new APIError("Invalid response format from clients-list", 500, "INVALID_RESPONSE");
    }

    return data as { items: Client[]; total: number };
  }

  async get(id: string): Promise<ClientDetail> {
    if (!id || typeof id !== "string") {
      throw new APIError("Client ID is required", 400, "INVALID_ID");
    }

    const { data, error } = await supabase.functions.invoke(`clients-get`, {
      body: { id },
    });

    if (error) {
      throw new APIError(
        error.message || "Failed to fetch client",
        error.status || 500,
        error.code || "CLIENT_GET_ERROR"
      );
    }

    if (!data) {
      throw new APIError("Client not found", 404, "CLIENT_NOT_FOUND");
    }

    return data as ClientDetail;
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

    const { data, error } = await supabase.functions.invoke("clients-tag", {
      body: { id, tags },
    });

    if (error) {
      throw new APIError(
        error.message || "Failed to update tags",
        error.status || 500,
        error.code || "TAG_ERROR"
      );
    }

    return data as { ok: boolean };
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
