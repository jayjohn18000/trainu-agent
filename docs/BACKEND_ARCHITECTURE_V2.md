# 🔧 CURSOR.DEV PROMPT: TrainU Backend Architecture & Integration Build (V2.0)

**Status:** Ready to paste into Cursor Chat  

**Scope:** Backend architecture + integration adapter pattern + AI insights engine  

**Focus:** Mindbody OAuth, data normalization, insight generation, agent workflow  

**Tech Stack:** Deno Edge Functions + Supabase PostgreSQL + TypeScript + Gemini API  

---

## INSTRUCTIONS FOR CURSOR

**Context:** You are architecting the backend for TrainU, an AI-powered retention platform for fitness trainers. The backend needs to handle multi-source data integration (starting with Mindbody), normalize it into a unified schema, generate AI insights using Gemini, and manage an agent workflow for trainer-editable action lists.

**Current Backend State:**

- ✅ Supabase Auth (JWT-based)

- ✅ GHL OAuth + sync (50+ edge functions)

- ✅ PostgreSQL schema (contacts, messages, bookings, programs, etc.)

- ❌ NO Mindbody integration yet

- ❌ NO insight generation engine

- ❌ NO integration adapter pattern

**Your Job:**

1. Design the Mindbody OAuth adapter (reusable pattern for Trainerize/TrueCoach later)

2. Build the insight generation engine (churn scoring + root-cause analysis)

3. Create AI agent workflow (Gemini tool-calling with editable action lists)

4. Plan the integration manager (abstraction layer for all platforms)

5. Design metrics calculation engine (time saved, churn prevented, etc.)

**Target Deliverable:**

- Production-ready Mindbody integration by end of Phase 1 (3-4 weeks)

- Reusable adapter pattern for Phase 2 (Trainerize, TrueCoach)

- Clean separation: integration layer ≠ business logic ≠ AI engine

