# 05. ATHLON ↔ MARKET TOP-LEVEL MODE SWITCHER SPECIFICATION

> **Module**: Application Mode Shell  
> **Status**: IMPLEMENTED & TESTED (Phase 1)  
> **Component**: `AppModeSwitcher.tsx`  
> **Store**: `useAppModeStore.ts`  

---

## 1. Architectural Mandate

`ATHLON` and `MARKET` are **two top-level application modes**. They are never to be conflated with the ATHLON workspace/organization selector (`PERSONAL`, `ORGANIZER`, `ACADEMY`, `CLUB`, `COACH`, `COURT`, `COMMUNITY`).

```
                    ATHLON APPLICATION
                           │
                   APPLICATION MODE
                           │
              ┌────────────┴────────────┐
              │                         │
          ATHLON MODE               MARKET MODE
         (Play & Compete)          (Buy & Sell)
              │                         │
        Workspaces:                Market Hubs:
        - Me (Player)              - Market Home
        - Organizer                - Categories
        - Academy                  - Search & Products
        - Club                     - Sports Shops
        - Coach                    - Sell Gateway
        - Venue                    - Wishlist
        - Community                - Offers & Orders
                                   - My Market & Manage Shop
```

---

## 2. State Isolation Guarantees

1. **Workspace Persistence Invariant**:
   - `useWorkspaceStore.activeWorkspaceId` is never modified by mode switching.
   - When a user in `Community X` navigates to `MARKET`, browses products, and taps `ATHLON`, they are routed back to `Community X` without state regression.
2. **URL Authoritative Routing**:
   - `/market/*` -> MARKET Mode active.
   - All other routes (`/`, `/home`, `/org/*`, `/tournaments`, `/venues`, etc.) -> ATHLON Mode active.
3. **Convenience Memory**:
   - `useAppModeStore.lastAthlonPath` stores the last valid Athlon route visited.

---

## 3. UI Component Details (`AppModeSwitcher`)

- **Design**: Pill-shaped segmented dock with two options:
  - `[ 🏆 ATHLON | Play • Compete ]`
  - `[ 🛍 MARKET | Buy • Sell ]`
- **Active State**:
  - Highlights with `--athlon-primary` border and subtle neon glow.
  - Raised background with glass highlight.
  - Active sport/shopping icon in primary color.
  - Primary text label and subtitle.
- **Inactive State**:
  - Subtle semi-transparent surface.
  - 65% opacity text and icon, transitioning smoothly on hover.
- **Notification Bell**:
  - Aligned on the right edge with real-time alert dot indicator.

---

## 4. Verification Matrix

| Transition | Initial Context | Target Context | Workspace Preserved | Result |
| :--- | :--- | :--- | :---: | :---: |
| Guest Switching | `/` (Athlon Public) | `/market` | N/A | **PASS** |
| Guest Returning | `/market` | `/` (Athlon Public) | N/A | **PASS** |
| Player Switching | `/home` | `/market` | `PERSONAL` | **PASS** |
| Player Returning | `/market` | `/home` | `PERSONAL` | **PASS** |
| Community Switching | `/org/comm-1/feed` | `/market` | `comm-1` | **PASS** |
| Community Returning | `/market` | `/org/comm-1/feed` | `comm-1` | **PASS** |
| Organizer Switching | `/org/org-1/organizer` | `/market` | `org-1` | **PASS** |
| Organizer Returning | `/market` | `/org/org-1/organizer` | `org-1` | **PASS** |
