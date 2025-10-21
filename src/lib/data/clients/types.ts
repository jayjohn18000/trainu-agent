export type Client = {
  id: string;
  name: string;
  avatarUrl?: string;
  phone?: string;
  email?: string;
  tags: string[];
  status: "active" | "paused" | "churnRisk";
  risk: number; // 0–100
  lastActivity: string; // ISO
  nextSession?: string; // ISO
  program?: string;
  notes?: string;
};

export type ClientDetail = Client & {
  metrics: {
    streakDays: number;
    workouts7d: number;
    responseRate30d: number;
  };
  goals?: string[];
  messages: {
    id: string;
    time: string;
    direction: "in" | "out";
    preview: string;
  }[];
  sessions: {
    id: string;
    time: string;
    type: string;
    status: "upcoming" | "done" | "missed";
  }[];
};

export interface ClientListParams {
  q?: string;
  tags?: string[];
  status?: string;
  riskMin?: number;
  riskMax?: number;
  hasNext?: boolean;
  sort?: "name" | "risk" | "lastActivity";
  dir?: "asc" | "desc";
  offset?: number;
  limit?: number;
}

export interface ClientDataProvider {
  list(params: ClientListParams): Promise<{ items: Client[]; total: number }>;
  get(id: string): Promise<ClientDetail>;
  nudge(
    id: string,
    body: { templateId: string; preview: string }
  ): Promise<{ ok: boolean }>;
  tag(id: string, tags: string[]): Promise<{ ok: boolean }>;
  note(id: string, note: string): Promise<{ ok: boolean; noteId: string }>;
}
