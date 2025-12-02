export type IntegrationSource = 'ghl' | 'mindbody' | 'trainerize' | 'truecoach' | 'apple_health' | 'oura';

export interface IntegrationInfo {
  name: IntegrationSource;
  displayName: string;
  description: string;
  icon?: string;
  status: 'connected' | 'disconnected' | 'coming-soon' | 'warning';
  category: 'crm' | 'programs' | 'wearables' | 'other';
  prerequisites?: string[];
  benefits?: string[];
}

export const INTEGRATION_INFO: Record<IntegrationSource, IntegrationInfo> = {
  ghl: {
    name: 'ghl',
    displayName: 'GoHighLevel',
    description: 'CRM and messaging platform integration',
    status: 'connected', // Will be updated from API
    category: 'crm',
  },
  mindbody: {
    name: 'mindbody',
    displayName: 'Mindbody',
    description: 'Gym management and attendance tracking',
    status: 'disconnected', // Will be updated from API
    category: 'other',
    prerequisites: ['Mindbody account'],
    benefits: [
      'Program compliance tracking',
      'Habit adherence scoring',
      'Body stat trends',
      'AI recommendations based on your program history',
    ],
  },
  trainerize: {
    name: 'trainerize',
    displayName: 'Trainerize',
    description: 'Program and habit tracking platform',
    status: 'disconnected',
    category: 'programs',
    prerequisites: ['Trainerize Studio+ or higher', 'Your trainer/gym account'],
    benefits: [
      'Program compliance tracking',
      'Habit adherence scoring',
      'Body stat trends',
      'AI recommendations based on your program history',
    ],
  },
  truecoach: {
    name: 'truecoach',
    displayName: 'TrueCoach',
    description: 'Training program management',
    status: 'disconnected',
    category: 'programs',
    prerequisites: ['TrueCoach account + API access'],
    benefits: [
      'Program compliance tracking',
      'Workout completion data',
      'Client progress metrics',
    ],
  },
  apple_health: {
    name: 'apple_health',
    displayName: 'Apple HealthKit',
    description: 'Health and fitness data from Apple devices',
    status: 'coming-soon',
    category: 'wearables',
    benefits: [
      'Sleep tracking',
      'Activity levels',
      'Heart rate data',
      'Recovery metrics',
    ],
  },
  oura: {
    name: 'oura',
    displayName: 'Oura Ring',
    description: 'Sleep and recovery tracking from Oura Ring',
    status: 'coming-soon',
    category: 'wearables',
    benefits: [
      'Sleep quality metrics',
      'Recovery scores',
      'Activity tracking',
      'Readiness scores',
    ],
  },
};

