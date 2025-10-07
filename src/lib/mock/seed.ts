import type {
  User, Post, Comment, Reaction, Event, EventRegistration,
  AffiliateProduct, AffiliateClick, Purchase, Creator, Brief,
  Proposal, Deliverable, Payout, Goal, GoalEntry, Session,
  ClientProgress, InboxDraft, MetricSnapshot
} from './types';

const now = new Date();
const today = now.toISOString().split('T')[0];

// ==================== USERS ====================
export const seedUsers: User[] = [
  {
    id: 'user-owner-1',
    name: 'Alex Johnson',
    email: 'alex@trainu.app',
    role: 'owner',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    isMember: true,
  },
  {
    id: 'user-trainer-1',
    name: 'Sarah Chen',
    email: 'sarah@trainu.app',
    role: 'trainer',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    isMember: true,
  },
  {
    id: 'user-client-1',
    name: 'Mike Rodriguez',
    email: 'mike@trainu.app',
    role: 'client',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    isMember: true,
  },
  {
    id: 'user-client-2',
    name: 'Emily Davis',
    email: 'emily@trainu.app',
    role: 'client',
    avatarUrl: 'https://i.pravatar.cc/150?img=9',
    isMember: true,
  },
  {
    id: 'user-client-3',
    name: 'James Wilson',
    email: 'james@trainu.app',
    role: 'client',
    avatarUrl: 'https://i.pravatar.cc/150?img=13',
    isMember: true,
  },
];

