import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { queryClient } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import { invokeWithTimeout, TimeoutError } from "@/lib/api/supabase-with-timeout";
import { toast } from "sonner";

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
  clearHistory: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  loadHistory: () => Promise<void>;
}

const AGENT_TIMEOUT = 45000; // 45 seconds for AI responses

export const useAgentStore = create<AgentState>((set, get) => ({
  input: "",
  messages: [],
  loading: false,
  historyExpanded: false,
  setInput: (text) => set({ input: text }),
  toggleHistory: () => set((state) => ({ historyExpanded: !state.historyExpanded })),
  clear: () => set({ input: "", messages: [] }),
  
  clearHistory: async () => {
    try {
      const { error } = await supabase
        .from('conversation_history')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) throw error;
      
      set({ messages: [], input: "" });
    } catch (error) {
      console.error('Failed to clear history:', error);
      throw error;
    }
  },
  
  loadHistory: async () => {
    try {
      // Load last 50 messages in ascending order (oldest first)
      const { data, error } = await supabase
        .from('conversation_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        // Reverse to show oldest first in UI
        const msgs: AgentMessage[] = data.reverse().map((d) => ({
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
      const { data, error } = await invokeWithTimeout("ai-agent", {
        body: { message: trimmed },
        timeout: AGENT_TIMEOUT,
      });

      if (error) {
        if (error instanceof TimeoutError) {
          toast.error('Request timed out. Please try again.');
        }
        throw error;
      }

      if (data?.message) {
        const assistantMsg: AgentMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        };
        set((state) => ({ messages: [...state.messages, assistantMsg] }));

        // Invalidate queries after AI actions
        queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on error
      set((state) => ({ 
        messages: state.messages.filter(m => m.id !== userMsg.id) 
      }));
      
      if (!(error instanceof TimeoutError)) {
        toast.error('Failed to send message. Please try again.');
      }
    } finally {
      set({ loading: false, input: "" });
    }
  }
}));