---

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────┐
│                     React Frontend (Lovable)                │
└─────────────────────────────────────────────────────────────────────┘
                               │
                    Supabase REST API
                    + Realtime Subscriptions
                               │
         ┌──────────────────────┼──────────────────────┐
         │                     │                     │
    ┌────┴────┐         ┌──────┴──────┐      ┌───────┴──────┐
    │   Auth      │         │  Database  │      │ Real-time │
    │  (JWT)      │         │ (RLS)      │      │           │
    └────────────┘         └────────────┘      └───────────┘
         │
    ┌────┴────────────────────────────────────────────────────────────┐
    │          INTEGRATION ADAPTER LAYER (New)             │
    ├─────────────────────────────────────────────────────────────────┤
    │                                                     │
    │  ┌─────────────────────────────────────────────┐       │
    │  │  Mindbody Adapter                       │       │
    │  │  • OAuth handler (mindbody-oauth-init)  │       │
    │  │  • Data sync (mindbody-sync)            │       │
    │  │  • Normalizer (→ unified schema)        │       │
    │  │  • Error handling + retry               │       │
    │  └─────────────────────────────────────────────┘       │
    │                                                     │
    │  ┌─────────────────────────────────────────────┐       │
    │  │  [Trainerize Adapter] (Phase 2)         │       │
    │  └─────────────────────────────────────────────┘       │
    │                                                     │
    │  ┌─────────────────────────────────────────────┐       │
    │  │  [TrueCoach Adapter] (Phase 2)          │       │
    │  └─────────────────────────────────────────────┘       │
    │                                                     │
    └─────────────────────────────────────────────────────┘
         │
    ┌────┴────────────────────────────────────────────────────────────┐
    │          INSIGHT ENGINE LAYER (New)                 │
    ├─────────────────────────────────────────────────────────────────┤
    │                                                     │
    │  ┌─────────────────────────────────────────────┐       │
    │  │  Churn Risk Calculator                  │       │
    │  │  • Inputs: attendance, payment, engagement │   │
    │  │  • Output: risk_score (0-100)           │       │
    │  └─────────────────────────────────────────────┘       │
    │                                                     │
    │  ┌─────────────────────────────────────────────┐       │
    │  │  AI Insight Generator                   │       │
    │  │  • Analyzes client multi-source data    │       │
    │  │  • Generates insights via Gemini API    │       │
    │  │  • Tool-calling for action generation   │       │
    │  └─────────────────────────────────────────────┘       │
    │                                                     │
    │  ┌─────────────────────────────────────────────┐       │
    │  │  Agent Workflow Engine                  │       │
    │  │  • Generates editable action lists      │       │
    │  │  • Trainer approval workflow            │       │
    │  │  • Action execution (GHL push)          │       │
    │  └─────────────────────────────────────────────┘       │
    │                                                     │
    │  ┌─────────────────────────────────────────────┐       │
    │  │  Metrics Calculator                     │       │
    │  │  • Time saved scoring                   │       │
    │  │  • Churn prevented estimation           │       │
    │  │  • Compliance trending                  │       │
    │  └─────────────────────────────────────────────┘       │
    │                                                     │
    └─────────────────────────────────────────────────────┘
         │
    ┌────┴────────────────────────────────────────────────────────────┐
    │       ORCHESTRATION LAYER (Existing + New)          │
    ├─────────────────────────────────────────────────────────────────┤
    │                                                     │
    │  ┌─────────────────────────────────────────────┐       │
    │  │  Webhook Handlers                       │       │
    │  │  • mindbody-webhook (attendance updates)│       │
    │  │  • ghl-webhook (existing)               │       │
    │  │  • Trigger insight recalc               │       │
    │  └─────────────────────────────────────────────┘       │
    │                                                     │
    │  ┌─────────────────────────────────────────────┐       │
    │  │  Periodic Sync Jobs (pg_cron)           │       │
    │  │  • mindbody-sync-hourly                 │       │
    │  │  • daily-draft-generator (refresh)      │       │
    │  │  • ghl-periodic-sync (existing)         │       │
    │  └─────────────────────────────────────────────┘       │
    │                                                     │
    └─────────────────────────────────────────────────────┘
         │
    ┌────┴────────────────────────────────────────────────────────────┐
    │       EXTERNAL SERVICES                             │
    ├─────────────────────────────────────────────────────────────────┤
    │                                                     │
    │  • Mindbody REST API (OAuth)                       │
    │  • GoHighLevel API (existing)                      │
    │  • Gemini API (LLM for insights)                   │
    │  • Stripe (payments - existing)                    │
    │                                                     │
    └─────────────────────────────────────────────────────────────────┘
```

---

## PHASE 1 IMPLEMENTATION ROADMAP (MVP)

### Week 1: Foundation

- [ ] Design Mindbody adapter interface + OAuth flow

- [ ] Create `mindbody-config` table in PostgreSQL

- [ ] Build `mindbody-oauth-init` function (OAuth start)

- [ ] Build `oauth-callback` function (token exchange)

- [ ] Build simple `mindbody-sync` function (test with sandbox)

- [ ] Add error handling + retry logic

### Week 2: Data Normalization

- [ ] Extend `contacts` table with `source` + `external_id` fields

- [ ] Build Mindbody → Unified schema normalizer

- [ ] Create `contact_sources` junction table (track multi-source data)

- [ ] Build `mindbody-webhook` function (real-time attendance updates)

- [ ] Test end-to-end sync (Mindbody → DB → Frontend)

### Week 3: Insight Engine

- [ ] Design insight generation schema (`insights`, `insight_actions` tables)

- [ ] Build churn risk calculator (attendance + payment + engagement)

- [ ] Build AI insight generator (Gemini API integration)

- [ ] Build agent action executor (GHL push + tag + SMS)

- [ ] Build `ai-agent` edge function with tool-calling

### Week 4: Polish + Testing

- [ ] Metrics dashboard backend (time saved, churn prevented)

- [ ] Integration status endpoint

- [ ] Error logging + audit trail

- [ ] Rate limiting for Mindbody API

- [ ] E2E testing with real Mindbody sandbox

---

## DATABASE SCHEMA UPDATES

### New Tables

#### `mindbody_config` (OAuth credentials storage)

```sql
CREATE TABLE mindbody_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- OAuth Tokens
  access_token text NOT NULL ENCRYPTED,
  refresh_token text ENCRYPTED,
  expires_at timestamp with time zone,
  
  -- Mindbody Account Info
  mindbody_account_id text NOT NULL,
  mindbody_location_id text NOT NULL,
  
  -- Sync Config
  last_sync_at timestamp with time zone,
  sync_status text DEFAULT 'idle', -- idle, syncing, error
  sync_error_message text,
  
  -- Audit
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(trainer_id, mindbody_account_id)
);

