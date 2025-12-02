# 🎨 LOVABLE.DEV PROMPT: TrainU Insight Engine UI Redesign (V2.0)

**Status:** Ready to paste into Lovable Chat  

**Scope:** Full redesign of 7 pages + new components  

**Focus:** Analyst mode insights, editable action lists, integration status  

**Tech Stack:** React 18 + TypeScript + Tailwind + Shadcn/UI  

---

## INSTRUCTIONS FOR LOVABLE

**Context:** You are redesigning TrainU, an AI-powered retention platform for fitness trainers. The product is transitioning from a feature-rich app (with redundant GHL features) to a **pure insight engine** focused on preventing client churn through multi-source data analysis.

**Current State:** 

- Message Queue page works well (approval workflow)

- Clients page is basic (just name/status/risk)

- Programs page is mock data

- No Integrations page exists

- No metrics dashboard exists

- Home page exists but not optimized

**Design Direction:**

- Minimize redundancy with GoHighLevel (remove any UI that duplicates GHL CRM/messaging/scheduling)

- Emphasize insights (data visualization, risk scoring, root-cause narrative)

- Trainer control (editable action lists, easy approval/rejection workflow)

- Clean, data-driven aesthetic (use existing color scheme: dark bg + teal/cyan accents)

- Show data freshness (sync status, "updated 2m ago", error logs)

---

## PAGE 1: HOME / DASHBOARD

### Purpose

30-second trainer overview of their week + ROI of TrainU

### Layout Structure

```
Header: 
  "Welcome back, [Trainer Name]"
  

4-Column Metric Cards (top section):
  Col 1: 📐 Hours Saved This Week: "5.2 hrs" with "+12% vs last week" (green trend)
  Col 2: 🔴 Churn Risk Clients: "3 clients" with "-1 from yesterday" (green trend)
  Col 3: 📊 Avg Client Compliance: "78%" with "+3% vs 30-day avg" (green trend)
  Col 4: 🎯 Active Programs: "12 assigned" with "8 in progress" (neutral)

Chart Section (50% width):
  Title: "Compliance Trend (Last 30 Days)"
  X-axis: Dates (Nov 1 - Dec 1)
  Y-axis: % compliance (0-100)
  Line chart with teal color
  Annotations: "↓ Drop on Nov 15" / "↑ Recovered after check-in campaign"
  

Quick Actions (below chart):
  "🔴 3 Clients at Churn Risk"
  Link: "View in Queue →"
  

  "📝 8 New Check-ins Waiting"
  Link: "Review Messages →"
```

### Design Details

- Metric cards: Dark background, teal border on hover, large font for numbers

- Trends: Use green ↑ for positive, red ↓ for negative

- Chart: Recharts integration, single teal line, no legend clutter

- "Quick Actions": Pills with hover state, link to other pages

### Data Sources

- "Hours Saved": Calculate from: (avg_review_time_per_client * num_clients) - (actual_queue_time_this_week)

- "Churn Risk": Count clients with risk_score > 60

- "Avg Compliance": Average of all active clients' program_completion_rate

- "Active Programs": Count of programs with at least 1 assigned client

- Chart: Daily aggregated compliance_score from contacts table

---

## PAGE 2: QUEUE (INSIGHTS + AGENT OUTPUT)

### Purpose

AI-generated insights with trainer-editable action lists + existing message queue below

### Layout Structure (2 Sections)

#### SECTION A: AI INSIGHTS (Top 60% of page)

```
Header:
  Title: "🤖 AI Insights (Generated This Hour)"
  Subtitle: "X insights generated from latest data sync"
  
  [Refresh Now] [View History] [Settings]

Cards Grid (vertical stack, full width):
  
INSIGHT CARD TEMPLATE:
┌─────────────────────────────────────────────────────────────────────┐
│ 🔴 [RISK LEVEL ICON] Ben Lopez                    [RISK SCORE: 85] │
│                                                                     │
│ Root Cause Analysis:                                                │
│ • Skipped 3 of last 5 scheduled sessions                           │
│ • Sleep average dropped from 7h → 5.5h (Apple Health data)         │
│ • Payment status: OVERDUE (last payment 35 days ago)               │
│ • Last message response: 3 days ago (usually responds 8h)          │
│                                                                     │
│ Recommended Actions:                                                │
│ ☑ Send check-in SMS: "Hey Ben, noticed you haven't been by..."     │
│ ☑ Offer intensity scale: "Let's reduce volume 20% this week..."     │
│ ☑ Add sleep goal: "Adding 'Sleep 7h nightly' to your plan"         │
│ ☑ Payment follow-up: "Payment overdue - let's discuss options"     │
│                                                                     │
│ [Edit Actions ✏️] [Approve & Send →] [Dismiss ×]                   │
│                                                                     │
│ 📊 Source Data: Mindbody (attendance), GHL (messages), Apple       │
│ 🔄 Refreshed 15 minutes ago                                         │
└─────────────────────────────────────────────────────────────────────┘

[Next Insight Card]...
```

