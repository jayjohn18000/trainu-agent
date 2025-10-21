import { supabase } from "@/integrations/supabase/client";
import type { QueueItem, FeedItem } from "@/types/agent";

const AGENT_MOCK = import.meta.env.VITE_AGENT_MOCK === "1";

export async function getAgentStatus() {
  if (AGENT_MOCK) {
    // Use local fixtures in mock mode
    return {
      state: "active" as const,
      currentAction: "Monitoring 12 clients",
      lastUpdate: new Date(Date.now() - 5 * 60 * 1000),
    };
  }

  const { data, error } = await supabase.functions.invoke("agent-status");
  if (error) throw error;
  return {
    ...data,
    lastUpdate: new Date(data.lastUpdate),
  };
}

export async function getQueue(): Promise<QueueItem[]> {
  if (AGENT_MOCK) {
    // Use local fixtures in mock mode
    const { fixtures } = await import("@/lib/fixtures");
    return fixtures.queue;
  }

  const { data, error } = await supabase.functions.invoke("agent-queue");
  if (error) throw error;
  return data || [];
}

export async function getFeed(): Promise<FeedItem[]> {
  if (AGENT_MOCK) {
    // Use local fixtures in mock mode
    const { fixtures } = await import("@/lib/fixtures");
    return fixtures.feed;
  }

  const { data, error } = await supabase.functions.invoke("agent-feed");
  if (error) throw error;
  return data || [];
}

export async function approveQueueItem(id: string) {
  const { data, error } = await supabase.functions.invoke("agent-queue", {
    body: { action: "approve", id },
  });
  if (error) throw error;
  return data;
}

export async function undoQueueItem(id: string) {
  const { data, error } = await supabase.functions.invoke("agent-queue", {
    body: { action: "undo", id },
  });
  if (error) throw error;
  return data;
}

export async function editQueueItem(id: string, payload: any) {
  const { data, error } = await supabase.functions.invoke("agent-queue", {
    body: { action: "edit", id, payload },
  });
  if (error) throw error;
  return data;
}

export async function nudgeClient(clientId: string) {
  const { data, error } = await supabase.functions.invoke("client-nudge", {
    body: { clientId },
  });
  if (error) throw error;
  return data;
}
