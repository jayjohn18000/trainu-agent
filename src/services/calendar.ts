import type {
  Session,
  AvailabilityRule,
  AvailabilityException,
} from "@/lib/store/useCalendarStore";

// Mock data for development - will be replaced with GHL API calls
const mockSessions: Session[] = [
  {
    id: "1",
    title: "Strength Training",
    trainerId: "trainer-1",
    trainerName: "Alex Carter",
    clientId: "demo-user",
    clientName: "Demo User",
    date: "2025-10-05",
    time: "10:00",
    duration: 60,
    type: "in_person",
    status: "upcoming",
    location: "Gold's Gym Downtown",
    sessionTypeId: "strength-60",
    price: 75,
  },
  {
    id: "2",
    title: "HIIT Bootcamp",
    trainerId: "trainer-2",
    trainerName: "Riley Nguyen",
    clientId: "demo-user",
    clientName: "Demo User",
    date: "2025-10-06",
    time: "18:00",
    duration: 45,
    type: "in_person",
    status: "upcoming",
    location: "CrossFit Bay Area",
    sessionTypeId: "hiit-45",
    price: 60,
  },
  {
    id: "3",
    title: "Nutrition Consultation",
    trainerId: "trainer-2",
    trainerName: "Riley Nguyen",
    clientId: "demo-user",
    clientName: "Demo User",
    date: "2025-10-08",
    time: "14:00",
    duration: 30,
    type: "virtual",
    status: "upcoming",
    sessionTypeId: "nutrition-30",
    price: 40,
  },
  {
    id: "4",
    title: "Yoga Flow",
    trainerId: "trainer-3",
    trainerName: "Sam Mitchell",
    clientId: "demo-user",
    clientName: "Demo User",
    date: "2025-10-10",
    time: "09:00",
    duration: 60,
    type: "in_person",
    status: "upcoming",
    location: "Zen Fitness Studio",
    sessionTypeId: "yoga-60",
    price: 50,
  },
];

const mockAvailabilityRules: AvailabilityRule[] = [
  // Monday
  { id: "ar-1", trainerId: "trainer-1", dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isActive: true },
  // Tuesday
  { id: "ar-2", trainerId: "trainer-1", dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isActive: true },
  // Wednesday
  { id: "ar-3", trainerId: "trainer-1", dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isActive: true },
  // Thursday
  { id: "ar-4", trainerId: "trainer-1", dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isActive: true },
  // Friday
  { id: "ar-5", trainerId: "trainer-1", dayOfWeek: 5, startTime: "09:00", endTime: "15:00", isActive: true },
];

const mockAvailabilityExceptions: AvailabilityException[] = [
  {
    id: "ae-1",
    trainerId: "trainer-1",
    date: "2025-10-15",
    isBlocked: true,
    reason: "Personal Day Off",
  },
];