CREATE INDEX idx_mindbody_config_trainer ON mindbody_config(trainer_id);
```

#### `contact_sources` (Multi-source client tracking)

```sql
CREATE TABLE contact_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  
  source text NOT NULL, -- 'ghl', 'mindbody', 'trainerize', 'truecoach'
  external_id text NOT NULL, -- Mindbody client ID, etc.
  
  -- Last sync metadata
  synced_at timestamp with time zone,
  data_hash text, -- Hash of last synced data for change detection
  
  -- Data from this source
  source_data jsonb, -- Raw/normalized data from source
  
  UNIQUE(contact_id, source),
  UNIQUE(source, external_id)
);

CREATE INDEX idx_contact_sources_source ON contact_sources(source);
```

#### `insights` (AI-generated insights)

```sql
CREATE TABLE insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  trainer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Insight metadata
  insight_type text NOT NULL, -- 'churn_risk', 'engagement_drop', 'compliance_opportunity'
  risk_score integer, -- 0-100 for churn insights
  confidence_score float, -- 0-1
  
  -- Analysis
  root_causes text[], -- Array of identified causes
  root_causes_detail jsonb, -- Detailed analysis per cause
  
  -- Recommendations
  recommended_actions jsonb, -- Array of action objects
  
  -- Source data references
  source_data_snapshot jsonb, -- Client data used for analysis
  
  -- Lifecycle
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone, -- Insights auto-expire after 30 days
  status text DEFAULT 'new', -- new, approved, dismissed, executed
  
  -- Audit
  generated_by text DEFAULT 'ai-agent', -- 'ai-agent' or trainer name
  
  UNIQUE(contact_id, insight_type, created_at::date)
);

CREATE INDEX idx_insights_trainer ON insights(trainer_id);
CREATE INDEX idx_insights_status ON insights(status);
```

#### `insight_actions` (Editable action list)

```sql
CREATE TABLE insight_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id uuid NOT NULL REFERENCES insights(id) ON DELETE CASCADE,
  
  -- Action metadata
  action_type text NOT NULL, -- 'sms', 'tag', 'goal', 'payment_follow_up', 'custom'
  action_text text NOT NULL,
  action_parameters jsonb, -- {sms_body, tag_name, goal_id, etc.}
  
  -- Trainer editing
  is_approved boolean DEFAULT false,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamp with time zone,
  
  -- Execution
  is_executed boolean DEFAULT false,
  executed_at timestamp with time zone,
  execution_result jsonb, -- {status, response_id, error_message}
  
  -- Audit
  original_text text, -- AI-generated text before edits
  edited_text text, -- Trainer-edited text if different
  edited_by uuid REFERENCES auth.users(id),
  edited_at timestamp with time zone,
  
  order_index integer, -- Position in action list
  
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_insight_actions_insight ON insight_actions(insight_id);
```

#### `integration_status` (Sync health dashboard)

```sql
CREATE TABLE integration_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  integration_name text NOT NULL, -- 'mindbody', 'trainerize', 'ghl', etc.
  
  -- Status
  connection_status text DEFAULT 'disconnected', -- connected, disconnected, error, syncing
  last_sync_at timestamp with time zone,
  next_sync_at timestamp with time zone,
  
  -- Error tracking
  last_error text,
  last_error_at timestamp with time zone,
  error_count integer DEFAULT 0,
  
  -- Record counts
  records_synced integer DEFAULT 0,
  records_updated integer DEFAULT 0,
  
  -- Health
  sync_duration_ms integer, -- How long last sync took
  api_calls_used integer, -- For rate limiting
  
  UNIQUE(trainer_id, integration_name)
);

