# 01. MARKETPLACE ARCHITECTURE DISCOVERY & FOUNDATION PLAN

> **Document Status**: COMPLETED (Phase 0)  
> **Target System**: ATHLON Sports Platform  
> **Scope**: ATHLON ↔ MARKET Top-Level Mode Switcher & Marketplace Module  
> **Author**: Senior Principal Architect & Engineering Team  
> **Date**: September 2026  

---

## 1. Executive Summary & Core Architectural Principle

ATHLON is an enterprise sports platform providing tournaments, live scoring, court/venue bookings, academies, clubs, and athletic community networking.

### The Non-Negotiable Core Principle: Mode Separation vs. Workspace Context
**MARKET IS NOT AN ATHLON WORKSPACE.** It is **NEVER** to be placed inside the workspace or organization selector (alongside *Me/Player*, *Organizer*, *Academy*, *Club*, *Coach*, *Venue*, *Community*).

Instead, **ATHLON** and **MARKET** are **TWO TOP-LEVEL APPLICATION MODES**:

```
                        ATHLON APPLICATION
                                │
                        APPLICATION MODE
                                │
                ┌───────────────┴───────────────┐
                │                               │
           ATHLON MODE                     MARKET MODE
          (Play & Compete)                (Buy & Sell)
                │                               │
        Workspace System                Marketplace System
    ┌───────────┴───────────┐           ┌───────┴───────┐
    │ Personal (Player)     │           │ Market Home   │
    │ Organizer             │           │ Categories    │
    │ Academy               │           │ Products      │
    │ Club                  │           │ Sports Shops  │
    │ Coach                 │           │ Sell          │
    │ Venue                 │           │ Wishlist      │
    │ Community             │           │ Offers        │
    └───────────────────────┘           │ Orders        │
                                        │ My Market     │
                                        │   ├─ Buying   │
                                        │   ├─ Selling  │
                                        │   └─ My Shops │
                                        │       └─ Manage Shop
                                        └───────────────┘
```

### Critical Invariant: Mode Switching Must Never Mutate Active Workspace
When a user with active workspace `Weekend Shuttlers Community` switches from `ATHLON` to `MARKET` to browse sports gear, their active workspace in `useWorkspaceStore` remains **100% untouched**. When switching back from `MARKET` to `ATHLON`, they return directly to `Weekend Shuttlers Community`, **never** getting reset to Personal Space or the first organization.

---

## 2. Existing ATHLON Architecture Inspection

### 2.1 Frontend Architecture (`athlon-user`)
- **Framework**: Next.js 16.2.10 (App Router, Standalone build) with React 19.2.4 and TypeScript 5.
- **Styling**: Tailwind CSS v4, dynamic CSS variable design system (`--athlon-primary`, `--athlon-card`, `--athlon-border`, `--athlon-surface`, `--athlon-navigation`, etc.) driven by `athlon-theme-provider.tsx` and `theme-controller.ts`.
- **Component Libraries**: Lucide React, Ant Design (`antd` v6.5, `@ant-design/cssinjs`), custom 3D design tokens (`Athlon3DIcon`, `Athlon3DFAB`, `SportCardSkeletonBackground`).
- **State Management**:
  - `useAuthStore` (Zustand + `persist` to `localStorage` key `'auth-storage'`): manages `isAuthenticated`, `token`, `userId`, `userUuid`, `userEmail`, `subscriptions`.
  - `useWorkspaceStore` (Zustand + `persist` to `localStorage` key `'workspace-storage'`): manages `activeWorkspaceId` (`'PERSONAL'` or organization UUID), `organizations`, `personalProfile`.
  - `useMatchStore`, `usePracticeMatchStore`: local live scoring state.
- **API Client**: `client.ts` (`fetchClient`) provides authenticated requests attaching `Authorization: Bearer <token>`, `X-User-Id`, and `X-User-Uuid`.
- **PWA Setup**: `@ducanh2912/next-pwa` configured in `next.config.ts`, `public/manifest.json`, `public/sw.js`. Dedicated responsive mobile layouts (`block md:hidden`) vs desktop layouts (`hidden md:block`).

