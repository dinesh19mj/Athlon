# ATHLON — APPLICATION DISCOVERY REPORT
**Execution Date:** 2026-09-18  
**Environment:** Local QA (Windows / Node.js Next.js / Spring Boot Microservices / PostgreSQL)  
**Lead Auditor:** Senior QA Engineer / Technical Auditor  

---

## 1. Executive Summary of Discovery

The ATHLON sports management platform has been comprehensively inspected across its frontend client applications, backend microservices, gateway routing, and database layer. All core services are actively running and healthy in the local test environment.

---

## 2. Technology Stack & Topology

### 2.1 Frontend Applications

| Application | Framework / Technology | Local URL | Port | Purpose / Modules Covered |
| :--- | :--- | :--- | :--- | :--- |
| **`athlon-user`** | Next.js 14 (App Router), React, TypeScript, Zustand, Tailwind CSS | `http://localhost:3000` | 3000 | Player Portal, Tournament Registration, Public Matches, Organizer / Academy / Club / Coach / Venue Workspaces, Live Scoring, Booking Engine |
| **`athlon-admin`** | Next.js 14, React, TypeScript, Tailwind CSS | `http://localhost:3001` | 3001 | Superadmin Console, Organization Audits, Platform Subscriptions, User & Sport Management |
| **`athlon-mob`** | React Native / Expo (or mobile web target) | `http://localhost:3002` | 3002 | Mobile client runtime |

### 2.2 Backend Microservices

| Service Name | Technology | Internal Port | Gateway Route Prefix | Health / Status |
| :--- | :--- | :--- | :--- | :--- |
| **`GATEWAYSERVICE`** | Spring Cloud Gateway (MVC), Spring Boot 3.3.4 | `5050` | `/api/*` (Central Entry Point) | **UP** (`http://localhost:5050`) |
| **`AUTHSERVICE`** | Spring Boot, Spring Security, JWT (HMAC256) | `5051` | `/api/auth/*` | **UP** (Port 5051) |
| **`IDENTITYSERVICE`** | Spring Boot, Spring Data JPA, PostgreSQL | `5052` | `/api/identity/*` | **UP** (Port 5052) |
| **`TOURNAMENTSERVICE`** | Spring Boot, Spring Data JPA, WebSockets, PostgreSQL | `5053` | `/api/tournament/*` | **UP** (Port 5053) |

### 2.3 Persistence & Databases
- **Primary Relational DB:** PostgreSQL on `localhost:5432` (`athlon_db` / service schemas)
- **Local Cache / Session Storage:** LocalStorage / Zustand store (`useAuthStore`, `useWorkspaceStore`) + JWT Bearer tokens.

---

## 3. Route & Module Inventory

### 3.1 Public & Player Portal Routes (`athlon-user`)
- `/` — Homepage / Discover Tournaments / Matches / Venues / Academies
- `/login` — User authentication
- `/register` — Account registration
- `/profile` — Personal player profile, Sports profiles, Statistics, Match history
- `/tournaments` — Public tournament search and registration
- `/tournaments/[id]` — Tournament details, categories, rules, draw bracket viewer
- `/venues` — Public sports venues and arenas listing
- `/venues/[venueUuid]` — Venue details, facility court booking, slot selector, instant checkout
- `/academies` — Public sports academy directory
- `/coaches` — Public sports coach profiles & certifications
- `/rankings` — Player leaderboard & ranking tables
- `/my-bookings` — Personal court/facility reservation history

### 3.2 Workspace & Multi-Tenant Routes (`/org/[orgId]/*`)
ATHLON uses a contextual multi-workspace architecture under `/org/[orgId]`:
- `/org/[orgId]/dashboard` — Consolidated Workspace Dashboard
- **Tournament Organizer Workspace:**
  - `/org/[orgId]/tournaments` — Tournament manager, creation wizard, draw generators
  - `/org/[orgId]/registrations` — Participant review & approval
  - `/org/[orgId]/categories` — Category / event definitions
  - `/org/[orgId]/matches` — Fixture management & court assignment
  - `/org/[orgId]/match-setup` — Official match setup & umpire allocation
  - `/org/[orgId]/umpiring` — Live scoring interface
  - `/org/[orgId]/results` — Bracket progress & podium champions
  - `/org/[orgId]/team-championship` — Team event roster & tie management
