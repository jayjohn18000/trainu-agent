import { supabase } from "@/integrations/supabase/client";
import { Client, ClientDetail, ClientDataProvider, ClientListParams } from "./types";

export class HttpClientProvider implements ClientDataProvider {
  async list(params: ClientListParams): Promise<{ items: Client[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.set("q", params.q);
    if (params.tags) queryParams.set("tags", params.tags.join(","));
    if (params.status) queryParams.set("status", params.status);
    if (params.riskMin !== undefined) queryParams.set("riskMin", String(params.riskMin));
    if (params.riskMax !== undefined) queryParams.set("riskMax", String(params.riskMax));
    if (params.hasNext !== undefined) queryParams.set("hasNext", String(params.hasNext));
    if (params.sort) queryParams.set("sort", params.sort);
    if (params.dir) queryParams.set("dir", params.dir);
    if (params.offset !== undefined) queryParams.set("offset", String(params.offset));
    if (params.limit !== undefined) queryParams.set("limit", String(params.limit));

    const { data, error } = await supabase.functions.invoke("clients-list", {
      body: { params: Object.fromEntries(queryParams) },
    });

    if (error) throw error;
    return data as { items: Client[]; total: number };
  }

  async get(id: string): Promise<ClientDetail> {
    const { data, error } = await supabase.functions.invoke(`clients-get`, {
      body: { id },
    });

    if (error) throw error;
    return data as ClientDetail;
  }

  async nudge(
    id: string,
    body: { templateId: string; preview: string }
  ): Promise<{ ok: boolean }> {
    const { data, error } = await supabase.functions.invoke("clients-nudge", {
      body: { id, ...body },
    });

    if (error) throw error;
    return data as { ok: boolean };
  }

  async tag(id: string, tags: string[]): Promise<{ ok: boolean }> {
    const { data, error } = await supabase.functions.invoke("clients-tag", {
      body: { id, tags },
    });

    if (error) throw error;
    return data as { ok: boolean };
  }

  async note(id: string, note: string): Promise<{ ok: boolean; noteId: string }> {
    const { data, error } = await supabase.functions.invoke("clients-note", {
      body: { id, note },
    });

    if (error) throw error;
    return data as { ok: boolean; noteId: string };
  }
}