### 2.2 Existing Screens & Navigation
1. **Logged-out Home**:
   - Route: `/` (`src/app/page.tsx` -> `MarketingPageClient.tsx`).
   - Displays Hero arena, live scores, public tournaments, team championships, academies, venues, coaches, community sessions.
   - Has separate mobile view (`block md:hidden`) and desktop view (`hidden md:block`).
2. **Logged-in Home**:
   - Route: `/home` (`src/app/(personal)/home/page.tsx`).
   - Displays `HomeRoleHeader` (dock containing Me / Player pill + Organization pills + Add Organization button), video banner, profile stats hero, quick actions, matches, registrations, community sessions.
3. **Workspace Switcher**:
   - `src/components/home/HomeRoleHeader.tsx`: horizontal segmented dock for Me (`PLAYER`) and Organizations (`ORGANIZER`, `ACADEMY`, `CLUB`, `COACH`, `COURT`, `COMMUNITY`).
   - Routes to `/org/[orgId]/dashboard` or `/home`.
4. **PWA Bottom Navigation**:
   - `src/app/(personal)/layout.tsx`:
     - Mobile bottom bar (5 items):
       - `Home` (`/home` or `/`)
       - `Events` (`/home/tournaments` or `/tournaments`)
       - Center 3D Umpire Action Button (`/practice`)
       - `Live` (`/live-score`)
       - `Profile` (`/profile` or `/login`)

### 2.3 Backend Services & Microservices (`ATHLON`)
- **Gateway Service** (`GATEWAYSERVICE`, port 5050):
  - Spring Cloud Gateway MVC (`RouteConfig.java`) routing:
    - `/api/auth/*` -> `AUTHSERVICE` (port 5051)
    - `/api/identity/*` -> `IDENTITYSERVICE` (port 5052)
    - `/api/tournament/*` -> `TOURNAMENTSERVICE` (port 5053)
    - `/api/payments/*` -> `PAYMENTSERVICE` (port 5054)
  - `next.config.ts` rewrites `/api/:path*` to `http://localhost:5050/api/:path*`.
- **Identity Service** (`IDENTITYSERVICE`):
  - Manages users, sports profiles, organizations, communities, facilities, coaches, subscription packages (`subscription_packages`), organization subscriptions (`organization_subscriptions`), and media file uploads (`/api/identity/uploads/...`).
- **Tournament Service** (`TOURNAMENTSERVICE`):
  - Manages tournaments, categories, registrations (`tournament_registrations`), participant players (`registration_players`), matches (`matches`), fixtures, draws, and live scores.
- **Payment Service** (`PAYMENTSERVICE`):
  - Centralized Razorpay orders (`PaymentOrder`), transactions (`PaymentTransaction`), transfers (`PaymentTransfer`), refunds (`PaymentRefund`), webhooks (`PaymentWebhookEvent`), organization accounts (`OrganizationPaymentAccount`), and offline payments (`OfflinePaymentRecord`).
  - Business handlers registry for `PaymentPurpose` (`ATHLON_SUBSCRIPTION`, `TOURNAMENT_REGISTRATION`, `VENUE_BOOKING`, etc.).
- **Admin App** (`athlon-admin`):
  - Next.js administrative dashboard managing users, organizations, subscriptions, payments, notifications, templates, and analytics.

---

## 3. Authoritative Solutions to Master Prompt Requirements

### 3.1 Where the ATHLON / MARKET Selector Will Be Mounted
Following the sample design reference:
- A new reusable component `AppModeSwitcher.tsx` will be created.
- In **ATHLON mode**:
  - Mounted at the top header of `MarketingPageClient.tsx` (Mobile & Desktop) and `(personal)/home/page.tsx` (Mobile & Desktop).
  - Shows:
    - `[ 🏆 ATHLON | Play • Compete ]` (highlighted with `--athlon-primary` border, subtle glow, solid/elevated surface).
    - `[ 🛍 MARKET | Buy • Sell ]` (muted text and border, clickable to switch to `/market`).
    - Notification Bell on the right.
