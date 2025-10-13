import { getDB, setDB } from './db';
import type {
  Post, Comment, Reaction, Event, EventRegistration,
  AffiliateProduct, AffiliateClick, Purchase, Creator,
  Brief, Proposal, Deliverable, Payout, Goal, GoalEntry,
  Session, InboxDraft, PostType, CheckInType, RPELevel,
  InboxStatus, User
} from './types';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const randomDelay = () => sleep(50 + Math.random() * 100); // Reduced for snappier feel

// ==================== COMMUNITY ====================

export async function listPosts(): Promise<Post[]> {
  await randomDelay();
  const db = getDB();
  return [...db.posts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function createPost(data: {
  type: PostType;
  authorId: string;
  content: string;
  imageUrl?: string;
}): Promise<Post> {
  await randomDelay();
  const db = getDB();
  const post: Post = {
    id: `post-${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
    isPinned: data.type === 'announcement',
  };
  db.posts.push(post);
  setDB(db);
  return post;
}

export async function listComments(postId: string): Promise<Comment[]> {
  await randomDelay();
  const db = getDB();
  return db.comments.filter(c => c.postId === postId);
}

export async function createComment(data: {
  postId: string;
  authorId: string;
  content: string;
}): Promise<Comment> {
  await randomDelay();
  const db = getDB();
  const comment: Comment = {
    id: `comment-${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
  };
  db.comments.push(comment);
  setDB(db);
  return comment;
}

export async function listReactions(postId: string): Promise<Reaction[]> {
  await randomDelay();
  const db = getDB();
  return db.reactions.filter(r => r.postId === postId);
}

export async function toggleReaction(data: {
  postId: string;
  userId: string;
  emoji: string;
}): Promise<void> {
  await randomDelay();
  const db = getDB();
  const existing = db.reactions.find(
    r => r.postId === data.postId && r.userId === data.userId && r.emoji === data.emoji
  );
  if (existing) {
    db.reactions = db.reactions.filter(r => r.id !== existing.id);
  } else {
    db.reactions.push({
      id: `reaction-${Date.now()}`,
      ...data,
    });
  }
  setDB(db);
}

// ==================== EVENTS ====================

export async function listEvents(): Promise<Event[]> {
  await randomDelay();
  const db = getDB();
  return [...db.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function getEvent(id: string): Promise<Event | null> {
  await randomDelay();
  const db = getDB();
  return db.events.find(e => e.id === id) || null;
}

export async function registerForEvent(data: {
  eventId: string;
  userId: string;
}): Promise<EventRegistration> {
  await randomDelay();
  const db = getDB();
  const registration: EventRegistration = {
    id: `reg-${Date.now()}`,
    ...data,
    registeredAt: new Date().toISOString(),
  };
  db.eventRegistrations.push(registration);
  setDB(db);
  return registration;
}

export async function isRegistered(eventId: string, userId: string): Promise<boolean> {
  await randomDelay();
  const db = getDB();
  return db.eventRegistrations.some(r => r.eventId === eventId && r.userId === userId);
}

export async function listEventRegistrations(userId: string): Promise<EventRegistration[]> {
  await randomDelay();
  const db = getDB();
  return db.eventRegistrations.filter(r => r.userId === userId);
}

// ==================== AFFILIATE STORE ====================

export async function listAffiliateProducts(): Promise<AffiliateProduct[]> {
  await randomDelay();
  const db = getDB();
  return db.affiliateProducts;
}

export async function recordAffiliateClick(data: {
  productId: string;
  userId: string;
  utmSource?: string;
}): Promise<void> {
  await randomDelay();
  const db = getDB();
  db.affiliateClicks.push({
    id: `click-${Date.now()}`,
    ...data,
    clickedAt: new Date().toISOString(),
    utmSource: data.utmSource || 'trainu-app',
  });
  setDB(db);
}

export async function listPurchases(): Promise<Purchase[]> {
  await randomDelay();
  const db = getDB();
  return [...db.purchases].sort((a, b) => 
    new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()
  );
}

export async function importPurchasesFromCSV(csvData: string): Promise<number> {
  await randomDelay();
  const db = getDB();
  const lines = csvData.split('\n').filter(l => l.trim());
  let imported = 0;
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const [externalId, productName, amount, status, userEmail] = lines[i].split(',');
    if (productName && amount) {
      db.purchases.push({
        id: `purchase-${Date.now()}-${i}`,
        externalId: externalId?.trim(),
        productName: productName.trim(),
        amount: parseFloat(amount.trim()),
        status: (status?.trim() as 'pending' | 'paid') || 'pending',
        source: 'affiliate',
        userEmail: userEmail?.trim(),
        purchasedAt: new Date().toISOString(),
      });
      imported++;
    }
  }
  
  setDB(db);
  return imported;
}

export async function updatePurchaseStatus(id: string, status: 'pending' | 'paid'): Promise<void> {
  await randomDelay();
  const db = getDB();
  const purchase = db.purchases.find(p => p.id === id);
  if (purchase) {
    purchase.status = status;
    setDB(db);
  }
}

export async function importAffiliatePurchases(purchases: Array<{
  externalId?: string;
  productName: string;
  amount: number;
  status: 'pending' | 'paid';
  userEmail?: string;
  source: 'affiliate';
}>): Promise<void> {
  await randomDelay();
  const db = getDB();
  purchases.forEach((p, i) => {
    db.purchases.push({
      id: `purchase-${Date.now()}-${i}`,
      ...p,
      purchasedAt: new Date().toISOString(),
    });
  });
  setDB(db);
}

// ==================== CREATORS ====================

export async function listCreators(filters?: {
  niche?: string;
  minRate?: number;
  maxRate?: number;
}): Promise<Creator[]> {
  await randomDelay();
  const db = getDB();
  let results = db.creators;
  
  if (filters?.niche) {
    results = results.filter(c => 
      c.niches.some(n => n.toLowerCase().includes(filters.niche!.toLowerCase()))
    );
  }
  if (filters?.minRate !== undefined) {
    results = results.filter(c => c.maxRate >= filters.minRate!);
  }
  if (filters?.maxRate !== undefined) {
    results = results.filter(c => c.minRate <= filters.maxRate!);
  }
  
  return results;
}

export async function listBriefs(): Promise<Brief[]> {
  await randomDelay();
  const db = getDB();
  return [...db.briefs].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createBrief(data: {
  title: string;
  goals: string[];
  budgetMin: number;
  budgetMax: number;
  dueBy: string;
  status?: 'draft' | 'active' | 'completed';
}): Promise<Brief> {
  await randomDelay();
  const db = getDB();
  const brief: Brief = {
    id: `brief-${Date.now()}`,
    ...data,
    status: data.status || 'draft',
    createdAt: new Date().toISOString(),
  };
  db.briefs.push(brief);
  setDB(db);
  return brief;
}

export async function listProposals(briefId?: string): Promise<Proposal[]> {
  await randomDelay();
  const db = getDB();
  return briefId 
    ? db.proposals.filter(p => p.briefId === briefId)
    : db.proposals;
}

export async function createProposal(data: {
  briefId: string;
  creatorId: string;
  pitch: string;
  rate: number;
}): Promise<Proposal> {
  await randomDelay();
  const db = getDB();
  const proposal: Proposal = {
    id: `proposal-${Date.now()}`,
    ...data,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };
  db.proposals.push(proposal);
  setDB(db);
  return proposal;
}

export async function updateProposalStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
  await randomDelay();
  const db = getDB();
  const proposal = db.proposals.find(p => p.id === id);
  if (proposal) {
    proposal.status = status;
    setDB(db);
  }
}

export async function uploadDeliverable(data: {
  proposalId: string;
  url?: string;
  fileRef?: string;
}): Promise<Deliverable> {
  await randomDelay();
  const db = getDB();
  const deliverable: Deliverable = {
    id: `deliverable-${Date.now()}`,
    ...data,
    status: 'submitted',
    submittedAt: new Date().toISOString(),
  };
  db.deliverables.push(deliverable);
  setDB(db);
  return deliverable;
}

export async function updateDeliverableStatus(id: string, status: 'accepted' | 'revision'): Promise<void> {
  await randomDelay();
  const db = getDB();
  const deliverable = db.deliverables.find(d => d.id === id);
  if (deliverable) {
    deliverable.status = status;
    if (status === 'accepted') {
      deliverable.acceptedAt = new Date().toISOString();
    }
    setDB(db);
  }
}

export async function createPayout(data: {
  proposalId: string;
  amount: number;
}): Promise<Payout> {
  await randomDelay();
  const db = getDB();
  const payout: Payout = {
    id: `payout-${Date.now()}`,
    ...data,
    status: 'pending',
  };
  db.payouts.push(payout);
  setDB(db);
  return payout;
}

// ==================== GOALS & PROGRESS ====================

export async function listGoals(userId?: string): Promise<Goal[]> {
  await randomDelay();
  const db = getDB();
  return userId ? db.goals.filter(g => g.userId === userId) : db.goals;
}

export async function listSessions(): Promise<Session[]> {
  await randomDelay();
  const db = getDB();
  return db.sessions;
}

export async function createGoal(data: {
  userId: string;
  name: string;
  unit: string;
  target: number;
}): Promise<Goal> {
  await randomDelay();
  const db = getDB();
  const goal: Goal = {
    id: `goal-${Date.now()}`,
    ...data,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  db.goals.push(goal);
  setDB(db);
  return goal;
}

export async function listGoalEntries(goalId?: string): Promise<GoalEntry[]> {
  await randomDelay();
  const db = getDB();
  return goalId ? db.goalEntries.filter(e => e.goalId === goalId) : db.goalEntries;
}

export async function createGoalEntry(data: {
  goalId: string;
  userId: string;
  type: CheckInType;
  rpe?: RPELevel;
  notes?: string;
}): Promise<GoalEntry> {
  await randomDelay();
  const db = getDB();
  const entry: GoalEntry = {
    id: `entry-${Date.now()}`,
    ...data,
    date: new Date().toISOString().split('T')[0],
  };
  db.goalEntries.push(entry);
  
  // Update client progress
  const progress = db.clientProgress.find(p => p.userId === data.userId);
  if (progress && data.type === 'completed') {
    progress.completedThisWeek += 1;
    progress.lastCheckIn = entry.date;
    if (progress.completedThisWeek >= progress.weeklyTarget) {
      progress.streak += 1;
    }
  }
  
  setDB(db);
  return entry;
}

export async function getClientProgress(userId: string) {
  await randomDelay();
  const db = getDB();
  return db.clientProgress.find(p => p.userId === userId);
}

export async function listClientProgress(): Promise<typeof getDB extends () => infer DB ? DB extends { clientProgress: infer CP } ? CP : never : never> {
  await randomDelay();
  const db = getDB();
  return db.clientProgress;
}

export async function getNextSession(userId: string): Promise<Session | null> {
  await randomDelay();
  const db = getDB();
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  return db.sessions
    .filter(s => s.clientId === userId && s.date >= today && s.status === 'scheduled')
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      return dateCompare !== 0 ? dateCompare : a.time.localeCompare(b.time);
    })[0] || null;
}

// ==================== AI INBOX ====================

export async function listInboxDrafts(status?: InboxStatus): Promise<InboxDraft[]> {
  await randomDelay();
  const db = getDB();
  return status
    ? db.inboxDrafts.filter(d => d.status === status)
    : db.inboxDrafts;
}

export async function updateInboxStatus(id: string, status: InboxStatus): Promise<void> {
  await randomDelay();
  const db = getDB();
  const draft = db.inboxDrafts.find(d => d.id === id);
  if (draft) {
    draft.status = status;
    if (status === 'sent') {
      draft.sentAt = new Date().toISOString();
    }
    setDB(db);
  }
}

export async function updateInboxContent(id: string, content: Partial<Pick<InboxDraft, 'subject' | 'previewText' | 'fullContent'>>): Promise<void> {
  await randomDelay();
  const db = getDB();
  const draft = db.inboxDrafts.find(d => d.id === id);
  if (draft) {
    Object.assign(draft, content);
    setDB(db);
  }
}

export const updateInboxDraftStatus = updateInboxStatus;

export async function generateSampleDrafts(): Promise<void> {
  await randomDelay();
  const db = getDB();
  
  const sampleDrafts: InboxDraft[] = [
    {
      id: `draft-${Date.now()}-1`,
      triggerType: 'welcome',
      targetUserId: 'client-1',
      subject: 'Welcome to TrainU! 🎉',
      previewText: 'We\'re excited to have you start your fitness journey with us.',
      fullContent: 'Hi there!\n\nWelcome to TrainU! We\'re thrilled to have you join our community.\n\nYour trainer is excited to work with you and help you achieve your fitness goals.\n\nBest,\nThe TrainU Team',
      status: 'needs_review',
      createdAt: new Date().toISOString(),
    },
    {
      id: `draft-${Date.now()}-2`,
      triggerType: 'streak_protect',
      targetUserId: 'client-2',
      subject: 'Don\'t break your 5-week streak! 🔥',
      previewText: 'You\'re so close to hitting 6 weeks in a row!',
      fullContent: 'Hey champion!\n\nYou\'ve been crushing it with a 5-week streak! That\'s incredible consistency.\n\nDon\'t let it slip now - you\'re just one week away from a major milestone.\n\nKeep it up!\nYour Trainer',
      status: 'needs_review',
      createdAt: new Date().toISOString(),
    },
    {
      id: `draft-${Date.now()}-3`,
      triggerType: 'pre_session',
      targetUserId: 'client-3',
      subject: 'Session tomorrow at 10:00 AM 📅',
      previewText: 'Looking forward to seeing you tomorrow!',
      fullContent: 'Hi!\n\nJust a friendly reminder about your session tomorrow at 10:00 AM.\n\nDon\'t forget to bring water and wear comfortable shoes.\n\nSee you soon!\nYour Trainer',
      status: 'needs_review',
      createdAt: new Date().toISOString(),
    },
  ];
  
  db.inboxDrafts.push(...sampleDrafts);
  setDB(db);
}

export async function createInboxDraft(data: {
  triggerType: InboxDraft['triggerType'];
  targetUserId: string;
  subject: string;
  previewText: string;
  fullContent: string;
}): Promise<InboxDraft> {
  await randomDelay();
  const db = getDB();
  const draft: InboxDraft = {
    id: `draft-${Date.now()}`,
    ...data,
    status: 'needs_review',
    createdAt: new Date().toISOString(),
  };
  db.inboxDrafts.push(draft);
  setDB(db);
  return draft;
}

// ==================== USERS ====================

export async function getUser(id: string): Promise<User | null> {
  await randomDelay();
  const db = getDB();
  return db.users.find(u => u.id === id) || null;
}

export async function listUsers(): Promise<User[]> {
  await randomDelay();
  const db = getDB();
  return db.users;
}

// ==================== GAMIFICATION ====================

export async function listAchievements(): Promise<import('./types').Achievement[]> {
  await randomDelay();
  const db = getDB();
  return (db as any).achievements || [];
}

export async function getUserAchievements(userId: string): Promise<import('./types').Achievement[]> {
  await randomDelay();
  const db = getDB();
  const userProgress = db.clientProgress.find(p => p.userId === userId);
  if (!userProgress) return [];
  
  const allAchievements = (db as any).achievements || [];
  // Return unlocked achievements based on user progress
  return allAchievements.filter((a: any) => {
    if (a.category === 'consistency') {
      return userProgress.streak >= a.milestone;
    }
    if (a.category === 'strength') {
      return userProgress.completedThisWeek >= a.milestone;
    }
    return false;
  });
}

export async function listChallenges(userId?: string): Promise<import('./types').Challenge[]> {
  await randomDelay();
  const db = getDB();
  return (db as any).challenges || [];
}

export async function awardXP(userId: string, amount: number, source: string): Promise<void> {
  await randomDelay();
  const db = getDB();
  const progress = db.clientProgress.find(p => p.userId === userId);
  if (!progress) return;
  
  progress.xp += amount;
  
  // Level up logic
  while (progress.xp >= progress.xpToNextLevel) {
    progress.xp -= progress.xpToNextLevel;
    progress.level += 1;
    progress.xpToNextLevel = Math.floor(progress.xpToNextLevel * 1.2); // 20% increase per level
    
    // Update title based on level
    if (progress.level >= 50) progress.title = 'Legend';
    else if (progress.level >= 20) progress.title = 'Champion';
    else if (progress.level >= 10) progress.title = 'Athlete';
    else if (progress.level >= 5) progress.title = 'Rising Star';
    else progress.title = 'Beginner';
  }
  
  setDB(db);
}

export async function listLeaderboard(
  category: 'overall' | 'strength' | 'consistency' | 'social' = 'overall',
  period: 'weekly' | 'monthly' | 'all-time' = 'all-time'
): Promise<import('./types').LeaderboardEntry[]> {
  await randomDelay();
  const db = getDB();
  
  const users = db.users.filter(u => u.role === 'client');
  const entries: import('./types').LeaderboardEntry[] = [];

  for (const user of users) {
    const progress = db.clientProgress.find(p => p.userId === user.id);
    if (!progress) continue;

    let score = 0;
    switch (category) {
      case 'overall':
        score = progress.xp || 0;
        break;
      case 'strength':
        // Use completed this week as proxy for session count
        score = progress.completedThisWeek || 0;
        break;
      case 'consistency':
        score = progress.streak || 0;
        break;
      case 'social':
        // Mock social score based on user engagement
        score = Math.floor(Math.random() * 500);
        break;
    }

    entries.push({
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatarUrl,
      score,
      rank: 0, // Will be set after sorting
      change: Math.floor(Math.random() * 20) - 10, // Mock change
      period
    });
  }

  // Sort by score descending and assign ranks
  entries.sort((a, b) => b.score - a.score);
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return entries.slice(0, 50); // Top 50
}

export async function listMilestones(userId: string): Promise<import('./types').Milestone[]> {
  await randomDelay();
  const db = getDB();
  
  const { seedMilestones } = await import('./gamificationData');
  const progress = db.clientProgress.find(p => p.userId === userId);
  
  if (!progress) return seedMilestones;

  // Update milestone achievement status based on actual progress
  return seedMilestones.map(milestone => {
    let achieved = milestone.achieved;
    
    if (!achieved) {
      switch (milestone.type) {
        case 'sessions':
        case 'session_count':
          // Use completedThisWeek as proxy for total session count
          achieved = (progress.completedThisWeek || 0) >= milestone.value;
          break;
        case 'streak':
          achieved = (progress.streak || 0) >= milestone.value;
          break;
        case 'xp':
          achieved = (progress.xp || 0) >= milestone.value;
          break;
      }
    }

    return {
      ...milestone,
      achieved,
      achievedAt: achieved && !milestone.achievedAt 
        ? new Date().toISOString() 
        : milestone.achievedAt
    };
  });
}
