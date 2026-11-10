# Antigravity Development Prompt - ATHLON Desktop UI Redesign

You are redesigning ATHLON's desktop UI only. Work in the existing frontend and preserve backend/API/business behavior exactly. Do not alter mobile layouts below 1024px.

## Objective

Create a premium sports operations desktop experience for Athlete, Organizer, Academy, Club, and Venue Manager workspaces. The interface must feel deliberate, calm, data-aware, and scalable for high-volume management.

## Non-negotiable constraints

- Desktop only: use `@media (min-width: 1024px)` or the existing desktop breakpoint system. Leave all mobile UI and mobile navigation untouched.
- Preserve routes, permissions, API contracts, mutations, state management, and business logic.
- Do not use hard-coded/demo/static operational records as live data. If an API has no data, render a clear empty state.
- Do not substitute cards for tables where users manage many records.
- Preserve all existing interaction semantics. Do not submit forms or trigger data mutations during visual refactoring.

## Layout system

Build or extend reusable desktop primitives:

- `WorkspaceShell`: fixed left navigation, 264px expanded and 72px collapsed, large content canvas.
- `PageHeader`: title, optional concise description, breadcrumbs only when meaningful, one primary action, optional secondary actions.
- `KpiStrip`: compact 3-5 metrics with clear labels and no decorative duplication.
- `DesktopToolbar`: search, filters, date range, record count, and view controls.
- `DataTable`: sticky header when applicable, visible row actions, empty/loading/error states.
- `OperationalEmptyState`: specific instruction and one relevant CTA; no generic “nothing here.”

Use 12-column grid, 24px desktop gutter at 1366px, 32px at 1440px+, 8px spacing scale, 12-16px card radius, restrained shadows, and system/Inter typography. Use a neutral dark slate/white base with workspace accent colors only for selected, primary, and semantic states. Ensure WCAG AA contrast.

## Navigation

- Group sidebar routes by work domain.
- Strong selected state and compact labels.
- Sidebar collapse must retain tooltips and keyboard-accessible labels.
- Remove dashboard carousels that duplicate sidebar destinations. Use an optional “Pinned actions” strip with at most 4 context-relevant actions.

## Dashboard rules

- First viewport must answer: What needs attention? What changed? What should I do next?
- Structure: page header -> KPI strip -> priority queue/main table -> two supporting panels.
- Avoid generic hero marketing panels inside operational dashboards.
- If data is unavailable, show an error/retry state; if data is empty, show a true zero state.

## Workspace requirements

### Organizer

Make competitions, registrations, officials, inventory, finances, and results operational and table-first. Competition list should default to table/list with status, date, registrations, categories, and contextual actions. Retain any visual/event card view as optional.

### Academy

Create a consistent roster shell for students, batches, coaches, staff, and attendance: count, search, filter chips, bulk/action space, table/list content, and a real empty state. Avoid persistent loading labels after a completed empty response.

### Club

Use a readable members table, clear role/status badges, safe destructive action placement, and an analytics dashboard that pairs compact charts with supporting data.

### Venue Manager

Preserve the good grouped navigation and booking grid concept. Improve the desktop calendar with a frozen time column, pinned legend, clear booked/series/blocked states, and scroll constrained to the grid. Improve the booking ledger with date/facility/status filters, result count, aligned payment status, and one clear “New Walk-In” action.

### Athlete

Keep discovery separate from personal operations. Put personal state, upcoming matches, bookings, and action items first; place explore content in a secondary section.

## Quality bar

- Test at 1366x768, 1440x900, and 1920x1080.
- No horizontal page overflow; allow horizontal scroll only inside intentionally wide tables/grids.
- Visible keyboard focus, accessible icon labels, semantic headings, and loading/error/empty states.
- Preserve user data, routes, queries, and API behavior. Add visual regression coverage where the repository supports it.

## Deliverable

Provide a phased implementation using shared primitives first, then workspace-specific pages. For each changed screen, document desktop breakpoint scope, affected shared components, accessibility checks, and proof that mobile behavior remains unchanged.