- In **MARKET mode**:
  - Mounted at the top header of all top-level Market entry screens (`/market`, `/market/categories`, `/market/wishlist`, `/market/my`).
  - Shows:
    - `[ 🏆 ATHLON | Play • Compete ]` (muted, clickable to switch back to ATHLON).
    - `[ 🛍 MARKET | Buy • Sell ]` (highlighted with `--athlon-primary` border and glow).
    - Notification Bell on the right.
- **Never mounted on**: live scoring consoles, deep tournament match setup forms, checkout modals, payment dialogs.

### 3.2 URL Is Authoritative & Mode State Isolation
- Routes starting with `/market` belong to `MARKET MODE`.
- All other routes belong to `ATHLON MODE`.
- A dedicated lightweight store `useAppModeStore.ts` tracks current mode based on pathname and remembers the last active ATHLON route (e.g. `/home` or `/org/[orgId]/dashboard`).
- When returning from Market to Athlon:
  - If user came from `/org/xyz/dashboard`, return them to `/org/xyz/dashboard`.
  - The `useWorkspaceStore` state (`activeWorkspaceId`) is completely isolated and never changed by market visits.

### 3.3 Guest Market vs. Authenticated Market
- **Guest Capabilities**:
  - Browse Market Home (`/market`), search sports gear (`/market/search`), browse categories (`/market/categories`), view product details (`/market/product/[productId]`), view public shop storefronts (`/market/shop/[shopId]`).
- **Protected Actions (Requires Auth)**:
  - Tapping `Sell`, `Wishlist`, `Make Offer`, `Enquire / Contact Seller`, `Create Sports Shop`.
  - Triggers existing `AuthModal` with return redirection:
    - Guest on `/market/product/ABC` taps `♡ Wishlist` -> opens AuthModal with `redirect = /market/product/ABC?action=wishlist`.
    - Upon login, user returns to `/market/product/ABC` and the item is saved to wishlist.

### 3.4 Authoritative 3-Tournament Participation Rule
- **Rule**: Individual users without a seller subscription must have participated in **at least 3 DISTINCT eligible tournaments** to sell via Commission Mode.
- **Authoritative Database Source**:
  ```sql
  SELECT COUNT(DISTINCT rp.tournamentid)
  FROM registration_players rp
  INNER JOIN tournament_registrations r ON rp.registrationid = r.registrationid
  WHERE (rp.playerid = :playerId OR rp.playeruuid = :playerUuid)
    AND r.status IN ('CONFIRMED', 'APPROVED', 'COMPLETED')
  ```
- **Crucial Guardrails**:
  - Multiple registrations or matches in the same tournament count as **1** tournament participation.
  - Matches outside tournaments (e.g. casual practice matches) do not count.
  - Cancelled or rejected registrations do not count.
  - Backend `MarketplaceSellerEligibilityService` computes this authoritatively on every listing creation and status check; frontend never authorizes selling independently.

### 3.5 The Three Selling Paths & Seller Modes
1. **Individual — Commission Mode**:
   - ATHLON user with >= 3 distinct tournament participations.
   - No seller subscription required.
   - Sells pre-owned personal gear (e.g. Used Rackets, Shoes, Kitbags).
   - Platform applies a configurable commission rate (stored in commission config, snapshotted upon order/sale).
2. **Individual — Subscription Mode**:
   - ATHLON user with active `MARKETPLACE_SELLER` subscription.
   - Bypasses 3-tournament requirement.
   - Increased listing limits and discounted commission rates.
3. **Sports Shop Mode**:
   - Registered sports retailer/business account with active `MARKETPLACE_SHOP` subscription.
   - Sells new, demo, refurbished, or used gear with inventory management, SKU, multiple quantities, and shop storefront.

### 3.6 Sports Shop Architecture: Management Inside Market
- **SPORTS SHOP IS NOT AN ATHLON WORKSPACE.**
- The shop does **NOT** appear in the `Me / Organizer / Academy / Club / Coach / Venue` dock.
- Frontend Navigation Hierarchy:
  ```
  Market (Bottom Nav) ──> My Market ──> My Sports Shops ──> [ABC SPORTS] ──> Manage Shop
  ```
