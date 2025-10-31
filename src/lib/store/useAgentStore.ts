import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

interface AgentResultCard {
  id: string;
  kind: "draft" | "metric" | "list";
  payload: unknown;
}

interface AgentState {
  input: string;
  results: AgentResultCard[];
  loading: boolean;
  setInput: (text: string) => void;
  clear: () => void;
  runNL: () => Promise<void>;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  input: "",
  results: [],
  loading: false,
  setInput: (text) => set({ input: text }),
  clear: () => set({ input: "", results: [] }),
  runNL: async () => {
    const text = get().input.trim();
    if (!text) return;
    set({ loading: true });
    const { data, error } = await supabase.functions.invoke("agent-drafting", {
      body: { action: "nlToDrafts", text },
    });
    if (!error) {
      const cards: AgentResultCard[] = (data?.drafts || []).map((d: unknown, idx: number) => ({
        id: `draft-${Date.now()}-${idx}`,
        kind: "draft",
        payload: d,
      }));
      set({ results: cards });
    }
    set({ loading: false });
  },
}));


