import { Client, ClientDetail, ClientDataProvider, ClientListParams } from "./types";

const mockClients: ClientDetail[] = [
  {
    id: "c1",
    name: "Sarah Mitchell",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
    phone: "+1234567890",
    email: "sarah.m@example.com",
    tags: ["vip", "strength"],
    status: "active",
    risk: 15,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    nextSession: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    program: "Advanced Strength",
    notes: "Loves early morning sessions",
    metrics: { streakDays: 14, workouts7d: 5, responseRate30d: 98 },
    goals: ["Deadlift 300lbs", "Compete in powerlifting"],
    messages: [
      { id: "m1", time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), direction: "in", preview: "Thanks for the program update!" },
      { id: "m2", time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), direction: "out", preview: "Updated your squat progression" },
    ],
    sessions: [
      { id: "s1", time: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), type: "Strength", status: "upcoming" },
      { id: "s2", time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), type: "Strength", status: "done" },
    ],
  },
  {
    id: "c2",
    name: "Marcus Johnson",
    avatarUrl: "https://i.pravatar.cc/150?img=2",
    email: "marcus.j@example.com",
    tags: ["cardio", "weight-loss"],
    status: "active",
    risk: 45,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    nextSession: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    program: "Fat Loss Journey",
    notes: "Check in weekly on nutrition",
    metrics: { streakDays: 7, workouts7d: 3, responseRate30d: 75 },
    goals: ["Lose 20lbs", "Run 5K"],
    messages: [
      { id: "m3", time: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), direction: "out", preview: "How's the nutrition plan going?" },
    ],
    sessions: [
      { id: "s3", time: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), type: "Cardio", status: "upcoming" },
    ],
  },
  {
    id: "c3",
    name: "Elena Rodriguez",
    avatarUrl: "https://i.pravatar.cc/150?img=3",
    phone: "+1987654321",
    email: "elena.r@example.com",
    tags: ["mobility", "injury-recovery"],
    status: "active",
    risk: 25,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    nextSession: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    program: "Post-Injury Recovery",
    metrics: { streakDays: 21, workouts7d: 4, responseRate30d: 92 },
    goals: ["Full shoulder mobility", "Return to CrossFit"],
    messages: [],
    sessions: [
      { id: "s4", time: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(), type: "Mobility", status: "upcoming" },
    ],
  },
  {
    id: "c4",
    name: "David Chen",
    avatarUrl: "https://i.pravatar.cc/150?img=4",
    email: "david.c@example.com",
    tags: ["beginner", "strength"],
    status: "churnRisk",
    risk: 78,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    program: "Beginner Strength",
    notes: "Hasn't responded in 2 weeks",
    metrics: { streakDays: 0, workouts7d: 0, responseRate30d: 30 },
    goals: ["Build strength foundation"],
    messages: [
      { id: "m4", time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), direction: "out", preview: "Hey! Haven't heard from you..." },
    ],
    sessions: [
      { id: "s5", time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), type: "Strength", status: "missed" },
    ],
  },
  {
    id: "c5",
    name: "Jessica Taylor",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
    phone: "+1122334455",
    email: "jessica.t@example.com",
    tags: ["vip", "athlete", "nutrition"],
    status: "active",
    risk: 10,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    nextSession: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    program: "Elite Performance",
    metrics: { streakDays: 42, workouts7d: 6, responseRate30d: 100 },
    goals: ["Qualify for nationals", "Maintain 8% body fat"],
    messages: [
      { id: "m5", time: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), direction: "in", preview: "New PR today! 🎉" },
    ],
    sessions: [
      { id: "s6", time: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(), type: "Performance", status: "upcoming" },
    ],
  },
  {
    id: "c6",
    name: "Alex Turner",
    email: "alex.t@example.com",
    tags: ["hiit", "busy-professional"],
    status: "active",
    risk: 38,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    nextSession: new Date(Date.now() + 1000 * 60 * 60 * 120).toISOString(),
    program: "30-Min HIIT",
    metrics: { streakDays: 5, workouts7d: 2, responseRate30d: 68 },
    goals: ["Stay consistent", "Work around travel schedule"],
    messages: [],
    sessions: [
      { id: "s7", time: new Date(Date.now() + 1000 * 60 * 60 * 120).toISOString(), type: "HIIT", status: "upcoming" },
    ],
  },
  {
    id: "c7",
    name: "Priya Patel",
    avatarUrl: "https://i.pravatar.cc/150?img=6",
    email: "priya.p@example.com",
    tags: ["yoga", "wellness"],
    status: "paused",
    risk: 55,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    program: "Mind & Body",
    notes: "On maternity leave",
    metrics: { streakDays: 0, workouts7d: 0, responseRate30d: 45 },
    goals: ["Return after baby"],
    messages: [],
    sessions: [],
  },
  {
    id: "c8",
    name: "Tom Anderson",
    avatarUrl: "https://i.pravatar.cc/150?img=7",
    phone: "+1555666777",
    email: "tom.a@example.com",
    tags: ["strength", "powerlifting"],
    status: "active",
    risk: 20,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    nextSession: new Date(Date.now() + 1000 * 60 * 60 * 60).toISOString(),
    program: "Powerlifting Prep",
    metrics: { streakDays: 18, workouts7d: 4, responseRate30d: 88 },
    goals: ["Bench 315lbs", "Compete in March"],
    messages: [],
    sessions: [
      { id: "s8", time: new Date(Date.now() + 1000 * 60 * 60 * 60).toISOString(), type: "Strength", status: "upcoming" },
    ],
  },
  {
    id: "c9",
    name: "Nina Williams",
    avatarUrl: "https://i.pravatar.cc/150?img=8",
    email: "nina.w@example.com",
    tags: ["beginner", "weight-loss"],
    status: "active",
    risk: 42,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 84).toISOString(),
    program: "Beginner Fundamentals",
    metrics: { streakDays: 3, workouts7d: 2, responseRate30d: 72 },
    goals: ["Build confidence", "Lose 15lbs"],
    messages: [],
    sessions: [],
  },
  {
    id: "c10",
    name: "Carlos Mendez",
    avatarUrl: "https://i.pravatar.cc/150?img=9",
    phone: "+1999888777",
    email: "carlos.m@example.com",
    tags: ["vip", "athlete", "nutrition"],
    status: "churnRisk",
    risk: 85,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
    program: "Competition Prep",
    notes: "Payment issues last month",
    metrics: { streakDays: 0, workouts7d: 0, responseRate30d: 20 },
    goals: ["Win regional championship"],
    messages: [
      { id: "m6", time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), direction: "out", preview: "Following up on payment..." },
    ],
    sessions: [],
  },
  {
    id: "c11",
    name: "Olivia Kim",
    avatarUrl: "https://i.pravatar.cc/150?img=10",
    email: "olivia.k@example.com",
    tags: ["mobility", "wellness"],
    status: "active",
    risk: 18,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    nextSession: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(),
    program: "Active Recovery",
    metrics: { streakDays: 28, workouts7d: 5, responseRate30d: 95 },
    goals: ["Pain-free movement", "Daily mobility"],
    messages: [],
    sessions: [
      { id: "s9", time: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(), type: "Mobility", status: "upcoming" },
    ],
  },
  {
    id: "c12",
    name: "Ryan Foster",
    email: "ryan.f@example.com",
    tags: ["cardio", "endurance"],
    status: "active",
    risk: 32,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 54).toISOString(),
    nextSession: new Date(Date.now() + 1000 * 60 * 60 * 90).toISOString(),
    program: "Marathon Training",
    metrics: { streakDays: 12, workouts7d: 4, responseRate30d: 82 },
    goals: ["Sub-4 hour marathon", "Stay injury-free"],
    messages: [],
    sessions: [
      { id: "s10", time: new Date(Date.now() + 1000 * 60 * 60 * 90).toISOString(), type: "Run", status: "upcoming" },
    ],
  },
];