**Risk Level Colors:**

- 🟢 Low (0-35): Green badge, "Healthy"

- 🟡 Medium (36-60): Yellow badge, "Monitor"

- 🔴 High (61-100): Red badge, "At Risk"

**Editable Workflow:**

1. Trainer clicks "Edit Actions"

2. Each action becomes inline-editable:

   - Text input for SMS body (auto-populated)

   - Delete button (red X)

   - Reorder via drag handles

3. Trainer can add NEW action: "+ Add Action"

4. "Approve & Send" button executes all actions (with confirmation)

**Action Execution:**

- "Send SMS": Via GHL webhook

- "Add tag": Via GHL contact update

- "Add sleep goal": Via GHL custom field update

- Logs to audit trail: "Trainer approved 4 actions for Ben Lopez at 3:45 PM"

#### SECTION B: MESSAGE QUEUE (Below Insights, unchanged from current)

---

## PAGE 3: CLIENTS (Simplified List + Data-Rich Detail Page)

### CLIENT LIST (Left Panel)

```
Search Bar: "Search clients..."

Client List:
  Columns: [Initials] | Name | Streak | Risk | Last Activity | Program | Tags
  
  Sortable: by Risk (desc), Last Activity (desc), Compliance (desc)
  
  Filters: All / At Risk / Active / Paused / New
  
  Status Icons (add to each row):
    🟢 Mindbody data sync status
    🟢 GHL messages received
    🟢 Trainerize program data
    🔴 No data from this source
    [Hover to see: "Synced 10m ago" / "No data available"]
```

### CLIENT DETAIL PAGE (Right Panel - Modal)

```
Header:
  [Back] [Client Name] [Phone Icon] [Email Icon] [Calendar Icon]
           (Center)                    (Right)

Quick Action Buttons:
  [Check-in SMS] [Recover No-Show] [Confirm Session] [Custom Recommendation]
  
Tabs:
  Overview | Sessions | Programs | Data | Messages | Notes

─ OVERVIEW TAB (default)

  Section 1: Client Health Score
    • Risk Score: 0 (Low) [Green indicator]
    • Trend: Stable ↔️
    • Last Updated: 22 minutes ago [Refresh]
    
  Section 2: Engagement Metrics
    • Streak: 0 days
    • Workouts (7d): 0
    • Response Rate: 0% (0/5 check-ins)
    • Avg Session Duration: -- (no data)
    
  Section 3: Status
    • Membership: active
    • Last Activity: 22 minutes ago
    • Payment Status: current
    • Next Session: -- (Not scheduled)

─ PROGRAMS TAB (NEW)

  Current Program:
    Name: Strength Building
    Progress: 8 of 12 weeks complete
    Compliance: 89% (8 of 9 workouts completed this week)
    Next Workout: Scheduled
    
    [Edit] [AI-Customize This Program] [Swap Program]
    
  Program History:
    • Strength Building (completed, 89% compliance)
    • Fat Loss Journey (completed, 91% compliance)
    • Beginner Fundamentals (in progress, 95% compliance)

─ DATA TAB (NEW)

  Data Sources Summary:
  
  ✅ Mindbody
     • Last checked: 2 hours ago
     • Status: Syncing ✓
     • Records: 45 attendance entries, membership active, payment current
     • Error Log: None
     • [Refresh Now] [View Raw Data] [Disconnect]
  
  ✅ GoHighLevel (GHL)
     • Last checked: 15 minutes ago
     • Status: Real-time webhooks
     • Records: 12 check-ins, 0 responses, 3 messages sent
     • Error Log: None
     • [View Messages] [Disconnect]
  
  ✅ Trainerize
     • Last checked: 1 hour ago
     • Status: Syncing ✓
     • Records: 12 programs, 89% avg compliance, body weight 185 lbs
     • Error Log: "API rate limit hit at 2:30 PM, retried successfully"
     • [Refresh Now] [View Raw Data] [Disconnect]
  
  ❌ Apple Health
     • Status: Not connected
     • Why: Client hasn't authorized
     • [Learn More]
  
  ❌ Oura Ring
     • Status: Coming Soon
     • Expected: Phase 2
     • [Notify Me]

─ SESSIONS TAB
  [Existing - no changes]

─ MESSAGES TAB
  [Existing - no changes]

─ NOTES TAB
  [Existing - no changes]
```