CREATE INDEX idx_integration_status_trainer ON integration_status(trainer_id);
```

#### `metrics_snapshots` (Daily metrics for dashboard)

```sql
CREATE TABLE metrics_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  snapshot_date date NOT NULL,
  
  -- Hours saved
  hours_saved_estimate float,
  
  -- Churn prevention
  churn_risk_clients_flagged integer,
  churn_risk_clients_recovered integer, -- Flagged then didn't churn
  
  -- Compliance
  avg_client_compliance_rate float,
  active_programs_count integer,
  
  -- Insights
  insights_generated integer,
  insights_approved integer,
  
  -- Engagement
  clients_engaged_this_week integer,
  
  created_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(trainer_id, snapshot_date)
);

CREATE INDEX idx_metrics_snapshots_trainer ON metrics_snapshots(trainer_id);
```

### Schema Modifications to Existing Tables

#### Extend `contacts` table

```sql
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS risk_score integer DEFAULT 0;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS compliance_rate float DEFAULT 0;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS last_insight_at timestamp with time zone;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS data_completeness float DEFAULT 0; -- % of integrations with data

-- Denormalize for performance
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS mindbody_id text UNIQUE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS trainerize_id text UNIQUE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS truecoach_id text UNIQUE;
```

---

## EDGE FUNCTIONS: MINDBODY INTEGRATION

### 1. `mindbody-oauth-init` (START OAuth flow)

**Purpose:** Redirect trainer to Mindbody OAuth consent screen

```typescript
// supabase/functions/mindbody-oauth-init/index.ts

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const MINDBODY_CLIENT_ID = Deno.env.get("MINDBODY_CLIENT_ID");
const MINDBODY_REDIRECT_URI = Deno.env.get("MINDBODY_REDIRECT_URI"); // https://your-domain/auth/mindbody/callback

serve(async (req) => {
  const { trainer_id } = await req.json();

  if (!trainer_id) {
    return new Response(JSON.stringify({ error: "Missing trainer_id" }), {
      status: 400,
    });
  }

  // Generate OAuth URL
  const params = new URLSearchParams({
    client_id: MINDBODY_CLIENT_ID,
    response_type: "code",
    redirect_uri: MINDBODY_REDIRECT_URI,
    scope: "attendance,clients,memberships,services", // Mindbody scopes
    state: trainer_id, // Pass trainer_id through OAuth state
  });

  const oauth_url = `https://api.mindbodyonline.com/oauth/authorize?${params.toString()}`;

  return new Response(JSON.stringify({ oauth_url }), { status: 200 });
});
```

### 2. `oauth-callback` (EXCHANGE code for token)

**Purpose:** Handle OAuth redirect from Mindbody; exchange auth code for access token

```typescript
// supabase/functions/oauth-callback/index.ts

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const MINDBODY_CLIENT_ID = Deno.env.get("MINDBODY_CLIENT_ID");
const MINDBODY_CLIENT_SECRET = Deno.env.get("MINDBODY_CLIENT_SECRET");

serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state"); // trainer_id
  const platform = url.searchParams.get("platform"); // 'mindbody'

  if (!code || !state) {
    return new Response(JSON.stringify({ error: "Missing auth code or state" }), {
      status: 400,
    });
  }

  try {
    // Exchange code for token
    const token_response = await fetch("https://api.mindbodyonline.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: MINDBODY_CLIENT_ID,
        client_secret: MINDBODY_CLIENT_SECRET,
        redirect_uri: Deno.env.get("MINDBODY_REDIRECT_URI"),
      }).toString(),
    });

    const tokens = await token_response.json();

    if (!tokens.access_token) {
      throw new Error("No access token received");
    }

    // Store in mindbody_config table
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: account_info } = await fetch("https://api.mindbodyonline.com/v6/account", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    }).then((r) => r.json());

    await supabase.from("mindbody_config").upsert({
      trainer_id: state,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      mindbody_account_id: account_info.id,
      mindbody_location_id: account_info.defaultLocationId,
      last_sync_at: new Date().toISOString(),
    });

    // Redirect to dashboard
    return new Response(null, {
      status: 302,
      headers: { Location: "/integrations?success=mindbody" },
    });
  } catch (error) {
    console.error("OAuth error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
```

### 3. `mindbody-sync` (PULL data from Mindbody)

**Purpose:** Sync clients, attendance, memberships from Mindbody

```typescript
// supabase/functions/mindbody-sync/index.ts

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

interface MindbodyClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  membershipStatus: "Active" | "Inactive" | "Paused";
  membershipType: string;
  lastVisit?: string;
  paymentStatus: "Current" | "Overdue" | "Late";
}

serve(async (req) => {
  const { trainer_id } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 1. Get Mindbody config
  const { data: config } = await supabase
    .from("mindbody_config")
    .select("*")
    .eq("trainer_id", trainer_id)
    .single();

  if (!config || !config.access_token) {
    throw new Error("Mindbody not connected");
  }

  // 2. Check if token expired; refresh if needed
  if (new Date(config.expires_at) < new Date()) {
    await refreshMindbodyToken(supabase, trainer_id, config);
  }

  // 3. Fetch clients from Mindbody API
  const clients = await fetchMindbodyClients(config.access_token, config.mindbody_location_id);

  // 4. Normalize and store
  for (const mb_client of clients) {
    // Upsert into contacts table
    const { data: contact } = await supabase
      .from("contacts")
      .upsert({
        trainer_id,
        external_id: mb_client.id,
        first_name: mb_client.firstName,
        last_name: mb_client.lastName,
        email: mb_client.email,
        phone: mb_client.phoneNumber,
        mindbody_id: mb_client.id,
        membership_status: mb_client.membershipStatus.toLowerCase(),
        payment_status: mb_client.paymentStatus.toLowerCase(),
      })
      .select()
      .single();

    // Upsert into contact_sources
    await supabase.from("contact_sources").upsert({
      contact_id: contact.id,
      source: "mindbody",
      external_id: mb_client.id,
      source_data: mb_client,
      synced_at: new Date().toISOString(),
    });
  }

  // 5. Fetch attendance for clients
  const attendance = await fetchMindbodyAttendance(
    config.access_token,
    config.mindbody_location_id
  );

  // Store attendance records (if needed for insights)
  // ...

  // 6. Update sync status
  await supabase.from("mindbody_config").update({
    last_sync_at: new Date().toISOString(),
    sync_status: "idle",
  }).eq("trainer_id", trainer_id);

  // 7. Trigger insight recalculation
  // await recalculateInsights(supabase, trainer_id);

  return new Response(JSON.stringify({ success: true, synced: clients.length }), {
    status: 200,
  });
});

async function fetchMindbodyClients(
  access_token: string,
  location_id: string
): Promise<MindbodyClient[]> {
  const response = await fetch(`https://api.mindbodyonline.com/v6/clients?locationId=${location_id}`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!response.ok) throw new Error("Failed to fetch Mindbody clients");
  const data = await response.json();
  return data.clients || [];
}

async function fetchMindbodyAttendance(
  access_token: string,
  location_id: string
): Promise<any[]> {
  // Similar to fetchMindbodyClients but for attendance endpoint
  // https://api.mindbodyonline.com/v6/appointments?locationId=...&filters[limit]=500
  // ...
  return [];
}

async function refreshMindbodyToken(supabase: any, trainer_id: string, config: any) {
  // Exchange refresh token for new access token
  const response = await fetch("https://api.mindbodyonline.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: config.refresh_token,
      client_id: Deno.env.get("MINDBODY_CLIENT_ID")!,
      client_secret: Deno.env.get("MINDBODY_CLIENT_SECRET")!,
    }).toString(),
  });

  const tokens = await response.json();

  await supabase
    .from("mindbody_config")
    .update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    })
    .eq("trainer_id", trainer_id);
}
```

### 4. `mindbody-webhook` (LISTEN for real-time updates)

**Purpose:** Receive real-time webhooks from Mindbody (attendance, membership changes)

```typescript
// supabase/functions/mindbody-webhook/index.ts

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { verifyWebhookSignature } from "./_shared/mindbody-verify.ts";