// Simulated API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Calendar API Service
export const calendarApi = {
  // Sessions
  async getSessions(trainerId?: string, clientId?: string): Promise<Session[]> {
    await delay(300);
    let filtered = mockSessions;
    if (trainerId) filtered = filtered.filter((s) => s.trainerId === trainerId);
    if (clientId) filtered = filtered.filter((s) => s.clientId === clientId);
    return filtered;
  },

  async getSessionById(id: string): Promise<Session | null> {
    await delay(200);
    return mockSessions.find((s) => s.id === id) || null;
  },

  async createSession(session: Omit<Session, "id">): Promise<Session> {
    await delay(400);
    const newSession = { ...session, id: `session-${Date.now()}` };
    mockSessions.push(newSession);
    return newSession;
  },

  async updateSession(id: string, updates: Partial<Session>): Promise<Session> {
    await delay(300);
    const index = mockSessions.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Session not found");
    mockSessions[index] = { ...mockSessions[index], ...updates };
    return mockSessions[index];
  },

  async deleteSession(id: string): Promise<void> {
    await delay(300);
    const index = mockSessions.findIndex((s) => s.id === id);
    if (index !== -1) mockSessions.splice(index, 1);
  },

  async cancelSession(id: string, reason?: string): Promise<Session> {
    return this.updateSession(id, { status: "cancelled", notes: reason });
  },

  async rescheduleSession(id: string, newDate: string, newTime: string): Promise<Session> {
    return this.updateSession(id, { date: newDate, time: newTime });
  },

  async markSessionComplete(id: string): Promise<Session> {
    return this.updateSession(id, { status: "completed" });
  },

  async markSessionNoShow(id: string): Promise<Session> {
    return this.updateSession(id, { status: "no_show" });
  },

  // Availability Rules
  async getAvailabilityRules(trainerId: string): Promise<AvailabilityRule[]> {
    await delay(300);
    return mockAvailabilityRules.filter((r) => r.trainerId === trainerId);
  },

  async createAvailabilityRule(rule: Omit<AvailabilityRule, "id">): Promise<AvailabilityRule> {
    await delay(300);
    const newRule = { ...rule, id: `ar-${Date.now()}` };
    mockAvailabilityRules.push(newRule);
    return newRule;
  },

  async updateAvailabilityRule(id: string, updates: Partial<AvailabilityRule>): Promise<AvailabilityRule> {
    await delay(300);
    const index = mockAvailabilityRules.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Rule not found");
    mockAvailabilityRules[index] = { ...mockAvailabilityRules[index], ...updates };
    return mockAvailabilityRules[index];
  },

  async deleteAvailabilityRule(id: string): Promise<void> {
    await delay(300);
    const index = mockAvailabilityRules.findIndex((r) => r.id === id);
    if (index !== -1) mockAvailabilityRules.splice(index, 1);
  },

  // Availability Exceptions
  async getAvailabilityExceptions(trainerId: string): Promise<AvailabilityException[]> {
    await delay(300);
    return mockAvailabilityExceptions.filter((e) => e.trainerId === trainerId);
  },

  async createAvailabilityException(
    exception: Omit<AvailabilityException, "id">
  ): Promise<AvailabilityException> {
    await delay(300);
    const newException = { ...exception, id: `ae-${Date.now()}` };
    mockAvailabilityExceptions.push(newException);
    return newException;
  },

  async deleteAvailabilityException(id: string): Promise<void> {
    await delay(300);
    const index = mockAvailabilityExceptions.findIndex((e) => e.id === id);
    if (index !== -1) mockAvailabilityExceptions.splice(index, 1);
  },

  // Available Time Slots
  async getAvailableSlots(
    trainerId: string,
    date: string,
    sessionDuration: number = 60
  ): Promise<string[]> {
    await delay(300);
    
    const dayOfWeek = new Date(date).getDay();
    const rules = mockAvailabilityRules.filter(
      (r) => r.trainerId === trainerId && r.dayOfWeek === dayOfWeek && r.isActive
    );

    if (rules.length === 0) return [];

    // Check for exceptions
    const exception = mockAvailabilityExceptions.find(
      (e) => e.trainerId === trainerId && e.date === date
    );
    if (exception?.isBlocked) return [];

    // Get booked sessions for this day
    const bookedSessions = mockSessions.filter(
      (s) => s.trainerId === trainerId && s.date === date && s.status !== "cancelled"
    );

    // Generate time slots (simplified logic)
    const slots: string[] = [];
    const rule = rules[0];
    const [startHour, startMin] = rule.startTime.split(":").map(Number);
    const [endHour, endMin] = rule.endTime.split(":").map(Number);

    let currentTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    while (currentTime + sessionDuration <= endTime) {
      const hour = Math.floor(currentTime / 60);
      const min = currentTime % 60;
      const timeSlot = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;

      // Check if slot is available
      const isBooked = bookedSessions.some((s) => s.time === timeSlot);
      if (!isBooked) slots.push(timeSlot);

      currentTime += 30; // 30-minute intervals
    }

    return slots;
  },
};

// GHL Integration Interface (for future implementation)
export interface GHLCalendarConfig {
  apiKey: string;
  locationId: string;
  calendarId: string;
}

// Placeholder for GHL API integration
export const ghlCalendarApi = {
  async syncAppointments(config: GHLCalendarConfig): Promise<Session[]> {
    // TODO: Implement GHL API integration
    throw new Error("GHL integration not yet implemented");
  },

  async createAppointment(config: GHLCalendarConfig, session: Omit<Session, "id">): Promise<Session> {
    // TODO: Implement GHL API integration
    throw new Error("GHL integration not yet implemented");
  },

  async updateAppointment(config: GHLCalendarConfig, id: string, updates: Partial<Session>): Promise<Session> {
    // TODO: Implement GHL API integration
    throw new Error("GHL integration not yet implemented");
  },

  async deleteAppointment(config: GHLCalendarConfig, id: string): Promise<void> {
    // TODO: Implement GHL API integration
    throw new Error("GHL integration not yet implemented");
  },
};