### Design Notes

- List: Keep compact, use row hover state

- Detail modal: Right-slide overlay (full height, ~50% width)

- Sync status icons: Tiny (14px), tooltip on hover

- Data tab: Accordion sections per source, expandable error logs

- Colors: ✅ Green for connected, ❌ Gray for unavailable, ⚠️ Yellow for warnings

---

## PAGE 4: PROGRAMS (NEW)

### Layout

```
Header:
  Title: "Training Programs"
  Subtitle: "Create and manage program templates"
  
  [Create New Program ✨ AI-Assisted] [Import from Trainerize]

Two-Section Layout:

SECTION 1: Create New Program (Card)
  [Large Card with gradient background]
  Icon: ✨ (sparkle)
  Text: "Create New Program with AI Assistance"
  Subtitle: "Get personalized program recommendations based on your client base"
  [Get Started →]

SECTION 2: Your Templates (Grid)

  Program Card Template:
  
  ┌─────────────────────────────────────┐
  │ 📁 Strength Building                 │
  │                                      │
  │ Duration: 12 weeks                   │
  │ Sessions: 36                         │
  │ Assigned to: 5 clients               │
  │                                      │
  │ Avg Client Compliance: 87%           │
  │ Avg Client Satisfaction: 4.8/5       │
  │                                      │
  │ Status: Synced from Trainerize ✓     │
  │                                      │
  │ [Assign More] [Edit] [Customize 🚀]  │
  └─────────────────────────────────────┘

  [Next Program Card]...
```

### "Customize for [Client]" Workflow

```
Modal: "Customize Strength Building for Ben Lopez"

Card 1: Client Analysis
  "Based on Ben's data, here are my recommendations:"
  
  • 📊 Compliance Pattern: Ben prefers high-volume programs (avg 87% compliance on volume programs vs 62% on mobility-focused)
  • 😴 Recovery Status: Sleep is lower than usual (5.5h avg). Recommend: -20% volume this week
  • 💪 Strength Trend: Strong improvement on deadlifts and squats. Recommend: increase volume 10%
  • 🏃 Injury Notes: Lower back sensitivity noted. Recommend: add 15-min mobility work daily
  
Card 2: AI Recommendation
  "I suggest modifying Strength Building as follows:"
  
  [✓] Add 15-minute daily mobility work (lower back support)
  [✓] Reduce main workout volume by 20% this week (sleep optimization)
  [✓] Keep deadlifts/squats (high compliance exercises)
  [✓] Swap leg press for Bulgarian split squats (variety + engagement)
  
  [Edit Recommendations] [Preview] [Apply]
  
Card 3: Trainer Customization
  "Edit any recommendations below:"
  
  ☑ Add 15-minute daily mobility work (lower back support)
  ☑ Reduce main workout volume by 20% this week (sleep optimization)
  ☐ Keep deadlifts/squats (high compliance exercises)
  ☑ Swap leg press for Bulgarian split squats (variety + engagement)
  ☑ Add new: "Focus on form over weight"
  
  [Save Variant] [Assign to Client]
```

### Design Notes

- Program cards: Grid layout (2-3 columns on desktop)

- "Customize" CTA: Rocket icon 🚀

- AI recommendations: Bullet points with color-coded icons

- Variant saving: Labeled as "Strength Building (Modified for Ben)"

---

## PAGE 5: INTEGRATIONS (NEW)

### Layout