serve(async (req) => {
  if (req.method !== "POST") return new Response(null, { status: 405 });

  const body = await req.json();
  const signature = req.headers.get("x-signature");

  // Verify webhook signature
  if (!verifyWebhookSignature(body, signature, Deno.env.get("MINDBODY_WEBHOOK_SECRET")!)) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Handle event types
  const event_type = body.type; // e.g., "appointment.completed", "membership.created"

  switch (event_type) {
    case "appointment.completed":
      // Log attendance
      await supabase
        .from("contacts")
        .update({ last_activity: new Date().toISOString() })
        .eq("mindbody_id", body.data.clientId);
      break;

    case "membership.created":
    case "membership.updated":
      // Update membership status
      await supabase
        .from("contacts")
        .update({
          membership_status: body.data.status.toLowerCase(),
        })
        .eq("mindbody_id", body.data.clientId);
      break;

    case "payment.processed":
    case "payment.failed":
      // Update payment status
      await supabase
        .from("contacts")
        .update({
          payment_status: body.data.status.toLowerCase(),
        })
        .eq("mindbody_id", body.data.clientId);
      break;
  }

  // Trigger insight recalculation if needed
  // await recalculateClientInsight(supabase, body.data.clientId);

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
```

---

## INSIGHT ENGINE FUNCTIONS

### 5. `ai-agent` (GENERATE insights)

**Purpose:** Analyze client data; generate root-cause insights; propose actions

```typescript
// supabase/functions/ai-agent/index.ts

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

interface ClientData {
  contact_id: string;
  name: string;
  mindbody_attendance: { last_30d: number; trend: "up" | "down" | "flat" };
  mindbody_payment_status: "current" | "late" | "overdue";
  ghl_message_response_rate: number;
  ghl_last_check_in: Date;
  trainerize_program_compliance?: number;
  trainerize_habits_adherence?: number;
  wearable_sleep_avg?: number;
}

serve(async (req) => {
  const { contact_id, trainer_id } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 1. Gather multi-source client data
  const client_data = await gatherClientData(supabase, contact_id, trainer_id);

  // 2. Calculate churn risk
  const risk_score = calculateChurnRisk(client_data);

  // 3. Call Gemini API with tool-calling
  const gemini_response = await callGeminiWithToolCalling(client_data, risk_score);

  // 4. Parse recommendations into actions
  const insight_actions = parseActionsFromGemini(gemini_response);

  // 5. Store insight + actions in DB
  const { data: insight } = await supabase
    .from("insights")
    .insert({
      contact_id,
      trainer_id,
      insight_type: "churn_risk",
      risk_score,
      root_causes: gemini_response.root_causes,
      root_causes_detail: gemini_response.analysis,
      recommended_actions: insight_actions.map((a) => ({
        type: a.type,
        text: a.text,
        params: a.params,
      })),
      source_data_snapshot: client_data,
      status: "new",
    })
    .select()
    .single();

  // 6. Create action items
  for (const action of insight_actions) {
    await supabase.from("insight_actions").insert({
      insight_id: insight.id,
      action_type: action.type,
      action_text: action.text,
      action_parameters: action.params,
      original_text: action.text,
      order_index: insight_actions.indexOf(action),
    });
  }

  return new Response(JSON.stringify({ insight_id: insight.id, risk_score }), {
    status: 200,
  });
});

async function gatherClientData(
  supabase: any,
  contact_id: string,
  trainer_id: string
): Promise<ClientData> {
  // Fetch from contacts, contact_sources, messages, etc.
  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", contact_id)
    .single();

  // Aggregate Mindbody data
  // Aggregate GHL data
  // Aggregate Trainerize data (if connected)
  // etc.

  return {
    contact_id,
    name: `${contact.first_name} ${contact.last_name}`,
    mindbody_attendance: {
      last_30d: contact.attendance_30d || 0,
      trend: contact.attendance_trend || "flat",
    },
    mindbody_payment_status: contact.payment_status || "current",
    ghl_message_response_rate: contact.response_rate || 0,
    ghl_last_check_in: contact.last_check_in || new Date(),
    trainerize_program_compliance: contact.compliance_rate || null,
    trainerize_habits_adherence: contact.habits_adherence || null,
    wearable_sleep_avg: contact.wearable_sleep_avg || null,
  };
}

function calculateChurnRisk(client: ClientData): number {
  let score = 0;

  // Attendance drop: +40 points
  if (client.mindbody_attendance.trend === "down") {
    score += 40;
  }

  // Payment overdue: +30 points
  if (client.mindbody_payment_status === "overdue") {
    score += 30;
  } else if (client.mindbody_payment_status === "late") {
    score += 15;
  }

  // Low message engagement: +20 points
  if (client.ghl_message_response_rate < 0.5) {
    score += 20;
  }

  // Poor program compliance: +15 points
  if (client.trainerize_program_compliance !== null && client.trainerize_program_compliance < 0.7) {
    score += 15;
  }

  // Low sleep: +10 points (recovery risk)
  if (client.wearable_sleep_avg !== null && client.wearable_sleep_avg < 6) {
    score += 10;
  }

  return Math.min(score, 100);
}

async function callGeminiWithToolCalling(
  client_data: ClientData,
  risk_score: number
): Promise<any> {
  const prompt = `
    Analyze this fitness client's engagement data and recommend actions.
    
    Client: ${client_data.name}
    Risk Score: ${risk_score}/100
    
    Data:
    - Attendance (30d): ${client_data.mindbody_attendance.last_30d} visits (trend: ${client_data.mindbody_attendance.trend})
    - Payment: ${client_data.mindbody_payment_status}
    - Message Response Rate: ${(client_data.ghl_message_response_rate * 100).toFixed(0)}%
    - Program Compliance: ${client_data.trainerize_program_compliance ? (client_data.trainerize_program_compliance * 100).toFixed(0) + "%" : "N/A"}
    - Sleep (avg): ${client_data.wearable_sleep_avg ? client_data.wearable_sleep_avg.toFixed(1) + "h" : "N/A"}
    
    Provide:
    1. Root cause analysis (array of 2-3 primary factors)
    2. Detailed analysis explaining each factor
    3. 3-4 recommended actions to prevent churn
    
    Format responses as:
    {
      "root_causes": ["cause1", "cause2"],
      "analysis": {"cause1": "explanation", ...},
      "actions": [
        {"type": "sms", "text": "..."},
        {"type": "goal", "text": "..."}
      ]
    }
  `;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
      tools: [
        {
          type: "function",
          function: {
            name: "analyze_client_churn",
            description: "Analyze client churn risk and recommend actions",
            parameters: {
              type: "object",
              properties: {
                root_causes: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of identified root causes",
                },
                analysis: {
                  type: "object",
                  description: "Detailed analysis per cause",
                },
                actions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: {
                        type: "string",
                        enum: ["sms", "tag", "goal", "payment_follow_up", "custom"],
                      },
                      text: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      ],
    }),
  });

  const data = await response.json();
  const tool_call = data.choices[0].message.tool_calls?.[0];

  return tool_call?.function?.arguments ? JSON.parse(tool_call.function.arguments) : {};
}

function parseActionsFromGemini(response: any): any[] {
  return response.actions || [];
}
```

---

## REMAINING FUNCTIONS (Brief Outlines)

### 6. `insight-actions-approve` (EXECUTE approved actions)

- Input: `insight_id`, `approved_actions` array

- Execute each action: SMS via GHL, tag via GHL, schedule goal, etc.

- Update `insight_actions.is_executed = true`

- Log to audit trail

### 7. `metrics-calculator` (DAILY job via pg_cron)

- Calculate "hours saved" (sum of time on insights)

- Calculate "churn prevented" (clients flagged but didn't churn)

- Calculate "avg compliance"

- Upsert into `metrics_snapshots`

### 8. `integration-status-reporter` (HOURLY job)

- Check each integration's sync status

- Update `integration_status` table

- Alert if errors exceed threshold

### 9. `daily-draft-generator` (DAILY job)

- For each active trainer

- Call `ai-agent` for top at-risk clients

- Generate fresh insights

- Push to frontend via Realtime

---

## API ENDPOINT SPECIFICATIONS

### REST Endpoints (via Supabase Auto-API)

#### GET `/rest/v1/insights?trainer_id=eq.[id]&status=eq.new`

Returns new insights for trainer (paginated)

#### POST `/rest/v1/insight-actions?insight_id=eq.[id]`

Approve/execute actions for insight

#### GET `/rest/v1/integration-status?trainer_id=eq.[id]`

Get sync status of all integrations

#### GET `/rest/v1/metrics-snapshots?trainer_id=eq.[id]&snapshot_date=gte.[date]`

Get metrics dashboard data

#### GET `/rest/v1/contact-sources?contact_id=eq.[id]`

Get all data sources for a client

---

## RATE LIMITING & ERROR HANDLING

### Mindbody API Rate Limits

- 300 calls/hour (need throttling)

- Implement exponential backoff on 429 errors

- Queue failed syncs with retry count

### Gemini API Rate Limits

- Standard tier: varies, implement token bucketing

- Cache insights within 24h (same risk profile = reuse)

### Error Handling Strategy

```typescript
// Generic retry wrapper
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  backoff = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((r) => setTimeout(r, backoff * Math.pow(2, i)));
    }
  }
}

