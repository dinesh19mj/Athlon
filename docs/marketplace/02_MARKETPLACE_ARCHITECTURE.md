# 02. ATHLON MARKETPLACE HIGH-LEVEL ARCHITECTURE

> **Target System**: ATHLON Platform  
> **Status**: FULL SYSTEM ARCHITECTURE DOCUMENTATION  

---

## 1. Top-Level Mode Architecture

ATHLON operates under two distinct application modes governed by URL and state isolation:

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
       Workspaces System:          Market Subsystems:
       - Me / Athlete              - Market Home
       - Organizer                 - Multi-Sport Categories
       - Academy                   - Equipment Search & Filters
       - Club                      - Pre-Owned Community Gear
       - Coach                     - Sports Shops Storefronts
       - Venue                     - Sell Gateway & Moderation
       - Community                 - Wishlist & Offers
                                   - My Market Hub
                                   - Shop Management Console
```

---

## 2. Core Subsystems

### 2.1 Mode Shell & Routing
- Route prefix `/market` authoritatively flags MARKET mode.
- `useAppModeStore` handles user intent and navigation history without mutating `useWorkspaceStore`.

### 2.2 Marketplace Foundation
- Multi-sport catalog (Badminton, Cricket, Football, Tennis, Volleyball).
- Curated attributes (Racket weight, grip, tension, shoe sizes, willow grades).
- Dynamic hero promotions, pre-owned equipment rails, and certified pro shops.

### 2.3 Individual Selling & 3-Tournament Rule
- Authoritative evaluation of completed tournament entries in `TOURNAMENTSERVICE`.
- Automatic Commission Mode allocation (5% fee upon transaction).

### 2.4 Sports Shops Subsystem
- Full commercial retail storefronts with verified badge criteria.
- In-market operational dashboard (Today's Sales, Orders, Low Stock notifications, Inventory adjustment).
