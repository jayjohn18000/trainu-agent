import { supabase } from "@/integrations/supabase/client";
import type { FeedItem } from "@/types/agent";

const AGENT_MOCK = import.meta.env.VITE_AGENT_MOCK === "1";

export async function getAgentStatus() {
  if (AGENT_MOCK) {
    return {
      state: "active" as const,
      currentAction: "Monitoring 12 clients",
      lastUpdate: new Date(Date.now() - 5 * 60 * 1000),
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke("agent-status");
    if (error) throw error;
    return {
      ...data,
      lastUpdate: new Date(data.lastUpdate),
    };
  } catch (error) {
    console.error("Failed to fetch agent status:", error);
    throw new Error("Unable to fetch agent status. Please try again.");
  }
}

export async function getFeed(): Promise<FeedItem[]> {
  if (AGENT_MOCK) {
    // Use local fixtures in mock mode
    const { fixtures } = await import("@/lib/fixtures");
    return fixtures.feed;
  }

  try {
    const { data, error } = await supabase.functions.invoke("agent-feed");
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Failed to fetch feed:", error);
    throw new Error("Unable to load activity feed. Please refresh the page.");
  }
}


export async function updateAgentStatus(state: 'active' | 'paused') {
  try {
    const { data, error } = await supabase.functions.invoke("agent-status", {
      body: { state },
      method: 'POST',
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to update status:", error);
    throw new Error("Unable to update agent status. Please try again.");
  }
}

export async function nudgeClient(clientId: string) {
  const { data, error } = await supabase.functions.invoke("client-nudge", {
    body: { clientId },
  });
  if (error) throw error;
  return data;
}