// ==================== COMMUNITY ====================
export const seedPosts: Post[] = [
  {
    id: 'post-1',
    type: 'announcement',
    authorId: 'user-owner-1',
    content: '🎉 Welcome to our new community platform! Share your wins, ask questions, and connect with fellow members.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isPinned: true,
  },
  {
    id: 'post-2',
    type: 'thread',
    authorId: 'user-client-1',
    content: 'Just hit a new PR on deadlifts! 405lbs 💪 Feeling stronger every week!',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'post-3',
    type: 'thread',
    authorId: 'user-client-2',
    content: 'Question for the group: What are your favorite pre-workout meals?',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const seedComments: Comment[] = [
  {
    id: 'comment-1',
    postId: 'post-2',
    authorId: 'user-trainer-1',
    content: 'Incredible work Mike! Your form has improved so much! 🔥',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
  },
  {
    id: 'comment-2',
    postId: 'post-3',
    authorId: 'user-client-1',
    content: 'I usually go with oatmeal and a banana about 90 mins before training',
    createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
  },
];

export const seedReactions: Reaction[] = [
  { id: 'reaction-1', postId: 'post-1', userId: 'user-client-1', emoji: '🎉' },
  { id: 'reaction-2', postId: 'post-2', userId: 'user-trainer-1', emoji: '💪' },
  { id: 'reaction-3', postId: 'post-2', userId: 'user-client-2', emoji: '🔥' },
];

// ==================== EVENTS ====================
export const seedEvents: Event[] = [
  {
    id: 'event-1',
    title: 'Summer Strength Challenge',
    description: 'Join us for our annual strength challenge! Test your 1RM on the big 3 lifts.',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '10:00 AM',
    location: 'Main Gym',
    price: 25,
    capacity: 50,
    ticketUrl: 'https://example.com/buy-ticket/event-1',
  },
  {
    id: 'event-2',
    title: 'Nutrition Workshop with Dr. Smith',
    description: 'Learn the fundamentals of sports nutrition and meal planning for optimal performance.',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '6:00 PM',
    location: 'Conference Room A',
    price: 15,
    capacity: 30,
    ticketUrl: 'https://example.com/buy-ticket/event-2',
  },
];

export const seedEventRegistrations: EventRegistration[] = [];

// ==================== AFFILIATE STORE ====================
export const seedAffiliateProducts: AffiliateProduct[] = [
  {
    id: 'prod-1',
    title: 'Premium Whey Protein',
    brand: 'ProSupps',
    price: 49.99,
    imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400',
    url: 'https://example.com/product/whey-protein',
    category: 'Supplements',
  },
  {
    id: 'prod-2',
    title: 'Lifting Straps Pro',
    brand: 'IronGrip',
    price: 24.99,
    imageUrl: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400',
    url: 'https://example.com/product/lifting-straps',
    category: 'Equipment',
  },
  {
    id: 'prod-3',
    title: 'Resistance Bands Set',
    brand: 'FitLoop',
    price: 34.99,
    imageUrl: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400',
    url: 'https://example.com/product/resistance-bands',
    category: 'Equipment',
  },
  {
    id: 'prod-4',
    title: 'Pre-Workout Energy',
    brand: 'BeastMode',
    price: 39.99,
    imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400',
    url: 'https://example.com/product/pre-workout',
    category: 'Supplements',
  },
];

export const seedAffiliateClicks: AffiliateClick[] = [];

export const seedPurchases: Purchase[] = [
  {
    id: 'purchase-1',
    externalId: 'whop-12345',
    productName: 'Monthly Membership',
    amount: 149,
    status: 'paid',
    source: 'whop',
    userEmail: 'newmember1@example.com',
    purchasedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'purchase-2',
    externalId: 'whop-12346',
    productName: 'Monthly Membership',
    amount: 149,
    status: 'paid',
    source: 'whop',
    userEmail: 'newmember2@example.com',
    purchasedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ==================== CREATORS ====================
export const seedCreators: Creator[] = [
  {
    id: 'creator-1',
    name: 'Jordan Blake',
    handle: '@jordanblake',
    avatarUrl: 'https://i.pravatar.cc/150?img=20',
    niches: ['Fitness', 'Nutrition', 'Lifestyle'],
    minRate: 500,
    maxRate: 2000,
    bio: 'Fitness content creator with 500K followers. Specializing in workout tutorials and nutrition tips.',
  },
  {
    id: 'creator-2',
    name: 'Taylor Swift',
    handle: '@taylorfit',
    avatarUrl: 'https://i.pravatar.cc/150?img=21',
    niches: ['Powerlifting', 'Strength'],
    minRate: 750,
    maxRate: 3000,
    bio: 'Competitive powerlifter and coach. Love creating educational content about proper form.',
  },
  {
    id: 'creator-3',
    name: 'Casey Morgan',
    handle: '@caseymoves',
    avatarUrl: 'https://i.pravatar.cc/150?img=22',
    niches: ['Yoga', 'Mobility', 'Wellness'],
    minRate: 400,
    maxRate: 1500,
    bio: 'Yoga instructor and mobility specialist. Creating calming, educational content.',
  },
];

export const seedBriefs: Brief[] = [
  {
    id: 'brief-1',
    title: 'Summer Training Series',
    goals: ['Brand Awareness', 'Lead Generation'],
    budgetMin: 1000,
    budgetMax: 3000,
    dueBy: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const seedProposals: Proposal[] = [
  {
    id: 'proposal-1',
    briefId: 'brief-1',
    creatorId: 'creator-1',
    pitch: 'I can create a 5-part series showcasing your training methodology with before/after transformations.',
    rate: 1500,
    status: 'pending',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const seedDeliverables: Deliverable[] = [];
export const seedPayouts: Payout[] = [];

// ==================== GOALS & PROGRESS ====================
export const seedGoals: Goal[] = [
  {
    id: 'goal-1',
    userId: 'user-client-1',
    name: 'Train 3x per week',
    unit: 'sessions',
    target: 3,
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'goal-2',
    userId: 'user-client-2',
    name: 'Train 4x per week',
    unit: 'sessions',
    target: 4,
    isActive: true,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const seedGoalEntries: GoalEntry[] = [
  {
    id: 'entry-1',
    goalId: 'goal-1',
    userId: 'user-client-1',
    type: 'completed',
    rpe: 'right',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'entry-2',
    goalId: 'goal-1',
    userId: 'user-client-1',
    type: 'completed',
    rpe: 'right',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'entry-3',
    goalId: 'goal-1',
    userId: 'user-client-1',
    type: 'completed',
    rpe: 'hard',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
];

export const seedSessions: Session[] = [
  {
    id: 'session-1',
    trainerId: 'user-trainer-1',
    clientId: 'user-client-1',
    date: today,
    time: '14:00',
    status: 'scheduled',
    type: 'Personal Training',
  },
  {
    id: 'session-2',
    trainerId: 'user-trainer-1',
    clientId: 'user-client-2',
    date: today,
    time: '16:00',
    status: 'scheduled',
    type: 'Personal Training',
  },
];

export const seedClientProgress: ClientProgress[] = [
  {
    userId: 'user-client-1',
    weeklyTarget: 3,
    completedThisWeek: 2,
    streak: 4,
    lastCheckIn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    userId: 'user-client-2',
    weeklyTarget: 4,
    completedThisWeek: 3,
    streak: 2,
    lastCheckIn: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    userId: 'user-client-3',
    weeklyTarget: 3,
    completedThisWeek: 1,
    streak: 1,
    lastCheckIn: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
];

// ==================== AI INBOX ====================
export const seedInboxDrafts: InboxDraft[] = [
  {
    id: 'draft-1',
    triggerType: 'streak_protect',
    targetUserId: 'user-client-3',
    subject: "You're on a roll - let's keep it going!",
    previewText: "I noticed you haven't checked in yet this week...",
    fullContent: "Hey James! I noticed you haven't checked in yet this week. You've been doing amazing with your consistency - let's keep that momentum going! Want to schedule a session for this week?",
    status: 'needs_review',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'draft-2',
    triggerType: 'pre_session',
    targetUserId: 'user-client-1',
    subject: 'Ready for your session today?',
    previewText: "Looking forward to seeing you at 2pm...",
    fullContent: "Hey Mike! Looking forward to seeing you at 2pm today. Remember to bring your water bottle and we'll be working on that new deadlift technique we discussed!",
    status: 'scheduled',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  },
];

// ==================== ANALYTICS ====================
export const seedMetrics: MetricSnapshot[] = [
  {
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paidToBooked72h: 68,
    showRate: 88,
    newMembers: 3,
    affiliateGMV: 1245,
    creatorROI: 2.4,
  },
  {
    date: today,
    paidToBooked72h: 72,
    showRate: 92,
    newMembers: 5,
    affiliateGMV: 1680,
    creatorROI: 2.8,
  },
];
