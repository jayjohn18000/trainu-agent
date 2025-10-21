export interface QueueItem {
  id: string;
  clientId: string;
  clientName: string;
  preview: string;
  confidence: number;
  status: "review" | "autosend" | "sent" | "undone";
  why: string[];
  createdAt: string;
}

export interface FeedItem {
  ts: string;
  action: "drafted" | "sent" | "edited" | "undone";
  client: string;
  status: "review" | "success" | "error" | "undone";
  why: string;
}

export interface Client {
  id: string;
  name: string;
  risk: number;
  nextAction: string;
  aiInsight: string;
  lastSeen: string;
  tags: string[];
}

export interface AgentSettings {
  autonomy: "review" | "autosend" | "full";
  tone: "casual" | "professional" | "friendly";
  length: "concise" | "medium" | "detailed";
  emoji: "never" | "rarely" | "often";
  quietStart: string;
  quietEnd: string;
}
