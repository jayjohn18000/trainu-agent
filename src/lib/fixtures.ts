// Fixture loader with AGENT_MOCK gating
import queueData from '@/data/fixtures/queue.json';
import feedData from '@/data/fixtures/feed.json';
import clientsData from '@/data/fixtures/clients.json';
import clientDetailsData from '@/data/fixtures/clientDetails.json';
import settingsData from '@/data/fixtures/settings.json';
import type { QueueItem, FeedItem, Client, AgentSettings } from '@/types/agent';

// Check if we're in mock mode
const isAgentMock = import.meta.env.VITE_AGENT_MOCK === '1';

console.log('AGENT_MOCK mode:', isAgentMock, 'ENV:', import.meta.env.VITE_AGENT_MOCK);

export const fixtures = {
  queue: (isAgentMock ? queueData : []) as QueueItem[],
  feed: (isAgentMock ? feedData : []) as FeedItem[],
  clients: (isAgentMock ? clientsData : []) as Client[],
  clientDetails: (isAgentMock ? clientDetailsData : {}) as Record<string, any>,
  settings: (isAgentMock ? settingsData : null) as AgentSettings | null,
};

export const useFixtures = () => isAgentMock;