- Manage Shop contains dedicated shop navigation tabs:
  - Dashboard (Revenue, Orders, Products, Low Stock)
  - Products & Inventory (Catalog, Add Product, Stock adjustment)
  - Orders & Enquiries
  - Shop Settings & Subscription

### 3.7 Centralized Payment & Subscription Integration
- **Subscriptions**:
  - Reuse `IDENTITYSERVICE` subscription packages with codes `MARKETPLACE_SELLER` and `MARKETPLACE_SHOP`.
  - Processed through `PAYMENTSERVICE` with `PaymentPurpose.MARKETPLACE_SELLER_SUBSCRIPTION` and `PaymentPurpose.MARKETPLACE_SHOP_SUBSCRIPTION`.
- **Product Purchases**:
  - V1 Scope: Offline/local settlement, reserve upon accepted offer, commission tracking, and preparation for future central payment checkout (`PaymentPurpose.MARKETPLACE_PRODUCT_PURCHASE`).

### 3.8 PWA Mobile Bottom Navigation Strategy
- When in **ATHLON mode**:
  - Layout renders existing Athlon bottom bar: `Home`, `Events`, `Center 3D Umpire Action`, `Live`, `Profile`.
- When in **MARKET mode**:
  - Layout renders dedicated Market bottom bar:
    1. `Market` (`/market`, Home/Storefront icon)
    2. `Categories` (`/market/categories`, 4-square Grid icon)
    3. `Sell` (`/market/sell`, Prominent center floating '+' circular action button)
    4. `Wishlist` (`/market/wishlist`, Heart icon)
    5. `My Market` (`/market/my`, Storefront/User bag icon)
- Returning to Athlon mode restores Athlon bottom navigation immediately.

---

## 4. Database Schema Design (Additive & Backward-Compatible)

All additions are new tables with standard PostgreSQL naming conventions (`lowercase_with_underscores`, explicit UUIDs, bigints, timestamps, foreign keys where applicable):

1. `marketplace_seller_profiles`: User selling status, tournament count cache, commission mode, subscription status.
2. `marketplace_shops`: Shop details (UUID, name, slug, owner_user_id, contact, location, verification_status, subscription_status).
3. `marketplace_shop_members`: Staff members with roles (`OWNER`, `MANAGER`, `STAFF`).
4. `marketplace_categories`: Multi-sport categories linked to ATHLON sports (Rackets, Shoes, Kitbags, Apparel, Balls, Bats, Accessories).
5. `marketplace_products`: Product master (UUID, seller_type `INDIVIDUAL|SHOP`, seller_user_id, shop_id, sport, category_id, name, brand, model, condition `NEW|LIKE_NEW|EXCELLENT|GOOD|FAIR`, product_type `NEW|USED|DEMO|REFURBISHED`, price, mrp, negotiable, status `DRAFT|PENDING_REVIEW|ACTIVE|RESERVED|SOLD|PAUSED`, location).
6. `marketplace_product_images`: Images per product (URL, order, is_primary).
7. `marketplace_product_attributes`: Extensible JSON / key-value specs (weight, grip_size, string_tension, shoe_size, willow_grade).
8. `marketplace_inventory`: SKU, stock quantity, reserved quantity for shop products.
9. `marketplace_favorites`: Wishlist entries (unique `user_id` + `product_id`).
10. `marketplace_inquiries`: Lightweight buyer-to-seller enquiries.
11. `marketplace_offers`: Price offers (`PENDING`, `ACCEPTED`, `COUNTERED`, `DECLINED`, `EXPIRED`).
12. `marketplace_orders`: V1 orders / reservations with snapshot of gross amount, commission rate, and seller net amount.
13. `marketplace_reports`: Product moderation reporting flags.

---

## 5. File Change Analysis

