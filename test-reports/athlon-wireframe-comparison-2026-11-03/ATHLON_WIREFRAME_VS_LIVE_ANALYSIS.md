# ATHLON Wireframe vs Live Application Analysis

**Date:** 3 November 2026 (Asia/Kolkata)  
**Compared:** extracted ATHLON wireframe and PRD/SRD from `Athlon.zip` against the authenticated live application at `https://athlon.co.in`  
**Method:** wireframe/PRD code and document review; read-only login and live-browser inspection. No live records, configuration, payments, or account data were changed.

## Executive conclusion

The wireframe is the stronger **product blueprint**. It defines a complete two-sided sports ecosystem with a shared business core, explicit feature priorities, required state models, and a phased rollout. The current application is the stronger **working product foundation** in the areas it already implements: public discovery, venue booking, tournament registration/live scoring, and organization workspaces.

They should not be treated as competing designs. The best approach is to retain the live app's real data and working flows, then use the wireframe/PRD as the target operating model and backlog. Do not attempt to reproduce every wireframe screen immediately: the PRD itself schedules scope in phases. The highest-value next step is to close launch-critical gaps in venue operations, shared business core, tournament operations, academy/club workflows, and platform administration.

## Evidence and confidence model

| Label | Meaning |
|---|---|
| Observed live | Rendered in the authenticated browser during this review. |
| Code route present | A frontend route exists in the local source tree, but its complete behavior was not executed in this session. |
| Not observed | No corresponding visible live capability was found in the inspected workspace/navigation. This is not proof that no backend code exists. |
| Out of current account scope | The role/module was not available to the supplied account. |
| Wireframe intent | A screen or stated requirement in the supplied wireframe/PRD, not proof of production readiness. |

### Live pages actually inspected

- Public marketplace/home, then authenticated Player home.
- Organizer dashboard.
- Academy dashboard.
- Club dashboard.
- Venue dashboard.

The supplied account exposed Player, two Organizer organizations, Community, Academy, Club, and Venue workspaces. It did not expose Coach, Gym, or Super Admin. Local wireframe HTML was structurally reviewed from the extracted archive; the browser policy did not allow opening `file:` pages directly, so no claim is made that every wireframe pixel was visually reviewed.

## What the wireframe adds conceptually

The wireframe package has 167 mock screens across seven products: Consumer (37), Venue ERP (30), Events (26), Club (18), Academy (22), Gym (21), and Admin (13). It also defines a shared Business Core for CRM, invoicing, communication, HR/payroll, roles/audit, public profile/go-live, reports, organization linking, and subscription billing.

This is the key difference: the live app is organized primarily around existing operational pages, while the wireframe is organized around a reusable business operating model and complete user journeys. The latter provides clearer ownership, state transitions, and role boundaries.

## Comparison by product area

### 1. Consumer/player experience

| Requirement or wireframe approach | Live evidence | Assessment | Recommended action |
|---|---|---|---|
| Mobile-first consumer app with sport switcher and five fixed tabs: Home, Play, Events, Community, Profile | Observed live: public/authenticated home has marketplace cards, sport filters, tournaments, venues, community sessions, results, and a mobile-style bottom navigation. | Partial alignment | Keep current discovery data. Introduce a persistent selected-sport context and make all discovery/results scoped to it. |
| Global search across venue, event, academy, coach, club, gym, player; filter by distance, price, rating, availability, amenities | Observed live: text search plus sport/location filters on home. | Partial | Expand to typed cross-entity search, saved filter state, distance/map and availability-aware result ranking. |
| Map/list discovery | Not observed live. | Gap | Add after geo data and search index are reliable; do not ship a static map. |
| Book in three steps with live price/tax, slot lock, online/pay-at-venue, confirmation QR, calendar and cancellation/reschedule | Observed live: venue discovery and booking entry points; prior code/routes cover venue detail and booking. Payment/QR/cancellation were not executed. | Partial / unverified | Prioritize transparent checkout breakdown, backend slot-lock proof, booking receipt/QR, cancellation policy and self-service rescheduling. |
| Open matches and split payment | Observed live: community sessions and confirmed-playing state. | Partial | Add explicit host, join, participant cap, per-player liability, split collection and payout states. |
| Academy enrolment/trial and coach 1:1 booking | Code routes exist for academies and coaches. Not executed from the live account. | Unverified | Connect directory detail to trial/enrolment/booking flows with payment, consent and capacity states. |
| Family/child/guardian account | Not observed live. | Major gap for academy audience | Design a guardian account model, consent, restricted minor visibility, child selector and parent dashboard before public launch. |
| Wallet, payment history, GST receipts, notification preferences, privacy export/delete | Code routes exist for rewards/referrals/settings; live home did not show a complete account ledger. | Partial / unverified | Consolidate a cross-sport account ledger and privacy centre; do not expose payment status as client state. |

