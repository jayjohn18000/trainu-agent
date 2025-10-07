import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SessionStatus = "upcoming" | "in_progress" | "completed" | "cancelled" | "no_show";
export type SessionType = "in_person" | "virtual";

export interface Session {
  id: string;
  title: string;
  trainerId: string;
  trainerName: string;
  clientId: string;
  clientName: string;
  date: string;
  time: string;
  duration: number; // in minutes
  type: SessionType;
  status: SessionStatus;
  location?: string;
  notes?: string;
  price?: number;
  sessionTypeId: string;
}

export interface AvailabilityRule {
  id: string;
  trainerId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isActive: boolean;
}

export interface AvailabilityException {
  id: string;
  trainerId: string;
  date: string; // YYYY-MM-DD
  isBlocked: boolean;
  reason?: string;
  startTime?: string;
  endTime?: string;
}

export interface CalendarFilter {
  trainerId?: string;
  clientId?: string;
  status?: SessionStatus[];
  type?: SessionType[];
  dateFrom?: string;
  dateTo?: string;
}

interface CalendarState {
  sessions: Session[];
  availabilityRules: AvailabilityRule[];
  availabilityExceptions: AvailabilityException[];
  filter: CalendarFilter;
  selectedDate: Date;
  viewMode: "month" | "week" | "day" | "agenda";
  
  // Actions
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  
  setAvailabilityRules: (rules: AvailabilityRule[]) => void;
  addAvailabilityRule: (rule: AvailabilityRule) => void;
  updateAvailabilityRule: (id: string, updates: Partial<AvailabilityRule>) => void;
  deleteAvailabilityRule: (id: string) => void;
  
  setAvailabilityExceptions: (exceptions: AvailabilityException[]) => void;
  addAvailabilityException: (exception: AvailabilityException) => void;
  deleteAvailabilityException: (id: string) => void;
  
  setFilter: (filter: Partial<CalendarFilter>) => void;
  clearFilter: () => void;
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: "month" | "week" | "day" | "agenda") => void;
  
  getFilteredSessions: () => Session[];
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      sessions: [],
      availabilityRules: [],
      availabilityExceptions: [],
      filter: {},
      selectedDate: new Date(),
      viewMode: "week",
      
      setSessions: (sessions) => set({ sessions }),
      addSession: (session) => set((state) => ({ sessions: [...state.sessions, session] })),
      updateSession: (id, updates) =>
        set((state) => ({
          sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),
      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        })),
      
      setAvailabilityRules: (rules) => set({ availabilityRules: rules }),
      addAvailabilityRule: (rule) =>
        set((state) => ({ availabilityRules: [...state.availabilityRules, rule] })),
      updateAvailabilityRule: (id, updates) =>
        set((state) => ({
          availabilityRules: state.availabilityRules.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),
      deleteAvailabilityRule: (id) =>
        set((state) => ({
          availabilityRules: state.availabilityRules.filter((r) => r.id !== id),
        })),
      
      setAvailabilityExceptions: (exceptions) => set({ availabilityExceptions: exceptions }),
      addAvailabilityException: (exception) =>
        set((state) => ({
          availabilityExceptions: [...state.availabilityExceptions, exception],
        })),
      deleteAvailabilityException: (id) =>
        set((state) => ({
          availabilityExceptions: state.availabilityExceptions.filter((e) => e.id !== id),
        })),
      
      setFilter: (filter) => set((state) => ({ filter: { ...state.filter, ...filter } })),
      clearFilter: () => set({ filter: {} }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setViewMode: (mode) => set({ viewMode: mode }),
      
      getFilteredSessions: () => {
        const { sessions, filter } = get();
        return sessions.filter((session) => {
          if (filter.trainerId && session.trainerId !== filter.trainerId) return false;
          if (filter.clientId && session.clientId !== filter.clientId) return false;
          if (filter.status && !filter.status.includes(session.status)) return false;
          if (filter.type && !filter.type.includes(session.type)) return false;
          if (filter.dateFrom && session.date < filter.dateFrom) return false;
          if (filter.dateTo && session.date > filter.dateTo) return false;
          return true;
        });
      },
    }),
    {
      name: "trainu-calendar",
      partialize: (state) => ({
        viewMode: state.viewMode,
      }),
    }
  )
);