```
Header:
  Title: "Integrations"
  Subtitle: "Connect your training platforms to unlock insights"
  
  Overall Status Bar:
    "2 of 4 Connected" ▓▓░░
    
Tabs:
  Connected | Disconnected | Coming Soon

─ CONNECTED TAB (Default)

  Integration Card Template:
  
  ┌─────────────────────────────────────────────────────────────┐
  │ 🟢 GoHighLevel (GHL)                       [Manage] │
  │                                                     │
  │ Status: Active - Real-time sync                     │
  │ Last Updated: 5 minutes ago                         │
  │ Records Synced: 25 contacts, 150+ messages          │
  │ Health: ✓ No errors                                 │
  │                                                     │
  │ Recent Activity Log:                                │
  │ • 3:45 PM: Synced 3 new check-ins                   │
  │ • 3:30 PM: Processed 2 contact updates              │
  │ • 3:15 PM: Received 5 new messages                  │
  │                                                     │
  │ [Refresh Now] [View Settings] [Disconnect]          │
  └─────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────┐
  │ 🟢 Mindbody                                [Manage] │
  │                                                     │
  │ Status: Active - Hourly sync                        │
  │ Last Updated: 47 minutes ago                        │
  │ Records Synced: 25 memberships, 120+ attendance     │
  │ Health: ⚠️ Warning                                   │
  │ Error: "Rate limit approaching (280/300 calls/hr)"  │
  │                                                     │
  │ Recent Activity Log:                                │
  │ • 3:47 PM: Synced attendance records                │
  │ • 2:47 PM: Synced membership updates                │
  │ • 1:47 PM: ⚠️ API rate limit hit, retried OK        │
  │                                                     │
  │ [Refresh Now] [View Settings] [Disconnect]          │
  └─────────────────────────────────────────────────────────────┘

─ DISCONNECTED TAB

  Integration Card Template:
  
  ┌─────────────────────────────────────────────────────────────┐
  │ 🔴 Trainerize                              [Connect]│
  │                                                     │
  │ Status: Not Connected                               │
  │ Why Not Connected: Requires Trainerize Studio+ plan │
  │ Prerequisites:                                      │
  │ • Trainerize Studio+ or higher                      │
  │ • Your trainer/gym account                          │
  │                                                     │
  │ Benefits When Connected:                            │
  │ ✓ Program compliance tracking                       │
  │ ✓ Habit adherence scoring                           │
  │ ✓ Body stat trends                                  │
  │ ✓ AI recommendations based on your program history  │
  │                                                     │
  │ [Connect via OAuth] [Learn More]                    │
  └─────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────┐
  │ 🔴 TrueCoach                               [Connect]│
  │                                                     │
  │ Status: Not Connected                               │
  │ Prerequisites: TrueCoach account + API access       │
  │ [Connect via OAuth] [Learn More]                    │
  └─────────────────────────────────────────────────────────────┘

─ COMING SOON TAB

  Integration Cards (grayed out):
  
  🟦 Apple HealthKit
  🟦 Google Fit / Health Connect
  🟦 Oura Ring
  🟦 Fitbit
  🟦 Strava
  🟦 MyFitnessPal
  🟦 Notion
  🟦 Airtable
  
  [View All 18 Integrations] [Notify Me When Available]
```

### Design Notes

- Connected cards: Green 🟢 status icon, light green background tint

- Disconnected cards: Red 🔴 status icon, light red background tint

- Coming Soon: Blue 🟦 status icon, grayed out design

- Activity log: Timestamp + action in monospace font, max 3 entries

- Error messages: Yellow warning icon with detailed explanation

- Tabs: Use Shadcn/UI Tabs component

---

## PAGE 6: MESSAGES (Keep Existing)

No changes. This page is owned by GHL integration and works well.

---

## PAGE 7: CALENDAR (Keep Existing)

No changes. This page is owned by GHL integration and works well.

---

## COMPONENT SPECIFICATIONS

### New Components to Create/Modify

#### 1. INSIGHT CARD (Used in Queue page)

```
Props:
  - clientName: string
  - riskScore: 0-100
  - rootCauses: string[]
  - recommendedActions: ActionItem[]
  - sourceData: string[]
  - refreshedAt: Date
  
ActionItem:
  - id: string
  - text: string
  - category: "sms" | "tag" | "goal" | "payment" | "custom"
  - isChecked: boolean
  - onEdit: (text) => void
  - onDelete: () => void
```