### 2. Venue ERP and booking operations

| Requirement or wireframe approach | Live evidence | Assessment | Recommended action |
|---|---|---|---|
| Resource-column live calendar with facilities, bookings, recurring series, pricing, blocks, reports and finance | Observed live Venue workspace provides Calendar, Bookings, Recurring, Facilities, Pricing, Blocks, Reports, Finances, Settings and a live-calendar entry. | Strong partial alignment | This is the strongest current workspace. Refine around a single operational calendar and standardized states. |
| Multi-resource setup including parent-child split resources | Observed live: Facilities and Courts module. Parent-child conflict behavior not tested. | Unverified | Add resource hierarchy, conflict visualization, and tests for parent/child double-booking protection. |
| Slot configuration/policies: duration, buffers, lead time, cancellation, no-show, deposit | Observed live: pricing and blocks modules; policy configuration not visible in inspected dashboard. | Partial | Build an explicit policy screen and surface the applied policy during checkout. |
| Atomic slot lock across all channels | Not observable from UI alone. | High-risk unverified | Verify by backend concurrency test before release; this is a launch gate, not merely a UX enhancement. |
| Walk-in/phone booking, receipt, QR check-in, no-show/overtime | Observed live: counter walk-in CTA and Bookings module. Check-in/QR/no-show not observed. | Partial | Finish front-desk workflow with quick customer lookup/create, payment capture, receipt, scan-first check-in and auditable no-show transition. |
| Enquiries/quotes/contracts, waitlist, reviews/issues, subscriptions/passes, add-ons | Not observed in live Venue navigation. | Gap / not observed | Stage as P1 after the core booking and policy model. |
| ERP finance: income/expense, cash closing, P&L, GST/TDS/settlement | Observed live: Finances and Reports links, but no full finance workflow reviewed. | Unverified | Define a shared ledger/invoice model first. Build reports from immutable payments/expenses rather than dashboard-only aggregates. |
| Channel manager and third-party sync | Not observed. | Future scope | Keep it off initial launch unless inventory locking, rate parity and support capability are proven. |

### 3. Tournament/Event suite

| Requirement or wireframe approach | Live evidence | Assessment | Recommended action |
|---|---|---|---|
| Create event, registrations, draw, fixtures, scheduling and live scoring | Observed live Organizer home exposes Create, Manage, Community, registrations and tournament list; source includes tournament, draw, schedule and umpire scoring routes. | Strong partial alignment | Keep this as a core differentiator. Complete end-to-end state transition testing on all formats. |
| Format breadth: knockout, double elimination, round robin, group + knockout, league, Swiss, ladder; sport-specific formats | Existing code and prior QA indicate knockout, league and team events. Full breadth was not executed in this session. | Partial / unverified | Publish a supported-format matrix. Do not market formats until complete draw, score and progression behavior is verified. |
| Registration: partner invite, team roster, age proof, waiver, discount codes, early-bird, waitlist, offline/bulk | Observed live Organizer dashboard has registration status filters; deeper registration functions not inspected. | Partial | Prioritize partner/roster, waiver, document validation and payment/refund states. Make each validation visible to the organizer. |
| Scheduling across courts with rest time and venue availability | Source route exists; not observed in live dashboard. | Unverified | Add constraint explanation, conflict warnings and linked-venue block confirmation. |
| Live scoring with corrections/dispute audit; automatic standings/bracket/stats/rating update | Source includes sport-specific scoring boards and live-score routes. Not executed in this comparison. | Strong code foundation; live workflow unverified | Establish immutable score events, correction audit, and result-progression integrity as release gates. |
| Tickets, QR gate scan, sponsors, certificates/awards, post-event P&L/gallery/feedback | Not observed in current Organizer dashboard or source route inventory. | Gap / not observed | Treat ticketing and gate scan as a separate bounded product; do not blend with registration payment. Certificates and post-event assets can follow scoring stability. |

### 4. Academy suite

