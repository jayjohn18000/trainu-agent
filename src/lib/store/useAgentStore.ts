import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AgentState {
  input: string;
  messages: AgentMessage[];
  loading: boolean;
  historyExpanded: boolean;
  setInput: (text: string) => void;
  toggleHistory: () => void;
  clear: () => void;
  sendMessage: (text: string) => Promise<void>;
  loadHistory: () => Promise<void>;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  input: "",
  messages: [],
  loading: false,
  historyExpanded: false,
  setInput: (text) => set({ input: text }),
  toggleHistory: () => set((state) => ({ historyExpanded: !state.historyExpanded })),
  clear: () => set({ input: "", messages: [] }),
  
  loadHistory: async () => {
    try {
      const { data, error } = await supabase
        .from('conversation_history')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(20);

      if (error) throw error;

      if (data) {
        const msgs: AgentMessage[] = data.map((d) => ({
          id: d.id,
          role: d.role as 'user' | 'assistant',
          content: d.content,
          timestamp: new Date(d.created_at)
        }));
        set({ messages: msgs });
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  },

  sendMessage: async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    set({ loading: true });

    // Optimistically add user message
    const userMsg: AgentMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date()
    };
    set((state) => ({ messages: [...state.messages, userMsg] }));

    try {
      const { data, error } = await supabase.functions.invoke("ai-agent", {
        body: { message: trimmed }
      });

      if (error) throw error;

      if (data?.message) {
        const assistantMsg: AgentMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        };
        set((state) => ({ messages: [...state.messages, assistantMsg] }));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on error
      set((state) => ({ 
        messages: state.messages.filter(m => m.id !== userMsg.id) 
      }));
    } finally {
      set({ loading: false, input: "" });
    }
  }
}));


