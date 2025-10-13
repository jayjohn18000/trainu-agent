// ==================== CORE TYPES ====================

export type UserRole = 'owner' | 'trainer' | 'client' | 'gym_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isMember?: boolean;
}

// ==================== COMMUNITY ====================

export type PostType = 'announcement' | 'thread';

export interface Post {
  id: string;
  type: PostType;
  authorId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  isPinned?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Reaction {
  id: string;
  postId: string;
  userId: string;
  emoji: string;
}

// ==================== EVENTS ====================

export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  date: string;
  time: string;
  location: string;
  price: number;
  capacity: number;
  ticketUrl: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: string;
}

// ==================== AFFILIATE STORE ====================

export interface AffiliateProduct {
  id: string;
  title: string;
  brand: string;
  price: number;
  imageUrl: string;
  url: string;
  category: string;
}

export interface AffiliateClick {
  id: string;
  productId: string;
  userId: string;
  clickedAt: string;
  utmSource?: string;
}

export type PurchaseSource = 'affiliate' | 'whop';

export interface Purchase {
  id: string;
  externalId?: string;
  productName: string;
  amount: number;
  status: 'pending' | 'paid';
  source: PurchaseSource;
  userEmail?: string;
  userId?: string;
  purchasedAt: string;
}

// ==================== CREATORS & UGC ====================

export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  niches: string[];
  minRate: number;
  maxRate: number;
  bio?: string;
}

export type BriefStatus = 'draft' | 'active' | 'completed';

export interface Brief {
  id: string;
  title: string;
  goals: string[];
  budgetMin: number;
  budgetMax: number;
  dueBy: string;
  status: BriefStatus;
  createdAt: string;
}

export type ProposalStatus = 'pending' | 'approved' | 'rejected';

export interface Proposal {
  id: string;
  briefId: string;
  creatorId: string;
  pitch: string;
  rate: number;
  status: ProposalStatus;
  submittedAt: string;
}

export type DeliverableStatus = 'pending' | 'submitted' | 'accepted' | 'revision';

export interface Deliverable {
  id: string;
  proposalId: string;
  url?: string;
  fileRef?: string;
  status: DeliverableStatus;
  submittedAt?: string;
  acceptedAt?: string;
}

export interface Payout {
  id: string;
  proposalId: string;
  amount: number;
  status: 'pending' | 'paid';
  paidAt?: string;
}

// ==================== GOALS & PROGRESS ====================

export interface Goal {
  id: string;
  userId: string;
  name: string;
  unit: string;
  target: number;
  isActive: boolean;
  createdAt: string;
}

export type CheckInType = 'completed' | 'partial' | 'missed';
export type RPELevel = 'hard' | 'right' | 'light';

export interface GoalEntry {
  id: string;
  goalId: string;
  userId: string;
  type: CheckInType;
  rpe?: RPELevel;
  notes?: string;
  date: string;
}

export interface Session {
  id: string;
  trainerId: string;
  clientId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  type: string;
}

export interface ClientProgress {
  userId: string;
  weeklyTarget: number;
  completedThisWeek: number;
  streak: number;
  lastCheckIn?: string;
  // Gamification fields
  level: number;
  xp: number;
  xpToNextLevel: number;
  title: 'Beginner' | 'Rising Star' | 'Athlete' | 'Champion' | 'Legend';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'consistency' | 'strength' | 'social' | 'transformation';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon: string; // emoji or icon name
  unlockedAt?: string;
  progress?: number; // 0-100 for locked achievements
  milestone: number; // e.g., "10 sessions" = 10
}

export interface Challenge {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  title: string;
  description: string;
  steps: Array<{ id: string; description: string; completed: boolean }>;
  xpReward: number;
  badgeReward?: string; // achievement ID
  expiresAt: string;
  progress: number; // 0-100
}

export interface LeaderboardEntry {
  userId: string;
  rank: number;
  previousRank?: number;
  value: number; // streak count, session count, etc.
  percentile: number; // top 10%, 25%, etc.
}

export interface Milestone {
  id: string;
  userId: string;
  type: 'session_count' | 'streak' | 'pr' | 'goal_completion';
  value: number; // e.g., 10 for "10th session"
  celebrationType: 'confetti' | 'toast' | 'modal';
  achievementUnlocked?: string;
  triggeredAt: string;
}

// ==================== AI INBOX ====================

export type InboxTriggerType = 
  | 'welcome' 
  | 'streak_protect' 
  | 'pre_session' 
  | 'no_show_recovery' 
  | 'milestone';

export type InboxStatus = 'needs_review' | 'scheduled' | 'sent' | 'rejected';

export interface InboxDraft {
  id: string;
  triggerType: InboxTriggerType;
  targetUserId: string;
  subject: string;
  previewText: string;
  fullContent: string;
  status: InboxStatus;
  createdAt: string;
  scheduledFor?: string;
  sentAt?: string;
}

// ==================== ANALYTICS ====================

export interface MetricSnapshot {
  date: string;
  paidToBooked72h: number;
  showRate: number;
  newMembers: number;
  affiliateGMV: number;
  creatorROI: number;
}