| Requirement or wireframe approach | Live evidence | Assessment | Recommended action |
|---|---|---|---|
| Academy dashboard: batches today, fee risk, enquiries requiring action | Observed live: Academy home has Students, Batches, Admissions and 15 tool destinations, but current dashboard showed a loading session area. | Partial | Replace tool inventory with an action queue: today’s sessions, absent students, fee risk, pending admissions. |
| Batches, timetable, capacity, waitlist, coach/court and linked-venue blocks | Observed live: Batches and Centres/Facilities modules. Detailed behavior not inspected. | Partial / unverified | Make capacity, attendance, coach assignment and linked-court availability explicit on one schedule view. |
| Admission/trial, guardian/medical/consent, transfers/freeze/drop | Observed live: Admissions module destination. Detailed flow unverified. | Partial | Complete admission workflow before broad enrollment marketing; add consent/guardian/medical data protections. |
| Fee structures, instalments, discounts, invoices, defaulters/refunds | Live Academy navigation includes Finances. Full fee workflow not observed. | Unverified | Build on shared invoices/ledger and offer fee aging, reminders and permissioned write-offs. |
| Student record with guardian, health, fees, attendance, assessment, achievements, tournament/media/notes | Observed live: Students, Progress, Attendance, Matches and Feed destinations. | Partial | Convert these into one canonical student profile with timeline and role/guardian controls. |
| Assessments, report cards, parent app, monitored chat | Not observed. | Gap / not observed | Plan after core enrolment/attendance/fees. Parent privacy and child safety require a dedicated design/security review. |
| Leads and trial-to-enrol conversion | Not observed. | Gap | Add CRM/lead pipeline at shared-core level rather than academy-only. |

### 5. Club/community suite

| Requirement or wireframe approach | Live evidence | Assessment | Recommended action |
|---|---|---|---|
| Membership plans, tiers, QR ID card, approval and recurring fee | Observed live: Club workspace has Members, Finances, rankings, attendance, matches, inventory. Membership plan builder was not visible. | Partial / gap | Add plan, lifecycle, benefit and renewal architecture before calling this a membership system. |
| Dues, invoice/payment links, late fee, concession, receipt | Observed live: Finances module; detailed dues not inspected. | Unverified | Build membership ledger and clearly distinguish dues from one-off club payments. |
| Teams, squads, roles, practice attendance and Excel import | Observed live: Members, Matches, Attendance. | Partial | Add squad view, role model, import validation and attendance by session. |
| Events/RSVP, polls/posts/notices, community feed | Observed live: Community workspace exists and club dashboard links to tournaments. Feed/polls were not observed. | Partial | Unify Community and Club terminology. Implement posts/polls with audience scope and moderation before public scale. |
| Linked venue slots, linked coaches, club-hosted tournaments | Not observed. | Gap / unverified | Depend on organization-linking core and venue conflict-safe reservation model. |

### 6. Shared business core and platform admin

| Wireframe/PRD shared capability | Live evidence | Assessment | Recommended action |
|---|---|---|---|
| Organization, branches, live/draft go-live gate, public profile | Live account supports multiple organizations/workspace switching and public listing. | Strong partial | Add explicit go-live checklist, required KYC/tax/bank state and branch-level configuration. |
| RBAC per module/branch plus immutable audit log | Code routes include roles, settings/permissions and admin audit logs. Behavior was not executed. | Code route present / unverified | Make backend authorization the source of truth; audit all financial, role and scoring corrections. |
| CRM, segments and lead pipeline | Not observed in live workspace navigation. | Gap | Implement shared CRM before separate academy/venue lead features. |
| Invoices, refunds, credit notes, GST and settlements | Code/admin payment routes exist; no finance flow executed. | Unverified | Define ledger, invoice status and reconciliation invariants first. |
| Communication templates, reminders, push/SMS/WhatsApp/email | Not observed. | Gap | Build notification preferences, templates, delivery log and retry strategy before campaign UI. |
| HR/payroll, assets, maintenance, cleaning | Staff/inventory modules exist in some workspaces; full HR/payroll/maintenance/cleaning not observed. | Partial / gap | These are Phase 3+ ERP scope, not MVP blockers. Keep data model ready but avoid surface-area expansion before booking/fees are reliable. |
| Reports with export/scheduling/row-level permission | Reports/analytics routes exist. Export/schedule not observed. | Unverified | Define KPI semantics, source tables and permissions; do not rely on front-end-only dashboards. |
| Super admin: onboarding/KYC, sports config, settlement, support, moderation, CMS, feature flags | Source includes admin pages for organizations, sports, payments, reports, subscriptions, audit logs and SEO. Supplied account did not expose admin. | Code route present / out of account scope | Review separately using a controlled admin account; protect impersonation and payment override with audit/reason/dual control. |
| Gym product | Wireframe/PRD has a complete Gym suite. No Gym route/workspace was exposed by the current live account or app route inventory. | Not observed | Treat as a separate future product, not a missing defect in current sports MVP. |

## Best approach: recommended product strategy

### Keep from the live product

1. Existing marketplace entry points, multi-workspace account model, venue booking foundation, event/tournament routes, and sport-specific scoring implementation.
2. Live-data integration rather than static wireframe data.
3. Current split between player/public routes and organization routes.

### Adopt from the wireframe/PRD

