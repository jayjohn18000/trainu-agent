import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

export type DraftStatus = "pending" | "approved" | "scheduled" | "sent" | "dismissed" | "failed";

export interface DraftItem {
  id: string;
  trainer_id: string;
  client_id?: string | null;
  channel?: "sms" | "email" | "both";
  body: string;
  status: DraftStatus;
  scheduled_at?: string | null;
  sent_at?: string | null;
  failed_reason?: string | null;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

interface DraftsState {
  items: DraftItem[];
  loading: boolean;
  selectedIds: Set<string>;
  fetch: () => Promise<void>;
  approveOne: (id: string) => Promise<void>;
  approveMany: (ids: string[]) => Promise<void>;
  addFromQuickAction: (partial: Pick<DraftItem, "client_id" | "body" | "channel">) => Promise<void>;
  toggleSelected: (id: string) => void;
  clearSelected: () => void;
}

export const useDraftsStore = create<DraftsState>((set, get) => ({
  items: [],
  loading: false,
  selectedIds: new Set<string>(),

  fetch: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("messages")
      .select("id, trainer_id, contact_id, channel, content, status, scheduled_for, created_at, updated_at")
      .in("status", ["draft", "queued"])
      .order("created_at", { ascending: false });
    if (!error) {
      const mapped = (data || []).map(m => ({
        id: m.id,
        trainer_id: m.trainer_id,
        client_id: m.contact_id,
        channel: m.channel as "sms" | "email" | "both",
        body: m.content,
        status: (m.status === "draft" ? "pending" : m.status === "queued" ? "scheduled" : "pending") as DraftStatus,
        scheduled_at: m.scheduled_for,
        created_at: m.created_at,
        updated_at: m.updated_at,
      }));
      set({ items: mapped });
    }
    set({ loading: false });
  },

  approveOne: async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke("queue-management", {
        body: { action: "approveDraft", draftId: id },
      });
      if (error) throw error;
      await get().fetch();
    } catch (e) {
      console.error('Failed to approve draft:', e);
      throw e;
    }
  },

  approveMany: async (ids: string[]) => {
    try {
      const { error } = await supabase.functions.invoke("queue-management", {
        body: { action: "bulkApprove", draftIds: ids },
      });
      if (error) throw error;
      await get().fetch();
    } catch (e) {
      console.error('Failed to bulk approve:', e);
      throw e;
    }
  },

  addFromQuickAction: async (partial) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase.from("messages").insert({
        trainer_id: user.id,
        contact_id: partial.client_id ?? null,
        channel: partial.channel,
        content: partial.body,
        status: "draft",
      });
      if (error) throw error;
      await get().fetch();
    } catch (e) {
      console.error('Failed to add draft from quick action:', e);
      throw e;
    }
  },

  toggleSelected: (id) => {
    const current = new Set(get().selectedIds);
    if (current.has(id)) current.delete(id); else current.add(id);
    set({ selectedIds: current });
  },

  clearSelected: () => set({ selectedIds: new Set() }),
}));


