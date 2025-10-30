# TrainU Agent Console MVP

## Overview
The Agent Console is a streamlined interface for trainers to manage AI-assisted client communications with minimal clicks.

## Running the App

### With Mock Data (Development)
```bash
# Create .env file
echo "VITE_AGENT_MOCK=1" > .env

# Install and run
npm install
npm run dev
```

### With Real API
```bash
# Configure .env with Supabase credentials
VITE_AGENT_MOCK=0
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

npm run dev
```

## Route Structure

### Active Routes
- `/today` - Main queue and activity feed
- `/clients` - Client list with AI insights
- `/settings` - Agent behavior configuration

### Redirects (301)
| Old Route | New Route |
|-----------|-----------|
| `/dashboard/trainer` | `/today` |
| `/inbox` | `/today#queue` |
| `/dashboard/clients` | `/clients` |
| `/dashboard/settings` | `/settings` |

### Removed Routes (410)
- `/dashboard/calendar` - Link out to GHL from Inspector
- `/dashboard/messages` - Folded into `/today`
- `/dashboard/progress` - Now Inspector tab
- `/dashboard/programs` - Now Inspector tab
- `/dashboard/community/*` - Parked for future
- `/book` - Use GHL link in Inspector

### Marketing Routes (No App Chrome)
- `/` - Landing page
- `/directory` - Trainer directory
- `/trainers/:slug` - Trainer profile

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd/Ctrl + K` | Open command palette |
| `A` | Approve current item |
| `U` | Undo last action |
| `E` | Edit draft |
| `/` | Focus search |
| `P` | Pause/resume agent |

## Demo Script (5 minutes)

1. **Navigate to Today** (`/today`)
   - Review queue items with confidence badges
   - Expand "Why suggested" accordion
   - Press `A` to approve first draft (or click Approve button)
   - Observe activity feed update in real-time
   - Approve 2 more drafts

2. **Test Keyboard Shortcuts**
   - Press `Cmd/Ctrl + K` to open command palette
   - Search for "Emily" to find a client
   - Press `P` to pause agent (observe status change)
   - Press `P` again to resume

3. **Client Management** (`/clients`)
   - Use search bar to filter clients
   - Click on a client card to open Inspector
   - Review Timeline, Programs, Progress tabs
   - Click "Nudge" button
   - See success toast
   - Close Inspector and notice feed updated

4. **Settings** (`/settings`)
   - Change autonomy to "Auto-send Low Risk"
   - Adjust tone to "Professional"
   - Set length to "Medium"
   - Update quiet hours (e.g., 22:00 - 08:00)
   - Click "Save Changes"
   - See success toast

5. **Mobile Experience**
   - Resize browser to mobile width
   - Test bottom navigation (Today, Clients, Settings)
   - Open command palette with menu button
   - Verify responsiveness across all pages

## Fixtures

Mock data is stored in `src/data/fixtures/`:
- `queue.json` - Pending draft messages
- `feed.json` - Recent activity timeline
- `clients.json` - Client list with metadata
- `settings.json` - Agent configuration

## Architecture

### Components
- ✅ `AgentLayout.tsx` - Top bar + mobile nav for agent routes
- ✅ `RedirectHandler.tsx` - Implements 301/410 redirects
- ✅ `AgentStatusBar.tsx` - Agent state pill with toggle
- ✅ `ActivityFeed.tsx` - Timeline with real-time updates
- ✅ `QueueCard.tsx` - Draft preview with actions
- ✅ `CommandPalette.tsx` - Cmd+K quick actions
- ✅ `Inspector.tsx` - Client detail tabs with quick actions

### API Integration
- ✅ Edge functions for all endpoints
- ✅ Mock mode with AGENT_MOCK=1
- ✅ Real-time feed updates
- ✅ Approve/undo/nudge actions

### Pages
- ✅ `Today.tsx` - Queue + feed with interactions
- ✅ `ClientsAgent.tsx` - Searchable client list + Inspector
- ✅ `SettingsAgent.tsx` - Agent configuration

## Next Steps

To run the new Agent demo features:
1. Apply migrations in `supabase/migrations/` (creates `contacts`, `bookings`, `messages`, `insights`, `events`, `feature_flags`).
2. Seed demo data via `supabase/seeds/demo-data.sql` (set TRAINER_ID accordingly).
3. Configure env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `GHL_API_BASE`, `GHL_ACCESS_TOKEN`.
4. Open `/today` and approve drafts; quiet hours/frequency caps will queue messages.
5. Feature Flags: toggle in `/settings` → Feature Flags (DB-backed).
6. KPIs pull live counts from `bookings`, `messages`, and `insights`.
