# Data Flow Audit

Date: 2026-03-20

## Executive Summary

The dashboard has a mixed data model:

- Real data is wired for Google Calendar, WHOOP, Todoist, CRM, and the local Obsidian-backed Express API.
- Only some of that real data reaches user-visible UI.
- The `Command` page mixes live calendar events with mock Core 4, mock agent status, mock revenue, and mock 7-day timeline data.
- The `Core4` page mixes mock headline metrics with real WHOOP detail values and mock goals stored in `localStorage`.
- `Family` shows `Good` because the card value is hardcoded in [`src/lib/mockData.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/lib/mockData.ts#L19), not because any family targets or family data source were evaluated.

## Core 4 Metrics

| Metric | Current UI Source | Real API/Data Source Present? | Status | Why it shows current value |
|--------|-------------------|-------------------------------|--------|----------------------------|
| Fitness | `mockCore4Data[0]` | WHOOP hook/API exists | Partial | Card value `7.2 Strain` is mock; WHOOP only feeds detail rows on Core 4 page |
| Flow | `mockCore4Data[1]` | Todoist hook exists, no Flow pipeline exists | Mock | Card value `6.8 Focus Score` is hardcoded |
| Family | `mockCore4Data[2]` | No family integration implemented | Mock | Card value `Good` and `85%` progress are hardcoded |
| Finance | `mockCore4Data[3]` | CRM hook/API exists | Partial | Card value `$842K ARR` is mock; real CRM is only used on Pipeline page |

## Data-Flow Diagram

```text
Command Page
  Fitness card
    -> useCore4Data()
    -> mockCore4Data[0]
    -> real WHOOP hook mounted but not bound to card

  Flow card
    -> useCore4Data()
    -> mockCore4Data[1]
    -> Todoist hook mounted but not bound to card
    -> no Obsidian/Shaman flow source implemented

  Family card
    -> useCore4Data()
    -> mockCore4Data[2] = "Good"
    -> no calendar-derived family scoring logic exists

  Finance card
    -> useCore4Data()
    -> mockCore4Data[3]
    -> real CRM hook exists elsewhere, not bound here

  Active Decisions
    Tactical Log
      -> useCalendar()
      -> fetchCalendarEvents()
      -> Google Calendar API
      -> real, assuming env token exists
    Agent Monitor
      -> useAgentStatusData()
      -> mockAgentStatuses
    Val Telemetry
      -> useRevenueData()
      -> mockRevenueData

  Next 7 Days
    -> useTimelineData()
    -> mockTimelineData

Core 4 Page
  Headline metric values
    -> useCore4Data()
    -> mockCore4Data
  Fitness details
    -> useWHOOP()
    -> fetchWHOOPMetrics()
    -> WHOOP API
  Flow / Family / Finance details
    -> inline hardcoded strings
  90-day goals
    -> useGoals()
    -> localStorage mock fallback
    -> not backend or Vercel KV

Pipeline Page
  -> useCRMDeals()
  -> fetchDeals()
  -> CRM API
  -> real if env key exists

Clients / Agents / Prospects
  -> backend Express API (`server.mjs`)
  -> local Obsidian vault files under ~/casper-oc-memory
  -> real local data
```

## API Connection Audit

### Connected and reaching UI

#### Google Calendar

- Hook: [`src/hooks/useCalendar.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/hooks/useCalendar.ts#L17)
- API client: [`src/lib/api/calendar.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/lib/api/calendar.ts#L65)
- UI usage: [`src/pages/Command.tsx`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/pages/Command.tsx#L73)

What it does:

- Reads `VITE_GOOGLE_CALENDAR_TOKEN` from the frontend env.
- Calls Google Calendar directly from the browser for the next 7 days.
- The `TACTICAL_LOG` column on the `Command` page displays those live events.

Assessment:

- This is the clearest real integration currently visible in the dashboard UI.
- It is still frontend-direct, which means OAuth tokens are exposed to the client bundle.
- Token refresh is also implemented in the frontend and expects `VITE_GOOGLE_REFRESH_TOKEN`, `VITE_GOOGLE_CLIENT_ID`, and `VITE_GOOGLE_CLIENT_SECRET` in browser envs, which is not acceptable for production secrets.

#### CRM

- Hook: [`src/hooks/useCRMDeals.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/hooks/useCRMDeals.ts#L21)
- API client: [`src/lib/api/crm.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/lib/api/crm.ts#L38)
- UI usage: [`src/pages/Pipeline.tsx`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/pages/Pipeline.tsx#L90)

What it does:

- Reads `VITE_CRM_API_KEY`.
- Calls `https://crm.nickscarabosio.com/api/deals` directly from the browser.
- Drives the Pipeline board if the key exists and the API responds.

Assessment:

- Real integration exists and is used.
- It does not feed the Finance metric on `Command` or `Core4`.
- Secrets are again browser-exposed.

#### Obsidian via Express backend

- Backend endpoints: [`server.mjs`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/server.mjs#L29), [`server.mjs`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/server.mjs#L74), [`server.mjs`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/server.mjs#L115)
- Frontend aggregation: [`src/lib/api/obsidian.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/lib/api/obsidian.ts#L31)
- UI usage: [`src/hooks/useObsidian.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/hooks/useObsidian.ts#L20), [`src/pages/Clients.tsx`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/pages/Clients.tsx), [`src/pages/Agents.tsx`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/pages/Agents.tsx)

What it does:

- Server reads markdown frontmatter from `~/casper-oc-memory`.
- `/api/clients`, `/api/agents`, and `/api/prospects` return parsed JSON.
- Clients and Agents pages consume this backend.
- `useObsidian` on the `Command` page only shows counts in the debug status block.

Assessment:

- This is real local data wiring.
- It does not power the visible `AGENT_MONITOR` column on the `Command` page; that column is still mock.
- `VITE_OBSIDIAN_VAULT_PATH` in `.env.example` is stale and unused after the backend refactor.

### Connected but not meaningfully driving the main dashboard

#### WHOOP

- Hook: [`src/hooks/useWHOOP.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/hooks/useWHOOP.ts#L20)
- API client: [`src/lib/api/whoop.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/lib/api/whoop.ts#L22)
- UI usage: [`src/pages/Command.tsx`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/pages/Command.tsx#L20), [`src/pages/Core4.tsx`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/pages/Core4.tsx#L190)

What it does:

- Reads `VITE_WHOOP_TOKEN`.
- Calls WHOOP endpoints for sleep, heart rate/recovery, and strain.
- Calculates a synthetic `fitnessScore`:
  - sleep contribution: up to 3 points
  - recovery contribution: up to 3 points
  - strain contribution: up to 4 points
- Returns formatted strings from the hook.

Assessment:

- The integration is real in code.
- The `Command` page does not use WHOOP values for the visible Fitness card; it only shows status text in the debug panel.
- The `Core4` page uses WHOOP only for detail rows, while the headline value still comes from mock data.

#### Todoist

- Hook: [`src/hooks/useTodoist.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/hooks/useTodoist.ts#L19)
- API client: [`src/lib/api/todoist.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/lib/api/todoist.ts#L22)
- UI usage: [`src/pages/Command.tsx`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/pages/Command.tsx#L21)

What it does:

- Reads `VITE_TODOIST_TOKEN`.
- Fetches projects and tasks directly from Todoist.
- Computes counts plus a derived `weeklyRevenue` by scraping dollar amounts from task descriptions.

Assessment:

- Real code path exists.
- No visible production UI currently uses Todoist-derived metrics beyond the small debug status block.
- It does not currently drive Flow, Finance, or timeline UI.

### Mock or hardcoded

#### Core 4 headline metrics

- Source: [`src/lib/mockData.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/lib/mockData.ts#L19)
- Consumers: [`src/pages/Command.tsx`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/pages/Command.tsx#L24), [`src/pages/Core4.tsx`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/pages/Core4.tsx#L188)

Values currently hardcoded:

- Fitness: `7.2 Strain`
- Flow: `6.8 Focus Score`
- Family: `Good Health`
- Finance: `$842K ARR`

These values are not derived from WHOOP, Todoist, Calendar, CRM, or goals.

#### Family metric

Specific answer to Nick’s question:

- `Family` shows `Good` because `mockCore4Data` explicitly sets `value: 'Good'`, `progress: 85`, and `color: 'green'` for the Family card in [`src/lib/mockData.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/lib/mockData.ts#L36).
- No targets are consulted for that card.
- No family scoring function exists.
- No calendar-family mapping exists.
- No Obsidian family/reflection data source exists.

This is purely mock UI state.

#### Goals / targets

- Hook: [`src/hooks/useGoals.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/hooks/useGoals.ts#L47)
- Data source: [`src/lib/api/goals.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/lib/api/goals.ts#L14)
- Unused backend mock route: [`server.mjs`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/server.mjs#L160)

What it does:

- `useGoals` claims Vercel KV in comments, but actually reads `localStorage`.
- If `localStorage` is empty, it returns a built-in mock sprint with fitness/flow/family/finance targets.
- The backend also exposes `/api/goals`, but the frontend does not call it.

Assessment:

- Goals are mock/local only.
- There is no persistent server-side or real data store for goals.
- If Nick says “no targets set,” that can still conflict with UI because the app auto-generates a default sprint in code.

#### Settings page

- Source: [`src/pages/Settings.tsx`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/pages/Settings.tsx#L57)

What it does:

- Initializes Google Calendar, WHOOP, Todoist, and Obsidian as `connected: true` in component state.
- `Sync Now`, `Connect`, and `Disconnect` only mutate local React state.
- Password changes are written to `localStorage`, but login reads a different env variable path and fallback.

Assessment:

- Settings is entirely presentational/mock.
- It is not a source of truth for whether integrations are actually connected.

## Questions Answered

### 1. Fitness metric: where does it come from?

Current visible card value:

- From [`src/lib/mockData.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/lib/mockData.ts#L20)
- Not from WHOOP

Real fitness data path:

- `useWHOOP` -> `fetchWHOOPMetrics` -> WHOOP API
- The score is calculated in [`src/lib/api/whoop.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/lib/api/whoop.ts#L85)

Why it is not the visible source:

- `Command` imports `useWHOOP`, but the Fitness card uses `useCore4Data()` instead of `whoopResult`.
- `Core4` headline metric also uses `useCore4Data()`.

### 2. Flow metric: where does it come from?

Current visible card value:

- From [`src/lib/mockData.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/lib/mockData.ts#L28)
- Hardcoded `6.8 Focus Score`

Potential related real source:

- Todoist hook exists, but it only returns project count, task count, and derived weekly revenue.
- No Flow scoring logic exists.
- No Obsidian/Shaman integration exists in the codebase.

### 3. Family metric: where does it come from?

Current visible card value:

- From [`src/lib/mockData.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/lib/mockData.ts#L36)

Why it shows `Good`:

- The value is literally hardcoded as `Good`.
- The card color is hardcoded green.
- The progress is hardcoded `85`.
- No real target evaluation or family data feed exists.

Potential related real source:

- Calendar events are real, but no code tags events as family events or computes a family score from them.

### 4. Finance metric: where does it come from?

Current visible card value:

- From [`src/lib/mockData.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/lib/mockData.ts#L44)
- Hardcoded `$842K ARR`

Real finance-related sources present:

- CRM deals on the Pipeline page
- Todoist-derived `weeklyRevenue` metric in the Todoist hook
- Obsidian clients/prospects with `mrr`, `revenue`, and `deal_size`

What determines status now:

- Only the mock constant determines it.
- There is no live finance aggregation function for the Core 4 card.

### 5. Calendar events (7D): are they real?

Partially:

- `Active Decisions -> Tactical Log` uses real Google Calendar data on the `Command` page.
- The `Next 7 Days` timeline is not real; it uses `mockTimelineData`.

### 6. WHOOP data: is it real?

In code, yes:

- Real WHOOP fetch path exists and can work if `VITE_WHOOP_TOKEN` is present and valid.

In the visible primary metric UI, no:

- The dashboard does not currently bind WHOOP output to the Fitness headline card.

### 7. Todoist tasks: are they real?

In code, yes:

- Real Todoist fetch path exists and can work if `VITE_TODOIST_TOKEN` is present and valid.

In visible decision-making UI, barely:

- Only surfaced in the `API Integration Status` debug block on `Command`.
- Not used for Flow scoring, timeline generation, or a task list view.

### 8. Missing pieces: what is not wired yet?

- Real-to-UI binding for all four Core 4 headline metrics
- Any family-specific integration or scoring logic
- Any Flow-specific scoring logic
- A real Finance aggregation layer
- Real 7-day timeline generation
- Real `AGENT_MONITOR` data on `Command`
- Real `VAL_TELEMETRY` data on `Command`
- A real goals backend and persistence layer
- A real settings/integration state model

## Working vs Not Working

### Working

- Google Calendar events in `TACTICAL_LOG`
- CRM-driven Pipeline board
- Obsidian-backed Clients and Agents pages
- WHOOP/Todoist hooks can fetch real data if env vars are present

### Partial

- WHOOP is connected but only used in detail rows/debug
- Todoist is connected but not mapped to Flow UI
- Obsidian counts appear in debug but not in operational command widgets

### Mock

- All Core 4 headline cards
- Family status and score
- `AGENT_MONITOR` on `Command`
- `VAL_TELEMETRY` on `Command`
- 7-day timeline
- Settings connection state
- Goals persistence

## Risks and Wiring Problems

### Frontend secrets exposure

The app reads Google, WHOOP, Todoist, and CRM credentials from `VITE_*` vars and uses them in browser-side fetches:

- [`src/lib/api/calendar.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/lib/api/calendar.ts#L15)
- [`src/lib/api/whoop.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/lib/api/whoop.ts#L11)
- [`src/lib/api/todoist.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/lib/api/todoist.ts#L11)
- [`src/lib/api/crm.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/lib/api/crm.ts#L27)

That is acceptable for a local prototype, not for a deployed dashboard.

### Error suppression on Obsidian-backed fetches

These fetchers catch errors and return empty arrays instead of throwing:

- [`src/lib/api/clients.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/lib/api/clients.ts#L9)
- [`src/lib/api/agents.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/lib/api/agents.ts#L9)
- [`src/lib/api/prospects.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/lib/api/prospects.ts#L9)
- [`src/lib/api/obsidian.ts`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/lib/api/obsidian.ts#L31)

Impact:

- React Query sees successful responses with zero data.
- The UI can silently look “empty” instead of “broken.”

### Env mismatch on dashboard password

- `.env.example` defines `VITE_DASHBOARD_PASSWORD` in [`/.env.example`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/.env.example#L4)
- Login reads `import.meta.env.REACT_APP_DASHBOARD_PASSWORD` in [`src/App.tsx`](/Users/cosmic-ghost/.openclaw/workspace/agents/casper/ares-dash-forge-work/src/App.tsx#L43)

Impact:

- The env-based password override likely does not work under Vite.
- The hardcoded fallback password is probably always used unless build tooling injects a nonstandard variable.

## Recommended Next Build Steps

1. Replace `useCore4Data()` on `Command` and `Core4` with a real `useCore4Metrics()` aggregator hook.
2. Define explicit scoring formulas:
   - Fitness <- WHOOP
   - Flow <- Todoist + reflection source
   - Family <- calendar-tagged family events or manual target tracking
   - Finance <- CRM + client MRR + pipeline
3. Generate the 7-day timeline from real Calendar, Todoist, and CRM follow-ups instead of `mockTimelineData`.
4. Replace mock `AGENT_MONITOR` with `/api/agents` output.
5. Replace mock `VAL_TELEMETRY` with CRM/Todoist/client aggregates.
6. Move third-party API access behind the backend to stop exposing secrets in the browser.
7. Replace localStorage goals with a real backend source and delete the duplicate unused `/api/goals` vs localStorage split.
8. Make integration health/status derive from actual fetch state, not static Settings page defaults.

## Bottom Line

The dashboard is not “mostly live.” It is a hybrid:

- Live data exists for Calendar, CRM, WHOOP, Todoist, and Obsidian.
- User-visible dashboard logic is still dominated by mock constants.
- `Family = Good` is a hardcoded demo value, not a computed result.
