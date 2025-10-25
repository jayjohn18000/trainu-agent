# TrainU AI Agent - API Integration Guide

## 🎯 Overview

This document describes the complete API integration for the TrainU AI Agent platform, including database schema, edge functions, and frontend hooks.

## 📊 Database Schema

### Tables

#### `trainer_profiles`
Stores trainer progress and gamification data.
```sql
- id (uuid, primary key, references auth.users)
- xp (integer, default: 0)
- level (integer, default: 1)
- current_streak (integer, default: 0)
- longest_streak (integer, default: 0)
- total_messages_approved (integer, default: 0)
- total_messages_edited (integer, default: 0)
- total_clients_nudged (integer, default: 0)
- last_active_date (date)
- created_at, updated_at (timestamps)
```

#### `queue_items`
AI-generated message drafts awaiting review.
```sql
- id (uuid, primary key)
- trainer_id (uuid, references trainer_profiles)
- client_id (uuid)
- client_name (text)
- preview (text) - message content
- confidence (numeric, default: 0.8)
- status (text: 'review' | 'approved' | 'edited')
- why (text[]) - reasons for suggestion
- scheduled_for (timestamp)
- created_at, updated_at (timestamps)
```

#### `activity_feed`
Historical record of agent actions.
```sql
- id (uuid, primary key)
- trainer_id (uuid, references trainer_profiles)
- action (text: 'drafted' | 'sent' | 'edited')
- client_id (uuid)
- client_name (text)
- status (text: 'success' | 'error')
- why (text) - reason/context
- message_preview (text)
- confidence (numeric)
- created_at (timestamp)
```

#### `agent_status`
Current state of the AI agent.
```sql
- id (uuid, primary key)
- trainer_id (uuid, references trainer_profiles)
- state (text: 'active' | 'paused')
- messages_sent_today (integer, default: 0)
- clients_at_risk (integer, default: 0)
- response_rate (numeric, default: 0)
- avg_response_time (text, default: '2h')
- updated_at (timestamp)
```

#### `message_templates`
Reusable message templates.
```sql
- id (uuid, primary key)
- trainer_id (uuid)
- name (text)
- content (text)
- tone (text: 'casual' | 'professional' | 'friendly')
- category (text)
- usage_count (integer, default: 0)
- created_at, updated_at (timestamps)
```

#### `trainer_achievements`
Unlocked achievements.
```sql
- id (uuid, primary key)
- trainer_id (uuid)
- achievement_id (text)
- achievement_name (text)
- achievement_description (text)
- unlocked_at (timestamp)
```

#### `xp_history`
Transaction log of XP awards.
```sql
- id (uuid, primary key)
- trainer_id (uuid)
- amount (integer) - can be negative for penalties
- reason (text)
- created_at (timestamp)
```

### Row-Level Security (RLS)

All tables have RLS enabled with policies ensuring trainers can only:
- SELECT their own data
- INSERT their own data
- UPDATE their own data
- DELETE their own data (where applicable)

## 🔌 Edge Functions

### 1. `gamification`

**Purpose:** Manage trainer XP, levels, and achievements

**Endpoints:**

#### GET `?action=getProgress`
Returns current trainer progress.

**Response:**
```typescript
{
  level: number;
  xp: number;
  nextLevelXp: number;
  progress: number;
  currentStreak: number;
  longestStreak: number;
}
```

#### POST `?action=awardXP`
Award XP and check for level ups and achievements.

**Request:**
```typescript
{
  amount: number;
  reason: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
  newAchievements: Achievement[];
}
```

#### GET `?action=getAchievements`
Get all achievements with unlock status.

**Response:**
```typescript
{
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
    unlockedAt?: string;
    progress: number;
  }>;
}
```

### 2. `queue-management`

**Purpose:** Handle queue item operations

**Endpoints:**

#### GET `?action=getQueue`
Fetch pending queue items.

**Response:**
```typescript
QueueItem[]
```

#### POST `?action=approve`
Approve and send a message.

**Request:**
```typescript
{
  id: string; // queue item id
}
```

#### POST `?action=edit`
Edit a queue item message.

**Request:**
```typescript
{
  id: string;
  message: string;
  tone?: string;
}
```

#### POST `?action=batchApprove`
Approve all high-confidence items.

**Request:**
```typescript
{
  minConfidence: number; // default: 0.8
}
```

**Response:**
```typescript
{
  approved: number; // count of approved items
}
```

### 3. `agent-status`

**Purpose:** Manage agent state