// Log all errors to audit table
async function logError(
  supabase: any,
  trainer_id: string,
  integration: string,
  error: string
) {
  await supabase.from("integration_status").update({
    last_error: error,
    last_error_at: new Date().toISOString(),
    error_count: supabase.raw("error_count + 1"),
  });
}
```

---

## TESTING STRATEGY

### Unit Tests (Edge Functions)

- Test churn score calculation with mock data

- Test action parsing from Gemini response

- Test OAuth token refresh logic

### Integration Tests (Mindbody → DB)

- Spin up Mindbody sandbox environment

- Test full OAuth flow → sync → storage

- Verify data normalization (Mindbody schema → unified schema)

### E2E Tests (UI → Backend)

- Create test trainer account

- Connect real Mindbody sandbox

- Verify insights appear in Queue within 5 minutes

- Test editing actions + approval workflow

---

## DEPLOYMENT CHECKLIST

- [ ] Environment variables set (MINDBODY_CLIENT_ID, etc.)

- [ ] Database migrations applied

- [ ] Edge functions deployed

- [ ] Mindbody webhook registered (with signing key)

- [ ] Rate limiting configured

- [ ] Error alerting set up

- [ ] Seed data for testing

- [ ] Documentation updated

- [ ] Security review (OAuth, encryption, RLS)

---

**END OF CURSOR PROMPT**

Paste this entire prompt into Cursor Chat. It will generate the backend architecture, Edge Functions, and database schema based on these specifications. Reference the Product Spec for any feature questions.

**Key Deliverables from Cursor:**

1. Database migrations (new tables)

2. Mindbody OAuth adapter (4 functions)

3. Insight engine core (AI agent + churn scoring)

4. Action execution (approve + execute workflow)

5. Error handling + retry logic

6. Testing templates

