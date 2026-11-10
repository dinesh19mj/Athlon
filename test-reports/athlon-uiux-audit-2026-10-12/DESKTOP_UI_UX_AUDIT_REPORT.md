# ATHLON Desktop UI/UX Audit Report

**Audit date:** 12 October 2026 (Asia/Kolkata)  
**Environment:** Live production URL `https://athlon.co.in`  
**Method:** Read-only authenticated desktop browser inspection. No form submission, state mutation, account/profile change, or payment action was performed.  
**Scope:** Desktop information architecture, hierarchy, navigation, data presentation, visible states, and accessibility signals. This report does not claim mobile validation or functional E2E validation.

## Executive conclusion

ATHLON has strong feature breadth and recognizable workspace segmentation, particularly in the Venue Manager. The desktop experience is not yet consistently operational: dashboards repeatedly duplicate navigation through horizontal tool carousels, dashboard hierarchy competes with the side navigation, several workspace views use a card-first pattern where a table-first management surface would scale better, and dynamic-state treatment is inconsistent. The highest design risk is source-of-truth ambiguity when a dashboard can present real counts alongside static-looking event content.

### Overall desktop assessment

| Area | Rating | Summary |
|---|---|---|
| App shell and workspace navigation | Needs improvement | Good grouping, but duplicated dashboard tool carousels add noise. |
| Personal athlete home | Needs improvement | Rich discovery, but personal operation and discovery compete. |
| Organizer dashboard and tournament list | Major redesign needed | Needs an operational first viewport and list/table default. |
| Academy dashboard and roster/batches | Major redesign needed | Navigation is broad but content states and desktop density need standardization. |
| Club dashboard and member management | Needs improvement | Member table is useful; dashboard needs stronger operational hierarchy. |
| Venue dashboard, calendar and booking ledger | Needs improvement | Strongest IA; calendar/ledger need desktop refinement and clear state consistency. |
| Accessibility signals visible in browser | Needs improvement | Many controls have accessible names, but a full keyboard/contrast audit was not executed. |

## What was inspected

Actual browser-inspected pages:

1. Public home and authenticated personal home.
2. Organizer dashboard and tournament list.
3. Academy dashboard, Student Roster, and Coaching Batches.
4. Club dashboard and Members.
5. Venue Manager dashboard, Live Calendar, Reservation Management, and Facilities.

Accessible workspaces discovered: Personal Athlete, Organizer, Academy, Club, Venue Manager. A Coach workspace was not available to the authenticated account. Team auction, Super Admin, and any workspace unavailable in the account’s selector are not assessed.

## Priority findings

### ATH-UX-001 - P0 - Operational dashboards duplicate navigation through tool carousels

**Observed in:** Organizer, Academy, Club, Venue dashboards.  
**Evidence:** Each dashboard exposes a grouped left sidebar and repeats many of the same destinations in a wide “Management Tools & Modules” horizontal carousel.  
**Impact:** On desktop this consumes primary above-the-fold space while hiding operational data and forces sideways navigation for tools already present in the sidebar.  
**Recommendation:** Remove the generic carousel at desktop. Keep the sidebar as canonical navigation and provide a compact, contextual pinned-action strip of no more than four actions.

### ATH-UX-002 - P0 - Source-of-truth ambiguity from static-looking dashboard content

**Observed in:** Organizer and Club dashboards.  
**Evidence:** A registration summary showed zero live registrations while the dashboard also displayed named event/activity content that read as real operational records.  
**Impact:** Managers cannot reliably distinguish live data from seeded/demo content. This can lead to incorrect decisions.  
**Recommendation:** Bind all operational cards to live data or use explicit zero/error states. Label non-production/sample content conspicuously and never place it next to live totals without provenance.

### ATH-UX-003 - P1 - Organizer competition management is card-first, not desktop-management-first

**Observed in:** Organizer Tournament list.  
**Impact:** Cards work for event discovery but do not scale to frequent filtering, scanning, bulk management, status comparison, or many tournaments.  
**Recommendation:** Default to a desktop table/list with status, dates, registrations, category count, and row actions. Offer visual cards as an optional view.

### ATH-UX-004 - P1 - Academy roster and batch states lack a consistent resolved-state contract

**Observed in:** Academy Student Roster and Coaching Batches.  
**Evidence:** Initial loading labels were visible before each page resolved to a useful empty state. The final empty states were clear, but timing/state behavior was inconsistent during review.  
**Impact:** In a data-heavy workspace, persistent or slow-loading labels make the user doubt whether data is missing or still loading.  
**Recommendation:** Use bounded loading skeletons, an explicit error/retry state, and a true empty state once the request settles. Standardize this across roster pages.

### ATH-UX-005 - P1 - Venue calendar has a strong model but needs desktop grid ergonomics

**Observed in:** Venue Live Calendar.  
**Evidence:** The view provides day navigation, facility filters, occupancy KPIs, status legend, and a time-by-court grid.  
**Impact:** It is a solid operational foundation; with more facilities, scanning will become difficult without frozen headers/columns and tighter state differentiation.  
**Recommendation:** Freeze the time column and header row, keep a persistent legend, use a constrained scroll container for the grid, and clearly differentiate available/booked/series/blocked with non-color cues.

### ATH-UX-006 - P1 - Venue booking ledger exposes personal data prominently

