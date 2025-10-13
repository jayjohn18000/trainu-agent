import type {
  User, Post, Comment, Reaction, Event, EventRegistration,
  AffiliateProduct, AffiliateClick, Purchase, Creator, Brief,
  Proposal, Deliverable, Payout, Goal, GoalEntry, Session,
  ClientProgress, InboxDraft, MetricSnapshot
} from './types';
import * as seed from './seed';

const STORAGE_KEY = 'trainu-mock-db';

export interface MockDB {
  users: User[];
  posts: Post[];
  comments: Comment[];
  reactions: Reaction[];
  events: Event[];
  eventRegistrations: EventRegistration[];
  affiliateProducts: AffiliateProduct[];
  affiliateClicks: AffiliateClick[];
  purchases: Purchase[];
  creators: Creator[];
  briefs: Brief[];
  proposals: Proposal[];
  deliverables: Deliverable[];
  payouts: Payout[];
  goals: Goal[];
  goalEntries: GoalEntry[];
  sessions: Session[];
  clientProgress: ClientProgress[];
  inboxDrafts: InboxDraft[];
  metrics: MetricSnapshot[];
  achievements?: any[];
  challenges?: any[];
}

function getInitialDB(): MockDB {
  // Lazy load gamification data
  const gamificationData = require('./gamificationData');
  
  return {
    users: [...seed.seedUsers],
    posts: [...seed.seedPosts],
    comments: [...seed.seedComments],
    reactions: [...seed.seedReactions],
    events: [...seed.seedEvents],
    eventRegistrations: [...seed.seedEventRegistrations],
    affiliateProducts: [...seed.seedAffiliateProducts],
    affiliateClicks: [...seed.seedAffiliateClicks],
    purchases: [...seed.seedPurchases],
    creators: [...seed.seedCreators],
    briefs: [...seed.seedBriefs],
    proposals: [...seed.seedProposals],
    deliverables: [...seed.seedDeliverables],
    payouts: [...seed.seedPayouts],
    goals: [...seed.seedGoals],
    goalEntries: [...seed.seedGoalEntries],
    sessions: [...seed.seedSessions],
    clientProgress: [...seed.seedClientProgress],
    inboxDrafts: [...seed.seedInboxDrafts],
    metrics: [...seed.seedMetrics],
    achievements: [...gamificationData.seedAchievements],
    challenges: [...gamificationData.seedChallenges],
  };
}

// Load from localStorage or initialize
export function loadDB(): MockDB {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load mock DB from storage:', e);
  }
  return getInitialDB();
}

// Save to localStorage
export function saveDB(db: MockDB): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.warn('Failed to save mock DB to storage:', e);
  }
}

// Reset to seed data
export function resetDB(): MockDB {
  const db = getInitialDB();
  saveDB(db);
  return db;
}

// Initialize on module load
let db = loadDB();

export function getDB(): MockDB {
  return db;
}

export function setDB(newDB: MockDB): void {
  db = newDB;
  saveDB(db);
}