#### GET
Get current agent status.

**Response:**
```typescript
{
  state: 'active' | 'paused';
  messagesSentToday: number;
  clientsAtRisk: number;
  responseRate: number;
  avgResponseTime: string;
}
```

#### POST
Update agent state.

**Request:**
```typescript
{
  state: 'active' | 'paused';
}
```

### 4. `agent-queue`

**Purpose:** Fetch queue items

#### GET
Returns formatted queue items.

### 5. `agent-feed`

**Purpose:** Fetch activity feed

#### GET
Returns formatted activity feed items.

## 🪝 Frontend API Hooks

### `useTrainerGamification()`

Hook for managing trainer XP and levels.

**Usage:**
```typescript
const { 
  progress,         // Current progress state
  xpNotification,   // Active XP notification
  levelUpNotification, // Active level up notification
  awardXP,          // Function to award XP
  loading           // Loading state
} = useTrainerGamification();

// Award XP
await awardXP(25, "Approved message");
```

**Features:**
- Real-time sync with database
- Automatic level calculations
- XP and level-up notifications
- Achievement tracking integration

## 🔄 Real-time Subscriptions

The app uses Supabase Realtime to sync data automatically:

### Queue Items
```typescript
const queueChannel = supabase
  .channel('queue-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'queue_items',
  }, () => {
    loadQueue();
  })
  .subscribe();
```

### Activity Feed
```typescript
const feedChannel = supabase
  .channel('feed-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'activity_feed',
  }, () => {
    loadFeed();
  })
  .subscribe();
```

### Trainer Profile (for XP updates)
```typescript
const channel = supabase
  .channel('trainer-progress')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'trainer_profiles',
  }, () => {
    loadProgress();
  })
  .subscribe();
```

## 📈 XP Rewards System

```typescript
export const XP_REWARDS = {
  APPROVE_MESSAGE: 25,
  BATCH_APPROVE: 75,        // bonus for 3+ items
  EDIT_MESSAGE: 50,
  REGENERATE_MESSAGE: 25,
  ENGAGE_AT_RISK: 100,      // client responds within 24h
  CLIENT_RESPONDS: 150,
  CLIENT_BOOKS: 200,
  SEVEN_DAY_STREAK: 300,    // 7 days of approvals
  UNDO_MESSAGE: -10,        // small penalty
};
```

## 🎖️ Level System

Trainers progress through 20 levels across 4 tiers:

1. **Rookie Agent** (Levels 1-5)
2. **Agent Apprentice** (Levels 6-10)
3. **Agent Master** (Levels 11-15)
4. **Agent Legend** (Levels 16-20)

XP requirements increase exponentially with level.

## 🏆 Achievement System

Achievements are checked on each XP award:
- First message approved
- 10, 50, 100 messages approved
- 10 messages edited
- Level milestones (5, 10)
- Streak milestones (7, 30 days)

## 🔒 Security

### Authentication
All edge functions require authentication via JWT token:
```typescript
const { data: { user }, error } = await supabase.auth.getUser();
if (error || !user) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
  });
}
```

### RLS Policies
Every table has RLS enabled ensuring data isolation by trainer_id.

### Search Path
All functions use `SET search_path = 'public'` for security.

## 📊 Analytics Integration

The app tracks key events:
- Page views
- Queue actions (approve, edit, batch)
- XP earned
- Level ups
- Keyboard shortcuts used
- Client interactions

All analytics calls are non-blocking and fail gracefully.

## 🚀 Performance Optimizations

1. **Code Splitting:** Routes lazy-loaded
2. **Memoization:** Queue lists and cards memoized
3. **Skeleton Loaders:** Immediate visual feedback
4. **Realtime Updates:** Instant sync across sessions
5. **Batch Operations:** Efficient bulk approvals
6. **Rate Limiting:** Built into API client

## 🧪 Testing

To test the integration:

1. **Queue Operations:**
   - Approve a message
   - Edit a message
   - Batch approve multiple items

2. **Gamification:**
   - Check XP awards
   - Verify level progression
   - Test achievement unlocks

3. **Realtime Sync:**
   - Open app in two tabs
   - Make changes in one
   - Verify updates in other

4. **Error Handling:**
   - Disconnect network
   - Verify retry logic
   - Check error messages

## 📝 Next Steps

1. Add authentication UI (login/signup)
2. Connect to real AI model for message generation
3. Add client data management
4. Implement message templates
5. Add notification preferences
6. Create admin dashboard
