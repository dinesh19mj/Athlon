# ATHLON Super Admin Module: Architecture & Detailed Implementation Plan

**Target System**: ATHLON Multi-Sport Production Platform ([https://athlon.co.in](https://athlon.co.in/))  
**Document Classification**: Enterprise Architecture & Engineering Specification  
**Version**: 1.0.0  
**Status**: Ready for Implementation Review  

---

## Executive Summary

The ATHLON platform currently serves multi-sport operations including Tournaments, Academies, Clubs, Venues, Coaches, and Communities across a distributed Spring Boot microservices backend and a Next.js (App Router) frontend.

This specification details the end-to-end design and phased rollout of the **ATHLON Super Admin Module**. In strict compliance with architectural constraints:
1. **Zero New Applications / Subdomains**: Super Admin is embedded inside the existing Next.js App Router under `/admin` and backed by the existing API Gateway and microservices.
2. **Platform Context vs. Workspace Context**: Super Admin is a platform-level authorization level (Level 1), entirely decoupled from tenant organizations/workspaces (Level 2) and player accounts (Level 3). It does **not** consume subscription tiers, does **not** alter the user's active workspace state in `useWorkspaceStore`, and does **not** affect regular users.
3. **Additive Schema & Backward Compatibility**: Existing database tables (`users`, `organizations`, `subscription_packages`, `organization_subscriptions`, `offline_payment_records`, `roles`, `user_roles`) are preserved. Existing API endpoints and JWT claims remain untouched.

---

## 1. Existing Architecture & Codebase Baseline Audit

### 1.1 Microservices Infrastructure & Gateway Routing

| Service Name | Port | Base Path | Database Datasource | Primary Domain Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **`GATEWAYSERVICE`** | `5050` | `/api/**` | None (Spring Cloud Gateway) | Central routing, CORS handling, client proxying |
| **`AUTHSERVICE`** | `5051` | `/api/auth/**` | PostgreSQL RDS (`athlon`) | User authentication, credentials, JWT generation, password hashes |
| **`IDENTITYSERVICE`** | `5052` | `/api/identity/**` | PostgreSQL RDS (`athlon`) | Organizations, subscriptions, user roles, user profiles, RBAC |
| **`TOURNAMENTSERVICE`** | `5053` | `/api/tournament/**`, `/ws/**` | PostgreSQL RDS (`athlon`) | Tournaments, formats, fixtures, live scoring, announcements |
| **`PAYMENTSERVICE`** | `5054` | `/api/payments/**` | PostgreSQL RDS (`athlon`) | Payment orders, offline/manual payments ledger, webhooks |
| **`MARKETPLACESERVICE`** | `5055` | `/api/marketplace/**`, `/api/platform/**` | PostgreSQL RDS (`athlon`) | Module configs, catalog, platform metadata |

### 1.2 Authentication & Token Claims Flow
- **Current Flow**:
  1. Frontend submits credentials to `POST /api/auth/login`.
  2. `AUTHSERVICE` verifies password against BCrypt hash in `credentials` table.
  3. `JwtUtil.generateAccessToken(email, userId, userUuid, role)` issues an HS512 JWT signed with 256-bit+ secret.
  4. Current payload claims: `sub: userUuid`, `userId: Long`, `userUuid: UUID`, `email: String`, `role: String`.
  5. `LoginResponse` returns `{ accessToken, refreshToken, userId, userUuid }`.
- **Frontend Storage**:
  - `useAuthStore` in `athlon-user` persists `token`, `userId`, `userUuid`, and `subscriptions`.
  - Next.js client rewrites `/api/:path*` to `http://127.0.0.1:5050` (Gateway).
  - Every outbound call via `fetchClient` automatically attaches `Authorization: Bearer <token>`, `X-User-Id`, and `X-User-Uuid`.

### 1.3 Tenant Organization & Workspace Model
- **Entities**:
  - `Organization` (`organizations` table): Contains `organizationid`, `organizationuuid`, `name`, `type` (`CLUB`, `ACADEMY`, `COURT`/`VENUE`, `ORGANIZER`, `COACH`), `userid`, `useruuid`, `isactive`.
  - `useWorkspaceStore` holds `activeWorkspaceId: string | 'PERSONAL'`. Switching workspaces switches this client-side state without altering the underlying user account.
- **Rule Enforcement**: Super Admin is **NOT** an organization. Super Admin permissions are platform-scoped and evaluated independently of `activeWorkspaceId`.

### 1.4 Subscription & Payment Architecture
- **Entities**:
  - `SubscriptionPackage` (`subscription_packages` table): Contains `packageid`, `packageuuid`, `name`, `price`, `durationmonths`, `features` (TEXT JSON), `isactive`.
  - `OrganizationSubscription` (`organization_subscriptions` table): Links `organizationid` with `packageid`, `startdate`, `enddate`, `status` (`ACTIVE`, `EXPIRED`, `PENDING`), and `paymentreference`.
  - `OfflinePaymentRecord` (`offline_payment_records` table in `PAYMENTSERVICE`): Manages manual/desk payments with statuses `PENDING`, `VERIFIED`, `REJECTED`, `COLLECTED_AT_DESK`.
- **Current Gaps Identified**:
  1. No centralized pending subscription request lifecycle entity that binds a user/org subscription order with an offline payment verification and admin approval workflow.
  2. Plan mutations currently update rows in place without snapshotting, which could alter limits for existing subscribers.

---

## 2. Super Admin Authorization & Role Model

### 2.1 The Three-Tier Hierarchy
```
┌────────────────────────────────────────────────────────────────────────┐
│                   Level 1 — PLATFORM SUPER ADMIN                       │
│        Context: Platform-wide | Scope: All entities | Route: /admin    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌──────────────────────────────────────┐   ┌─────────────────────────────────────┐
│  Level 2 — Organization Admin / Host │   │       Level 3 — Regular User        │
│  Context: Specific Organization      │   │  Context: Personal Profile          │
│  Scope: Owned/Managed Workspaces     │   │  Scope: Self registrations, matches │
│  Route: /org/[id], /academies, etc.  │   │  Route: /(personal), /tournaments   │
└──────────────────────────────────────┘   └─────────────────────────────────────┘
```

### 2.2 Role & Permission Definitions
- **Platform Roles**:
  - `PLATFORM_SUPER_ADMIN`: Unrestricted platform administration, package creation, user/org suspension, manual approvals, settings.
  - `PLATFORM_ADMIN`: Day-to-day operations (view dashboard, inspect users/orgs, review tournament logs).
  - `PLATFORM_FINANCE`: Financial ledger, payment verification, subscription approval, refund requests.
  - `PLATFORM_SUPPORT`: Read-only access to users, organizations, tournaments, and activity logs.

- **Granular Permissions Matrix**:
  - `PLATFORM_DASHBOARD_VIEW`
  - `USER_VIEW`, `USER_SUSPEND`, `USER_REACTIVATE`
  - `ORGANIZATION_VIEW`, `ORGANIZATION_VERIFY`, `ORGANIZATION_SUSPEND`, `ORGANIZATION_REACTIVATE`
  - `WORKSPACE_VIEW`, `WORKSPACE_INSPECT`
  - `SUBSCRIPTION_PLAN_VIEW`, `SUBSCRIPTION_PLAN_CREATE`, `SUBSCRIPTION_PLAN_UPDATE`, `SUBSCRIPTION_PLAN_ARCHIVE`
  - `SUBSCRIPTION_REQUEST_VIEW`, `SUBSCRIPTION_REQUEST_APPROVE`, `SUBSCRIPTION_REQUEST_REJECT`
  - `PAYMENT_VIEW`, `PAYMENT_VERIFY_MANUAL`, `PAYMENT_REFUND_REQUEST`
  - `TOURNAMENT_ADMIN_VIEW`
  - `REPORT_VIEW`, `REPORT_EXPORT`
  - `AUDIT_LOG_VIEW`
  - `PLATFORM_SETTINGS_VIEW`, `PLATFORM_SETTINGS_UPDATE`

### 2.3 JWT Enhancement (100% Backward Compatible)
`AUTHSERVICE` currently issues tokens with `claim("role", role)`.
1. During `AuthService.login`, look up `user_roles` joined with `roles` where `isactive = true`.
2. If any role equals `PLATFORM_SUPER_ADMIN` (or other platform roles), set `role = "PLATFORM_SUPER_ADMIN"` and add `claim("platformRoles", [roles])`.
3. If no platform role exists, defaults to `"USER"` as before.
4. Non-admin users experience identical token generation, claims, and response shapes.

---

## 3. Database Schema Design & Migrations

All schema adjustments are strictly **additive** to preserve current data integrity.

### 3.1 New Entity: `platform_admin_audit_logs`
Tracks all privileged actions for security and compliance.
```sql
CREATE TABLE IF NOT EXISTS platform_admin_audit_logs (
    audit_id BIGSERIAL PRIMARY KEY,
    audit_uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    admin_user_id BIGINT NOT NULL,
    admin_user_uuid UUID NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    reason TEXT,
    request_ip VARCHAR(64),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_audit_action ON platform_admin_audit_logs(action);
CREATE INDEX idx_admin_audit_entity ON platform_admin_audit_logs(entity_type, entity_id);
CREATE INDEX idx_admin_audit_created ON platform_admin_audit_logs(created_at DESC);
```

### 3.2 New Entity: `platform_subscription_requests`
Binds subscription orders, payment verification, and automated entitlement activation.
```sql
CREATE TABLE IF NOT EXISTS platform_subscription_requests (
    request_id BIGSERIAL PRIMARY KEY,
    request_uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL,
    user_uuid UUID NOT NULL,
    organization_id BIGINT NOT NULL,
    organization_uuid UUID NOT NULL,
    package_id BIGINT NOT NULL,
    package_uuid UUID NOT NULL,
    package_snapshot JSONB NOT NULL,
    billing_period_months INT NOT NULL DEFAULT 1,
    amount NUMERIC(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    payment_method VARCHAR(50) NOT NULL, -- 'MANUAL_UPI', 'BANK_TRANSFER', 'GATEWAY', 'DESK'
    payment_reference VARCHAR(255),
    payment_proof_url TEXT,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'FAILED'
    request_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'
    rejection_reason TEXT,
    reviewed_by_admin_id BIGINT,
    reviewed_at TIMESTAMP WITHOUT TIME ZONE,
    activated_subscription_id BIGINT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sub_req_status ON platform_subscription_requests(request_status);
CREATE INDEX idx_sub_req_org ON platform_subscription_requests(organization_uuid);
```

### 3.3 Additive Column for Subscription Packages: Plan Versioning
To prevent plan edits from altering existing subscriber contracts, `subscription_packages` receives:
```sql
ALTER TABLE subscription_packages 
ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS max_subscribers INT,
ADD COLUMN IF NOT EXISTS plan_code VARCHAR(100);
```

### 3.4 Seed Super Admin Provisioning Script (Zero Hardcoding)
Admins are provisioned by linking an **existing account**:
```sql
-- Step 1: Ensure PLATFORM_SUPER_ADMIN role exists in roles table
INSERT INTO roles (roleuuid, name, description, isactive, createdon)
VALUES (gen_random_uuid(), 'PLATFORM_SUPER_ADMIN', 'Platform Super Administrator with full system privileges', true, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- Step 2: Assign PLATFORM_SUPER_ADMIN to target existing user email
INSERT INTO user_roles (userroleuuid, userid, useruuid, roleid, roleuuid, isactive, createdon)
SELECT 
    gen_random_uuid(),
    u.userid,
    u.useruuid,
    r.roleid,
    r.roleuuid,
    true,
    CURRENT_TIMESTAMP
FROM users u, roles r
WHERE u.email = 'dinesh19sep@gmail.com' -- Configurable admin email
  AND r.name = 'PLATFORM_SUPER_ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.userid = u.userid AND ur.roleid = r.roleid
  );
```

---

## 4. Backend Service Architecture & API Design

### 4.1 Gateway Configuration (`GATEWAYSERVICE`)
Route all administrative platform traffic to `IDENTITYSERVICE` on port 5052:
```yaml
- id: admin_route
  uri: http://127.0.0.1:5052
  predicates:
    - Path=/api/admin/**
```

### 4.2 Endpoint Specifications in `IDENTITYSERVICE`
All endpoints require a valid JWT with `role: PLATFORM_SUPER_ADMIN`.

#### A. Platform Overview & Metrics
- `GET /api/admin/dashboard/stats`: Aggregates active users, total organizations by type, active/expiring subscriptions, verified vs pending revenue, and live tournament counts.
- `GET /api/admin/dashboard/recent-activity`: Recent audit log events and critical pending actions.

#### B. User Administration
- `GET /api/admin/users`: Paginated, filtered (`status`, `search`, `role`), sorted list of platform users.
- `GET /api/admin/users/{userUuid}`: User profile, organizations owned, active subscriptions, and audit history.
- `PUT /api/admin/users/{userUuid}/status`: Suspend or reactivate user account (with audit entry).

#### C. Organization & Workspace Administration
- `GET /api/admin/organizations`: Paginated list of organizations with workspace type, owner, status, and active plan.
- `GET /api/admin/organizations/{orgUuid}`: Comprehensive detail including members, active tournament list, and historical subscriptions.
- `PUT /api/admin/organizations/{orgUuid}/status`: Update organization status (`ACTIVE`, `SUSPENDED`, `VERIFIED`).

#### D. Subscription Packages Management
- `GET /api/admin/subscriptions/plans`: List all plans including active, archived, and subscriber counts.
- `POST /api/admin/subscriptions/plans`: Create new subscription package.
- `PUT /api/admin/subscriptions/plans/{packageUuid}`: Safely update plan. Increment version number; existing active subscriptions maintain their original entitlement snapshot.
- `DELETE /api/admin/subscriptions/plans/{packageUuid}`: Archive plan (prevents new signups, retains existing subscriptions).

#### E. Subscription Request Approvals & Activation
- `GET /api/admin/subscriptions/requests`: List pending, approved, and rejected subscription requests.
- `POST /api/admin/subscriptions/requests/{requestUuid}/approve`: 
  1. Validates request state is `PENDING`.
  2. Idempotently creates/extends `OrganizationSubscription`.
  3. Updates `OfflinePaymentRecord` to `VERIFIED` in `PAYMENTSERVICE`.
  4. Records audit log entry.
- `POST /api/admin/subscriptions/requests/{requestUuid}/reject`: Captures reason, updates request state to `REJECTED`, records audit log entry.

#### F. Payments & Finance Oversight
- `GET /api/admin/payments`: Real-time ledger of online and offline transactions across organizations.
- `POST /api/admin/payments/offline/{recordUuid}/verify`: Direct approval hook into `OfflinePaymentService`.
- `GET /api/admin/reports/financial`: Revenue grouped by month, plan type, and organization.

#### G. Audit Logging & System Settings
- `GET /api/admin/audit-logs`: Paginated search across administrative actions, date ranges, and admin emails.

---

## 5. Frontend Architecture & UI Design (`athlon-user`)

### 5.1 Route Tree
```
src/app/admin/
├── layout.tsx                # Super Admin desktop layout, sidebar, header, auth guard
├── page.tsx                  # Dashboard overview & real-time metric cards
├── users/
│   ├── page.tsx              # Paginated user management table
│   └── [userId]/page.tsx     # User deep-dive, organizations, and subscription history
├── organizations/
│   ├── page.tsx              # Organization management table (by type)
│   └── [orgId]/page.tsx      # Organization details, verification, and workspace audits
├── subscriptions/
│   ├── plans/page.tsx        # Subscription packages & entitlement builder
│   └── requests/page.tsx     # Pending subscription approvals & payment verification
├── payments/
│   └── page.tsx              # Platform payments ledger & manual verification
├── tournaments/
│   └── page.tsx              # Platform-wide tournament monitoring & oversight
├── reports/
│   └── page.tsx              # Exportable financial, user, and subscription reports
├── audit-logs/
│   └── page.tsx              # Immutable audit trail inspection
└── settings/
    └── page.tsx              # Platform operational settings
```

### 5.2 Dedicated Desktop Admin Layout
- **Style System**:
  - Dark Charcoal / Midnight Navy background (`#070B0E`, `#0D141C`) with ATHLON theme accent tints (`#54AC68` Algae, `#04D9FF` Rush).
  - High-density information architecture designed for administrative productivity.
  - Fully accessible table navigation, search bars with debounce, server-side pagination, and filter drawers.
  - Ant Design + Tailwind CSS integration adhering to existing `AthlonThemeProvider`.
- **Navigation Structure**:
  - **Header**: Global search, admin profile badge, quick workspace switch back to regular player portal, dark/light theme toggle.
  - **Sidebar**:
    - **Overview**: Dashboard
    - **Management**: Users, Organizations, Tournaments
    - **Subscriptions**: Packages / Plans, Approval Requests
    - **Finance**: Payments Ledger, Financial Reports
    - **Governance**: Audit Logs, Platform Settings

### 5.3 Route Protection & Guard
- `AdminAuthGuard`:
  - Decodes token or inspects role in `useAuthStore`.
  - If token is absent or role is not `PLATFORM_SUPER_ADMIN`, redirects to `/login?redirect=/admin`.
  - Does **not** interfere with ordinary users navigating to `/`, `/tournaments`, `/academies`, or `/org/*`.

---

## 6. Concurrency, Security, & Backward Compatibility Safeguards

| Concern | Safeguard Implementation |
| :--- | :--- |
| **Double Approval of Requests** | Database row locking (`SELECT ... FOR UPDATE`) or optimistic lock on `version` ensures concurrent admin clicks cannot activate duplicate subscriptions. |
| **Silent Plan Entitlement Overwrite** | Subscription activation stores an immutable `package_snapshot` in `platform_subscription_requests` and assigns entitlements directly. Future plan edits increment `version` and do not alter running subscriptions. |
| **Tenant Data Isolation** | Standard workspace users are denied access to `/api/admin/**` at both Gateway and Spring Security filter level. Regular org controllers remain scoped by `orgId`. |
| **Session Invalidation on User Suspension** | Suspending a user updates their `status` to `SUSPENDED` in `users`. A token check filter rejects further requests with HTTP 403 Forbidden. |
| **Zero Workspace Interference** | Super Admin navigation does not invoke `useWorkspaceStore.setActiveWorkspace(...)`. Normal workspace selection continues to work uninterrupted. |

---

## 7. Phased Implementation Plan

### Phase 1: Security Foundation & Admin Authorization
1. Update `application.yml` in `GATEWAYSERVICE` with route predicate for `/api/admin/**`.
2. Seed `PLATFORM_SUPER_ADMIN` in `roles` and link to admin user in `user_roles`.
3. In `AUTHSERVICE`, update `JwtUtil` and `AuthService` to resolve `PLATFORM_SUPER_ADMIN` and include it in token claims and `LoginResponse`.
4. In `IDENTITYSERVICE`, implement `AdminSecurityFilter` / `@PreAuthorize` enforcing `PLATFORM_SUPER_ADMIN` on `/api/admin/**`.
5. In `athlon-user`, implement `AdminAuthGuard` and base `src/app/admin/layout.tsx`.

### Phase 2: Platform Dashboard & Real-Time Metrics
1. Implement `AdminDashboardController` and `AdminDashboardService` in `IDENTITYSERVICE`.
2. Expose `GET /api/admin/dashboard/stats` aggregating users, organizations, subscriptions, tournaments, and payment volumes.
3. In `athlon-user`, build `src/app/admin/page.tsx` with metric cards, revenue charts, and quick-action summaries.

### Phase 3: Centralized User & Organization Management
1. In `IDENTITYSERVICE`, implement `AdminUserController` and `AdminOrganizationController`.
2. Implement user suspension/reactivation and organization verification endpoints with audit logging.
3. In `athlon-user`, build `/admin/users`, `/admin/users/[userId]`, `/admin/organizations`, and `/admin/organizations/[orgId]`.

### Phase 4: Subscription Package Management (Plans & Versioning)
1. Add versioning columns to `subscription_packages`.
2. Extend `SubscriptionPackageRepository` with admin filters (including archived plans).
3. Implement `AdminSubscriptionPlanController` supporting plan creation, editing with version increments, and archiving.
4. In `athlon-user`, build `/admin/subscriptions/plans` with feature entitlement checkboxes and limit controls.

### Phase 5: Subscription Requests & Manual Payment Approvals
1. Apply migration for `platform_subscription_requests`.
2. Implement `AdminSubscriptionRequestController` in `IDENTITYSERVICE`.
3. Implement `approveRequest` with transaction boundary:
   - Validates request state.
   - Idempotently creates `OrganizationSubscription`.
   - Calls `OfflinePaymentService` in `PAYMENTSERVICE` to mark payment as verified.
   - Logs audit trail.
4. In `athlon-user`, build `/admin/subscriptions/requests` with filter tabs (`Pending`, `Approved`, `Rejected`), payment proof viewer, and confirmation modals.

### Phase 6: Financial Oversight & Tournament Oversight
1. Implement `AdminPaymentController` aggregating online and offline payment records.
2. Implement `AdminTournamentController` providing platform-wide read-only tournament oversight.
3. In `athlon-user`, build `/admin/payments` and `/admin/tournaments`.

### Phase 7: Audit Logging & Exportable Reports
1. Apply migration for `platform_admin_audit_logs`.
2. Integrate `AdminAuditLogService` across all administrative write actions.
3. Implement `GET /api/admin/reports` with CSV export for revenue, user registrations, and subscription adoption.
4. In `athlon-user`, build `/admin/audit-logs` and `/admin/reports`.

### Phase 8: Hardening, Regression Testing, & Production Verification
1. Execute unit and integration tests across modified services (`AUTHSERVICE`, `IDENTITYSERVICE`, `GATEWAYSERVICE`).
2. Verify existing player, tournament organizer, academy, and venue workflows.
3. Verify Next.js production build (`npm run build:clean`).
4. Validate that normal users cannot access `/admin` or `/api/admin/**`.

---

## 8. File-Level Change Matrix

| Area | Component / File | Nature of Change | Description |
| :--- | :--- | :--- | :--- |
| **Gateway** | `ATHLON/GATEWAYSERVICE/src/main/resources/application.yml` | Modified | Add route `/api/admin/**` -> `http://127.0.0.1:5052` |
| **Auth** | `ATHLON/AUTHSERVICE/.../util/JwtUtil.java` | Modified | Support platform roles claim in JWT generation |
| **Auth** | `ATHLON/AUTHSERVICE/.../auth/service/AuthService.java` | Modified | Fetch user platform role from DB during login |
| **Auth** | `ATHLON/AUTHSERVICE/.../dto/response/LoginResponse.java` | Modified | Add backward-compatible `role` and `platformRoles` fields |
| **Identity** | `ATHLON/IDENTITYSERVICE/.../admin/controller/*` | New | Controllers for dashboard, users, orgs, plans, requests, audit logs |
| **Identity** | `ATHLON/IDENTITYSERVICE/.../admin/service/*` | New | Services implementing platform administration logic |
| **Identity** | `ATHLON/IDENTITYSERVICE/.../admin/entity/*` | New | JPA Entities: `PlatformAdminAuditLog`, `PlatformSubscriptionRequest` |
| **Identity** | `ATHLON/IDENTITYSERVICE/.../admin/repository/*` | New | Repositories for audit logs and subscription requests |
| **Frontend** | `athlon-user/src/app/admin/layout.tsx` | New | Super Admin desktop shell & navigation |
| **Frontend** | `athlon-user/src/app/admin/page.tsx` | New | Super Admin dashboard with metrics and charts |
| **Frontend** | `athlon-user/src/app/admin/users/**` | New | User listing and detail views |
| **Frontend** | `athlon-user/src/app/admin/organizations/**` | New | Organization listing, detail, and approval views |
| **Frontend** | `athlon-user/src/app/admin/subscriptions/**` | New | Plan management and subscription approval views |
| **Frontend** | `athlon-user/src/app/admin/payments/**` | New | Payments ledger and offline verification |
| **Frontend** | `athlon-user/src/app/admin/tournaments/**` | New | Tournament platform-wide oversight |
| **Frontend** | `athlon-user/src/app/admin/reports/**` | New | Platform analytics and CSV export |
| **Frontend** | `athlon-user/src/app/admin/audit-logs/**` | New | Audit trail review table |
| **Frontend** | `athlon-user/src/lib/api/admin.ts` | New | Dedicated API client methods for `/api/admin/**` |
| **Frontend** | `athlon-user/src/components/admin/**` | New | Reusable Admin UI components (MetricCard, DataTable, etc.) |
