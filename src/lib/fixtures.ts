// Fixture loader with AGENT_MOCK gating
import queueData from '@/data/fixtures/queue.json';
import feedData from '@/data/fixtures/feed.json';
import clientsData from '@/data/fixtures/clients.json';
import settingsData from '@/data/fixtures/settings.json';

// Check if we're in mock mode
const isAgentMock = import.meta.env.VITE_AGENT_MOCK === '1';

console.log('AGENT_MOCK mode:', isAgentMock, 'ENV:', import.meta.env.VITE_AGENT_MOCK);

export const fixtures = {
  queue: isAgentMock ? queueData : [],
  feed: isAgentMock ? feedData : [],
  clients: isAgentMock ? clientsData : [],
  settings: isAgentMock ? settingsData : null,
};

export const useFixtures = () => isAgentMock;