- **Academy Workspace:**
  - `/org/[orgId]/academy` — Academy Profile & Sports selection
  - `/org/[orgId]/centres` — Multiple training centres / locations
  - `/org/[orgId]/batches` — Training batches & schedules
  - `/org/[orgId]/students` — Student admissions & enrollment
  - `/org/[orgId]/coaches` — Academy coach roster & batch assignments
  - `/org/[orgId]/attendance` — Student / coach session attendance
  - `/org/[orgId]/fees` — Fee collection, invoices, receipts
  - `/org/[orgId]/performance` — Student skill rating & progress tracking
  - `/org/[orgId]/inventory` — Sports equipment & stock tracking
- **Club Workspace:**
  - `/org/[orgId]/club` — Club profile & memberships
  - `/org/[orgId]/members` — Member directory & tiers
  - `/org/[orgId]/club-matches` — Internal club ladders & friendlies
- **Venue Manager Workspace:**
  - `/org/[orgId]/venue` — Arena details & operating hours
  - `/org/[orgId]/facilities` — Courts, turfs, and lighting amenities
  - `/org/[orgId]/schedule` — Slot grid & reservation calendar
  - `/org/[orgId]/staff` — Venue reception & maintenance personnel

---

## 4. Discovered Tournament Engines & Formats

1. **KNOCKOUT (Single Elimination):**
   - Supports 2, 4, 8, 16, 32, 64 participant draws.
   - Power-of-two and non-power-of-two (BYE distribution) handling.
   - Winner automatically progresses to Quarterfinals, Semifinals, and Finals.
2. **LEAGUE / ROUND-ROBIN:**
   - Multi-pool division (Pool A, Pool B, etc.).
   - Standard round-robin pairing ($N \times (N-1)/2$ matches per pool).
   - Dynamic Standings table (Played, Won, Lost, Points, Score Difference).
   - Qualification to Knockout stage.
3. **TEAM EVENT / TEAM CHAMPIONSHIP:**
   - Multi-player squads and categories (e.g. Men's Singles, Men's Doubles, Mixed Doubles).
   - Toss & category match sequence.
   - Tie scoring and team advancement.
4. **ORGANIZER-MANAGED / MANUAL PARTICIPANT ENTRY:**
   - Offline / spot registration without requiring public player accounts.
   - Same downstream draw, fixture, and live scoring engine.

---

## 5. Discovered Security & Role Model

- **Roles:** `ROLE_USER`, `ROLE_ORGANIZER`, `ROLE_ACADEMY_OWNER`, `ROLE_COACH`, `ROLE_CLUB_MANAGER`, `ROLE_VENUE_MANAGER`, `ROLE_SUPERADMIN`.
- **JWT Header:** `Authorization: Bearer <token>`, with Gateway injecting `X-User-Id`, `X-User-Email`, `X-User-Roles`.
- **Tenant Isolation:** Entity ownership validated via `organizerUuid`, `academyId`, `clubId`, `venueUuid`.

---

## 6. Service Health Check Status

- **Gateway (`:5050`):** UP (`{"service":"GATEWAYSERVICE","status":"UP"}`)
- **Auth (`:5051`):** UP & Responsive
- **Identity (`:5052`):** UP & Responsive
- **Tournament (`:5053`):** UP & Responsive
- **User Frontend (`:3000`):** UP & Serving HTTP 200
- **Admin Frontend (`:3001`):** UP & Serving HTTP 200

---

## 7. QA Execution Roadmap

1. **Phase 1:** Isolated E2E Credential Generation (`E2E_` prefixed users across roles).
2. **Phase 2:** Authentication & Workspace Switching Integrity.
3. **Phase 3:** Full Knockout Tournament Lifecycle (8 Participants).
4. **Phase 4:** Full League Tournament Lifecycle (2 Pools + Knockout).
5. **Phase 5:** Team Event & Manual Tournament Flows.
6. **Phase 6:** Live Scoring Resilience & Edge Cases.
7. **Phase 7:** Academy, Club, Coach, and Venue Facility Bookings.
8. **Phase 8:** Authorization, Multi-Tenant Isolation & Security Auditing.
9. **Phase 9:** Responsive UI & Theme Inspection.
10. **Phase 10:** Compilation of All 21 QA Reports and `BUGS.csv`.