#### 2. METRIC CARD (Used in Dashboard)

```
Props:
  - title: string
  - value: number | string
  - unit?: string
  - trend?: "up" | "down" | "stable"
  - trendPercent?: number
  - icon: React.ReactNode
  - color?: "teal" | "green" | "red"
```

#### 3. DATA SOURCE PANEL (Used in Clients Detail / Integrations page)

```
Props:
  - source: "mindbody" | "ghl" | "trainerize" | "apple-health" | "oura"
  - status: "connected" | "disconnected" | "coming-soon" | "error"
  - lastUpdated: Date
  - recordCount?: number
  - errorMessage?: string
  - activityLog?: LogEntry[]
```

#### 4. INTEGRATION CARD (Used in Integrations page)

```
Props:
  - name: string
  - status: "connected" | "disconnected" | "coming-soon" | "warning"
  - statusMessage: string
  - recordsSynced?: string
  - lastUpdated?: Date
  - activityLog?: LogEntry[]
  - onConnect?: () => void
  - onDisconnect?: () => void
  - onRefresh?: () => void
```

### Color Scheme (Existing, Maintain)

```
Primary: Teal/Cyan
  - Teal-400: #22D3EE (buttons, links, highlights)
  - Teal-500: #06B6D4 (darker accent)

Risk Indicators:
  - Red-400: #FF5459 (high risk)
  - Yellow-400: #FBBF24 (medium risk)
  - Green-400: #4ADE80 (low risk)

Backgrounds:
  - Dark-900: #0F172A (main bg)
  - Dark-800: #1E293B (cards)
  - Dark-700: #334155 (subtle separator)

Text:
  - White-100: #F1F5F9 (primary text)
  - Gray-400: #94A3B8 (secondary text)
```

---

## SPECIFIC UI INTERACTIONS

### Insight Card "Edit Actions" Flow

1. Trainer clicks "Edit Actions" on insight card

2. Each action item becomes editable:

   - Double-click or click "edit" icon to inline edit

   - Red X button to delete

   - Reorder via drag handles

3. "+ Add Action" button at bottom allows adding new actions

4. Changes reflected in real-time (no save needed until "Approve & Send")

5. "Approve & Send" button shows confirmation: "Ready to send 4 actions to Ben?"

### Programs "Customize" Flow

1. Trainer clicks "Customize 🚀" on program card

2. Right-slide modal opens: "Customize [Program] for [Client]"

3. Shows: AI analysis + recommendations

4. Trainer can check/uncheck recommendations

5. Can add custom text: "+ Add custom action"

6. "Apply" saves variant, "Assign to Client" applies + assigns

7. Variant is stored as: "[Program Name] (Modified for [Client])"

### Integrations Connection Flow

1. Trainer clicks "Connect via OAuth" on Disconnected integration

2. OAuth modal/popup opens (OAuth provider URL)

3. After auth, redirects back to Integrations page

4. Card moves to "Connected" tab

5. Shows sync status + activity log

6. Real-time updates as data syncs

---

## TECHNICAL NOTES FOR LOVABLE

- Use **Recharts** for dashboard chart (compliance trend)

- Use **Shadcn/UI Tabs** for client detail / integrations tabs

- Use **Radix UI Dialog** for modals (customize, confirm)

- Use **React Hook Form** for any new form inputs

- **Animations:** Smooth slide-ins for modals, fade-in for cards

- **Responsive:** Mobile-first, but stack 2-column grids on desktop

- **Dark mode:** All designs assume dark theme (existing)

- **Accessibility:** Focus states on all interactive elements, ARIA labels for icons

---

## LOVABLE BUILD ORDER (Recommended)

1. **HOME/DASHBOARD** - Start here, simpler, builds confidence

2. **QUEUE REFINEMENTS** - Add insight cards, test editable actions

3. **CLIENTS DETAIL** - Add Programs + Data tabs

4. **PROGRAMS PAGE** - New page, medium complexity

5. **INTEGRATIONS PAGE** - New page, high complexity, lots of states

6. **Polish** - Animations, responsive, accessibility review

---

**END OF LOVABLE PROMPT**

Paste this entire prompt into Lovable Chat and it will generate the UI components and pages based on these specs. Reference the Product Spec (trainu_product_spec_v2.md) for any feature questions.

