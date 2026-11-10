# ATHLON Desktop Redesign Implementation Plan

## Scope and guardrails

This plan applies only at desktop breakpoints (`min-width: 1024px`). Preserve all mobile navigation, mobile bottom bars, existing mobile cards, business logic, APIs, routes, permissions, and backend contracts. No workflow redesign may change booking, payment, tournament, or workspace authorization behavior.

## Design system foundation

1. Define desktop layout tokens: 264px expanded sidebar, 72px collapsed sidebar, 24px content gutter at 1366px, 32px at 1440px+, 12-column content grid, and a maximum workspace content width of 1600px.
2. Define page primitives: `WorkspaceShell`, `PageHeader`, `KpiStrip`, `Toolbar`, `DataTable`, `StatusBadge`, `EmptyState`, `LoadingState`, `ErrorState`, `QuickActionMenu`.
3. Standardize hierarchy: one page title, one descriptive line only when useful, one primary action, then KPI/filters/list. Avoid competing hero cards inside operational workspaces.
4. Use a small semantic color system: neutral surfaces, one workspace accent, semantic success/warning/error/info states. Verify WCAG AA contrast.

## Phase 1 - shared shell and navigation (P0)

- Replace repeated workspace shells with a shared desktop sidebar contract that supports grouped navigation, active-state clarity, tooltips in collapsed mode, and a stable bottom account/workspace switcher.
- Keep large module inventories in the sidebar; remove duplicated carousel navigation from dashboards.
- Use a persistent command/quick-action area at the top of the content pane for create actions and global filters.
- Acceptance: keyboard navigation, visible focus, no duplicate module destinations, no horizontal navigation carousel required to reach an operational module.

## Phase 2 - desktop dashboard pattern (P0)

- Rebuild Organizer, Academy, Club, and Venue dashboards around a two-level hierarchy: KPI strip followed by an operational queue and two contextual panels.
- Replace generic/static-looking activity tiles with live data cards or explicit zero/error states. Never display demo records beside a zero count without a “sample data” label.
- Use desktop tables for records; reserve cards for summaries, not every entity.
- Acceptance: a manager can identify outstanding work, next action, and operational health in the first viewport at 1366x768.

## Phase 3 - module-specific layouts (P1)

### Organizer

- Competition list: table/list default with columns for status, dates, registrations, category count, and actions. Keep an optional visual gallery only for discovery.
- Registrations: dense table with filters, bulk selection, status badges, and a fixed action bar.
- Results and roles: structured table-first pages with drill-in drawers rather than card stacks.

### Academy

- Student, coach, staff, batch, and attendance pages should share a roster/list shell: totals, one search, compact filters, table/list, meaningful empty state.
- Turn “Batches (0)” and similar context links into concise KPI chips, not competing buttons.

### Club

- Members need a standard desktop data table with readable status, role, joined date, and protected-action placement. Use an overflow menu for destructive commands.
- Leaderboards and analytics need a desktop chart/table split and clear date/filter context.

### Venue

- Retain the strong grouped information architecture.
- Calendar: preserve the table matrix; freeze time column, use clear column headers, show legend persistently, add responsive horizontal scroll only within the grid.
- Bookings: preserve the table but consolidate status and payment cues, add total/result count, date range, facility and status filters. Keep “New Walk-In” as the sole primary action.

## Phase 4 - state quality and feedback (P0)

- Every dynamic page must use a bounded loading state, explicit zero state, and recoverable error state. Do not leave “Loading…” as the durable page result.
- Make counts agree with visible records and update after refresh without a route change.
- Use non-blocking toast/inline feedback after safe actions and clear error messages with retry where appropriate.

## Phase 5 - accessibility and responsiveness (P1)

- Audit heading order, icon-only control names, focus state, tab order, keyboard support, minimum target size, and color contrast.
- Test 1366x768, 1440x900, and 1920x1080. Do not modify mobile styles under 1024px.
- Test long organization names, large record counts, empty states, error states, and horizontal tables.

## Delivery sequence

1. Tokens and shared shell.
2. Venue calendar/bookings as the reference desktop data workflow.
3. Organizer dashboard and competition list.
4. Academy roster/batches and Club members.
5. Remaining workspaces and visual regression checks.

## Regression checks

- Direct workspace URLs still enforce authorization.
- Existing create/edit actions retain payloads and endpoints.
- Mobile snapshots remain unchanged.
- Sidebar collapse, browser back/forward, and refresh retain selected workspace state.
- No sample/static data appears as live operational data.