1. **One shared business core:** organization/branch, roles/audit, CRM, invoices/ledger, communication, public-profile/go-live, reports, organization links, plan/billing.
2. **Role-centered dashboard design:** every dashboard starts with work that requires action, not a carousel of feature links.
3. **Explicit lifecycle/state models:** booking, payment, invoice, registration, score correction, membership, enrolment and organization go-live states must be named and auditable.
4. **Phased scope:** use PRD Phase 1 for venue/consumer/Admin core; Phase 2 for events/academy; Phase 3 for club/gym/HR; Phase 4 for integrations and advanced social/analytics.
5. **Mobile companions only for operational tasks:** scorer, front desk, attendance/check-in. Do not attempt desktop parity on a mobile surface.

### Avoid from the wireframe

1. Do not build all 167 mock screens before validating core workflows.
2. Do not treat high-fidelity mock data as an implementation contract.
3. Do not build ticketing, channel manager, HR/payroll, cleaning, IoT, chat and gym in the same release as core booking and scoring.
4. Do not present a wireframe button as proof that a backend state machine, settlement model, or security control exists.

## Missing-detail backlog, prioritized

### P0 - launch integrity

1. **Booking integrity:** server-authoritative slot lock, exclusion constraint/double-booking protection, payment webhook reconciliation, idempotency, booking status history and cancellation/refund policy.
2. **Organization go-live:** publish gate that verifies profile/address/geo, sport/resource/programme, contact, payout and verification status before public visibility.
3. **Authorization and audit:** backend tenancy scope, configurable role permissions, immutable audit history for roles, money, booking overrides and score corrections.
4. **Consumer onboarding:** mobile OTP or equivalent verified auth, sport/skill/location capture, clear profile completion.
5. **Tournament integrity:** documented supported formats, registration status/payment rules, draw/schedule validation, score correction audit and winner progression checks.

### P1 - commercial operations

1. Shared CRM, lead/enquiry/quote pipeline and contact timeline.
2. Invoices, receipts, GST/tax data, refunds/credit notes, cash/card/UPI recording and tenant/platform settlement reconciliation.
3. Academy admission/trial, guardian/consent/medical data, fees/dues and parent access.
4. Club membership plans, dues, IDs, squads/events/RSVP and communication/polls.
5. Venue recurring/subscription bookings, walk-in/check-in/no-show, enquiries/quotes, waitlist, add-ons and review/issue workflow.
6. Notifications: template/delivery history/preferences and meaningful deep links.

### P2 - scale and differentiation

1. Public map/geo search, recommendation, ratings/reviews and full per-sport rating/leaderboard system.
2. Tickets/QR gate app, sponsor tools, certificates, event gallery and post-event finance/feedback.
3. Parent/coach mobile companion applications, offline attendance/scoring/check-in queues.
4. Channel manager, external calendar/marketplace sync, webhooks and accounting exports.
5. HR, payroll, maintenance, asset/cleaning, gym and IoT features.

## UX and information architecture changes

1. Replace each workspace “Management Tools & Modules” inventory with a compact quick-action area plus a prioritized work queue.
2. Make sidebar navigation the canonical module map. Avoid duplicated dashboard carousels.
3. Give each business record one canonical detail page: Booking, Participant/Team, Student, Member, Organization, Invoice and Match.
4. Standardize loading, empty, error, success, pending and permission-denied states across every workspace.
5. Separate **marketplace discovery** (player) from **operations** (organization) and **platform operations** (admin) visually and by navigation.
6. Build mobile-first operational flows for scanning, attendance, score entry and counter bookings; retain desktop-first table/calendar workflows for management.

## Proposed delivery plan

| Release | Scope | Exit criteria |
|---|---|---|
| R1 - Core trust | Booking lock/payment reconciliation, organization go-live, RBAC/audit, consumer profile/onboarding, core venue dashboard | Concurrency test proves one booking per slot; financial and org state changes audited. |
| R2 - Commerce & events | Invoice/ledger/receipts, complete registration/draw/schedule/scoring, venue counter/check-in, CRM | One real tournament can go from setup through confirmed results; bookings, invoices and payments reconcile. |
| R3 - Academy & club | Admission/fees/attendance, membership/dues/RSVP, communications, parent/guardian basics | A student and club member can complete their main lifecycle without manual side channels. |
| R4 - Scale | Ticketing, reviews, rating/leaderboard, maps, channel integrations, advanced reports | Product metrics, support tooling and data controls are production-ready. |

## Validation needed before implementation decisions

- Execute live E2E journeys with disposable QA data for booking, payment, cancellation/refund, tournament registration/draw/scoring, academy admission/fee and club membership.
- Run tenant-isolation, role-permission, double-booking and payment-reconciliation tests.
- Review live Admin using an explicitly authorized non-production admin account.
- Run a separate accessibility and responsive audit with desktop and mobile viewport coverage.
- Decide MVP sports/city, payment gateway/settlement strategy, organization verification policy, and whether Gym is in the launch scope.
