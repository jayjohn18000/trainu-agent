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
   - Click approve on 2-3 drafts
   - Observe activity feed update

2. **Test Undo**
   - Click undo on most recent approval
   - Verify item returns to queue
   - Re-approve if desired

3. **Client Management** (`/clients`)
   - View client risk scores
   - Read AI insights
   - Click "Nudge" button
   - See success toast and feed update

4. **Settings** (`/settings`)
   - Change autonomy to "Auto-send Low Risk"
   - Adjust tone/length preferences
   - Set quiet hours
   - Return to Today to see changes reflected

5. **Command Palette**
   - Press `Cmd/Ctrl + K`
   - Search for a client
   - Try action: "Pause agent"
   - Verify AgentStatusBar shows paused state

## Fixtures

Mock data is stored in `src/data/fixtures/`:
- `queue.json` - Pending draft messages
- `feed.json` - Recent activity timeline
- `clients.json` - Client list with metadata
- `settings.json` - Agent configuration

## Architecture

### Components
- `AgentLayout.tsx` - Top bar + mobile nav for agent routes
- `RedirectHandler.tsx` - Implements 301/410 redirects
- `AgentStatusBar.tsx` - ⚠️ TODO: Agent state pill with toggle
- `ActivityFeed.tsx` - ⚠️ TODO: Timeline with virtualized scroll
- `QueueCard.tsx` - ⚠️ TODO: Draft preview with actions
- `CommandPalette.tsx` - ⚠️ TODO: Cmd+K quick actions

### Pages
- `Today.tsx` - Main queue view
- `ClientsAgent.tsx` - Client management
- `SettingsAgent.tsx` - Configuration

### API Stubs (TODO)
All stubs return fixtures when `AGENT_MOCK=1`:
- `GET /api/agent/status`
- `GET /api/agent/feed`
- `GET /api/agent/queue`
- `POST /api/agent/queue`
- `GET/POST /api/agent/settings`
- `GET /api/clients/list`
- `POST /api/clients/:id/nudge`

## Next Steps (Phase 2-5)
See main spec for detailed component requirements, Storybook stories, and full interaction patterns.