export class MockClientProvider implements ClientDataProvider {
  private delay(ms: number = 300) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async list(params: ClientListParams): Promise<{ items: Client[]; total: number }> {
    await this.delay();

    let filtered = [...mockClients];

    // Filter by search query
    if (params.q) {
      const query = params.q.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query) ||
          c.notes?.toLowerCase().includes(query)
      );
    }

    // Filter by tags
    if (params.tags && params.tags.length > 0) {
      filtered = filtered.filter((c) =>
        params.tags!.some((tag) => c.tags.includes(tag))
      );
    }

    // Filter by status
    if (params.status) {
      filtered = filtered.filter((c) => c.status === params.status);
    }

    // Filter by risk range
    if (params.riskMin !== undefined) {
      filtered = filtered.filter((c) => c.risk >= params.riskMin!);
    }
    if (params.riskMax !== undefined) {
      filtered = filtered.filter((c) => c.risk <= params.riskMax!);
    }

    // Filter by has next session
    if (params.hasNext !== undefined) {
      filtered = filtered.filter((c) => !!c.nextSession === params.hasNext);
    }

    // Sort
    const sortField = params.sort || "name";
    const sortDir = params.dir || "asc";
    filtered.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === "lastActivity") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    // Paginate
    const offset = params.offset || 0;
    const limit = params.limit || 50;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      items: paginated,
      total: filtered.length,
    };
  }

  async get(id: string): Promise<ClientDetail> {
    await this.delay();
    const client = mockClients.find((c) => c.id === id);
    if (!client) throw new Error("Client not found");
    return client;
  }

  async nudge(
    id: string,
    body: { templateId: string; preview: string }
  ): Promise<{ ok: boolean }> {
    await this.delay();
    console.log("Mock nudge sent to", id, body);
    return { ok: true };
  }

  async tag(id: string, tags: string[]): Promise<{ ok: boolean }> {
    await this.delay(200);
    const client = mockClients.find((c) => c.id === id);
    if (client) {
      client.tags = tags;
    }
    return { ok: true };
  }

  async note(id: string, note: string): Promise<{ ok: boolean; noteId: string }> {
    await this.delay(200);
    const client = mockClients.find((c) => c.id === id);
    if (client) {
      client.notes = note;
    }
    return { ok: true, noteId: `note-${Date.now()}` };
  }
}