**Observed in:** Reservation Management table.  
**Evidence:** Customer phone numbers were visible in the desktop table.  
**Impact:** Full phone display increases shoulder-surfing and screenshot exposure risk.  
**Recommendation:** Mask numbers by default in list view, reveal on authorized detail view, and add a clear privacy policy decision to product requirements.

### ATH-UX-007 - P2 - Personal home mixes personal operations and marketplace discovery

**Observed in:** Authenticated Athlete home.  
**Impact:** Upcoming matches, registrations, bookings, and profile needs have to compete with sports discovery and workspace entry.  
**Recommendation:** Use “My day” and pending actions as the first desktop band. Place explore/community modules below or behind an Explore tab.

### ATH-UX-008 - P2 - Destructive member actions are visually exposed in the main table

**Observed in:** Club Members.  
**Evidence:** “Remove member” is directly repeated as the visible row action.  
**Impact:** Repeated destructive controls increase accidental-action risk and visual noise.  
**Recommendation:** Use a row overflow menu or a secondary action, confirmation dialog, and permission-based visibility. Do not hide the function; make it safer.

### ATH-UX-009 - P2 - Dense workspace sidebars need a stronger collapsed-mode/accessibility contract

**Observed in:** Academy and Venue.  
**Impact:** The broad navigation is well grouped but visually dense; a collapsed desktop sidebar is only useful when icon labels, tooltips, focus order, and active context remain unambiguous.  
**Recommendation:** Verify accessible names and keyboard focus, retain text tooltips on collapse, and cap section visual weight with spacing and separators.

### ATH-UX-010 - P2 - Metric labeling is clearer than metric prioritization

**Observed in:** Workspace dashboards.  
**Impact:** Several dashboards present many metric/feature cards before a concrete action queue.  
**Recommendation:** Use 3-5 KPIs maximum, then an ordered queue (“requires approval”, “today”, “at risk”) and supporting panels.

## Module-by-module findings

### Public home and Athlete workspace

**Strengths:** Clear product entry points and a discoverable workspace switcher.  
**Needs improvement:** The authenticated home has too many roles: personal dashboard, marketplace/discovery surface, and workspace selector.  
**Desktop direction:** one personal status band, one action queue, then discover/explore content in lower hierarchy.

### Organizer workspace

**Strengths:** Clear core modules: tournaments, registrations, inventory, finances, roles/officials, results.  
**Needs improvement:** Dashboard carousel duplication and static-looking content reduce trust; competition list should be data-management-first.  
**Desktop direction:** Kpis -> registrations/action queue -> active competition table -> reporting panels.

### Academy workspace

**Strengths:** Comprehensive module map and meaningful grouping (operations, people, competitions, finance, settings). Student and batch empty states provide useful CTA language once resolved.  
**Needs improvement:** A wide desktop sidebar plus dashboard carousel duplicates the system navigation; roster and batch pages need one standardized page shell.  
**Desktop direction:** reusable roster pages with search, filters, totals, table, and state-specific content.

### Club workspace

**Strengths:** Members page uses a recognizable table structure with role and status filters.  
**Needs improvement:** Dashboard repeats navigation and static-looking event content; direct destructive action placement needs safety treatment.  
**Desktop direction:** operational dashboard with attendance, pending joins, upcoming sessions, and financial items; data tables for members and activity.

### Venue Manager workspace

**Strengths:** The clearest operational IA. Navigation groups live operations, facilities, insights, and administration. The calendar and bookings ledger use appropriate table/grid concepts.  
**Needs improvement:** Dashboard carousel is redundant. Calendar needs scalable grid ergonomics. Ledger needs privacy-safe customer display and consolidated filtering.  
**Desktop direction:** use this workspace as the reference for the shared shell, then refine calendar/ledger states and grid behavior.

## Accessibility and visual quality review

Visible accessibility positives: most sidebar links, buttons, and tables exposed readable accessible names in browser accessibility inspection. The information architecture is generally semantic enough for route navigation.

Required follow-up validation: keyboard-only traversal, focus visibility, color contrast, text scaling, screen-reader announcement of loading/error changes, table header associations, tooltip behavior in collapsed sidebar, and status differentiation without color alone. These were not executed, so no compliance claim is made.

## Responsive/viewport limitation

This execution used live desktop browser inspection but could not programmatically enforce the requested 1366x768, 1440x900, and 1920x1080 viewport sizes through the available browser harness. Findings are therefore desktop-oriented visual/structural observations, not a completed multi-viewport visual regression test. Validate the proposed redesign at those three sizes before release.

## Recommended roadmap

| Priority | Work | Outcome |
|---|---|---|
| P0 | Shared desktop shell, canonical sidebar navigation, remove duplicated dashboard tool carousels | Clear architecture and more useful first viewport |
| P0 | Replace ambiguous static/dashboard content with live, zero, or explicit sample state | Restored data trust |
| P1 | Standard desktop data-table and state patterns | Scalable operations across organizer, academy, club, venue |
| P1 | Venue calendar/booking ledger refinement and privacy masking | Faster scheduling and lower exposure risk |
| P2 | Athlete dashboard split between “My day” and discovery | Better personal task focus |
| P2 | Full accessibility + fixed-viewport validation | Reduced usability and compliance risk |

## Audit limitations

- No data was created, edited, deleted, booked, paid, or submitted.
- No Coach, Team Auction, Super Admin, or unavailable workspace was accessible to the session.
- No form, modal workflow, payment flow, or transaction confirmation was tested.
- No mobile page was tested or changed.
- Findings are UI/UX observations, not proof of backend defects except where visible state/data trust is directly affected.