### 5.1 New Frontend Files to Add
- `src/lib/store/useAppModeStore.ts` (Application mode state and last visited route preservation)
- `src/components/navigation/AppModeSwitcher.tsx` (Shared mode pill switcher matching reference)
- `src/components/navigation/MarketBottomNav.tsx` (Dedicated Market mobile bottom bar)
- `src/app/market/layout.tsx` (Market shell with mode switcher, search, and MarketBottomNav)
- `src/app/market/page.tsx` (Market Home: Hero carousel, categories, pre-owned gear, sports shops, new arrivals)
- `src/app/market/categories/page.tsx` (Sport & equipment categories)
- `src/app/market/search/page.tsx` (Server-side paginated product search & multi-sport filters)
- `src/app/market/product/[productId]/page.tsx` (Product details, seller card, condition badge, offer modal)
- `src/app/market/shop/[shopId]/page.tsx` (Public sports shop storefront)
- `src/app/market/sell/page.tsx` (Seller eligibility gateway: 3-tournament check or subscription or shop selector)
- `src/app/market/sell/new/page.tsx` (Product listing creation form)
- `src/app/market/wishlist/page.tsx` (Saved user products)
- `src/app/market/my/page.tsx` (My Market dashboard: Buying, Selling, My Shops)
- `src/app/market/manage/[shopId]/page.tsx` (Shop management dashboard & inventory)
- `src/components/market/MarketProductCard.tsx` (Product card matching reference with condition badge, price, location, seller info, wishlist)
- `src/components/market/MarketHeroBanner.tsx` (Pre-owned gear & promotional banner)
- `src/lib/api/marketplace.ts` (API client for marketplace endpoints)

### 5.2 Minimal Existing Files to Modify (Additive Only)
- `src/components/marketing/MarketingPageClient.tsx`: Add `AppModeSwitcher` to the top header for mobile and desktop.
- `src/app/(personal)/home/page.tsx`: Add `AppModeSwitcher` above the role dock header for mobile and desktop.
- `src/app/(personal)/layout.tsx`: Ensure route awareness so that when user navigates to `/market`, the layout smoothly accommodates Market navigation.
- `src/lib/store/useAuthStore.ts`: Provide helper for returning to original market action post-login.

### 5.3 Regression Risks & Mitigation
1. **Risk**: Overwriting `activeWorkspaceId` when switching modes.
   - **Mitigation**: Mode switcher strictly changes route (`/market` vs `/home`), completely bypassing `useWorkspaceStore.setActiveWorkspace`.
2. **Risk**: Bottom navigation collision between Athlon and Market.
   - **Mitigation**: `/market` routes use dedicated `MarketBottomNav`; Athlon routes retain untouched `(personal)/layout.tsx` bottom bar.
3. **Risk**: Broken guest authentication redirects.
   - **Mitigation**: `AuthModal` and `/login` pass `redirect=/market/product/[id]` query parameter and return directly to the product.
4. **Risk**: Faking 3-tournament eligibility on frontend.
   - **Mitigation**: Backend queries `registration_players` and `tournament_registrations` with `COUNT(DISTINCT tournamentid)` before issuing eligibility tokens.

---

## 6. Execution Roadmap (Phase-by-Phase)

- **Phase 0**: Architecture Discovery (This document) -> **COMPLETED**.
- **Phase 1**: Application Mode Shell (`AppModeSwitcher`, `useAppModeStore`, route shell, regression tests).
- **Phase 2**: Marketplace Foundation (Categories, Products, Search, Filters, Product Cards, Product Details).
- **Phase 3**: Seller Eligibility Service (3-tournament verification rule & subscription bypass).
- **Phase 4**: Sell Flow (Individual listing creation, photo upload, preview, condition management).
- **Phase 5**: Consumer Functionality (Wishlist, Inquiries, Offers, Reservations).
- **Phase 6**: Seller Subscription Integration (Subscription packages & Payment service).
- **Phase 7**: Sports Shop Module (Shop creation, Public storefront, Shop Management, Inventory).
- **Phase 8**: Shop Advanced Operations (Orders, Offers, Shop Analytics).
- **Phase 9**: Marketplace Admin (Moderation, Pending listings, Reports).
- **Phase 10 & 11**: PWA Mobile & Desktop Polish.
- **Phase 12**: Complete Regression Verification & Test Matrix.
