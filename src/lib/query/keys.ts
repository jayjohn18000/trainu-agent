import type { ClientListParams } from '@/lib/data/clients/types';

export const queryKeys = {
  clients: {
    all: ['clients'] as const,
    lists: () => [...queryKeys.clients.all, 'list'] as const,
    list: (params: ClientListParams) => [...queryKeys.clients.lists(), params] as const,
    details: () => [...queryKeys.clients.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.clients.details(), id] as const,
  },
  gamification: {
    all: ['gamification'] as const,
    progress: () => [...queryKeys.gamification.all, 'progress'] as const,
    achievements: () => [...queryKeys.gamification.all, 'achievements'] as const,
  },
  calendar: {
    all: ['calendar'] as const,
    sessions: (trainerId?: string, clientId?: string) => [...queryKeys.calendar.all, 'sessions', { trainerId, clientId }] as const,
    session: (id: string) => [...queryKeys.calendar.all, 'session', id] as const,
  },
  messages: {
    all: ['messages'] as const,
    conversations: () => [...queryKeys.messages.all, 'conversations'] as const,
    conversation: (id: string) => [...queryKeys.messages.all, 'conversation', id] as const,
    messages: (conversationId: string) => [...queryKeys.messages.all, 'messages', conversationId] as const,
    recent: () => [...queryKeys.messages.all, 'recent'] as const,
  },
  atRisk: {
    all: ['at-risk'] as const,
    clients: () => [...queryKeys.atRisk.all, 'clients'] as const,
  },
  sessions: {
    all: ['sessions'] as const,
    upcoming: () => [...queryKeys.sessions.all, 'upcoming'] as const,
  },
};


