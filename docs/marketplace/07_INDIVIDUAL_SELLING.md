# 07. INDIVIDUAL SELLING SPECIFICATION

> **Target**: ATHLON Individual Users  
> **Status**: IMPLEMENTED  

---

## 1. Flow Overview
1. User taps **Sell** (`/market/sell`).
2. System calls `MarketplaceApi.getSellerEligibility()`.
3. If user has participated in >= 3 distinct tournaments:
   - Status: **Eligible** in `COMMISSION` mode.
   - Shows verified tournament history breakdown.
   - User taps **Create Listing** -> `/market/sell/new`.
4. User fills out:
   - Sport & Category
   - Equipment details (Brand, Model, Condition, Description, Reason for selling)
   - Pricing (Price, Original Price, Negotiable toggle)
   - Photos upload
   - Location (City, Pickup/Shipping options)
5. User submits listing:
   - Item becomes active and listed in **Pre-Owned Gear** and Search.
