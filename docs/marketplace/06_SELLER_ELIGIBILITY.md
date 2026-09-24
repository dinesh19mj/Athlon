# 06. SELLER ELIGIBILITY & 3-TOURNAMENT VERIFICATION ENGINE

> **Module**: Seller Verification Engine  
> **Status**: SPECIFIED & IMPLEMENTED  

---

## 1. Overview

ATHLON requires individual sellers to be genuine athletic participants within the community to sell sports gear in Commission Mode.

### The 3 Distinct Tournament Rule
- A user must have participated in **at least 3 distinct eligible ATHLON tournaments**.
- **Crucial Rule**:
  - Multiple registrations in the same tournament count as **1** tournament.
  - Multiple matches within the same tournament count as **1** tournament.
  - Casual or practice matches outside tournaments do **NOT** count.
  - Cancelled or rejected registrations do **NOT** count.

---

## 2. Authoritative Database Verification Query

The verification query operates directly against authoritative tables in `TOURNAMENTSERVICE`:

```sql
SELECT COUNT(DISTINCT rp.tournamentid) AS distinct_tournaments
FROM registration_players rp
INNER JOIN tournament_registrations r ON rp.registrationid = r.registrationid
WHERE (rp.playerid = :playerId OR rp.playeruuid = :playerUuid)
  AND r.status IN ('CONFIRMED', 'APPROVED', 'COMPLETED')
```

---

## 3. The Three Seller Modes

1. **`COMMISSION` Mode**:
   - Eligible tournament count >= 3.
   - Upfront subscription required: **NO**.
   - Platform Commission: **5%** (deducted upon verified order).
   - Listing Quota: **5 active listings**.

2. **`SUBSCRIPTION` Mode**:
   - Active `MARKETPLACE_SELLER` plan.
   - Upfront tournament count requirement: **Bypassed**.
   - Platform Commission: **2.5% - 3.5%**.
   - Listing Quota: **25 active listings**.

3. **`SHOP` Mode**:
   - Active `MARKETPLACE_SHOP` commercial plan.
   - Upfront tournament count requirement: **Bypassed**.
   - Unlimited product inventory, SKU tracking, multi-variant support.

---

## 4. Test Verification Scenarios

| Scenario | Tournaments | Subscription | Can Sell? | Assigned Mode | Result |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Brand New User | 0 | None | NO | None | **PASS** |
| Active Player | 2 | None | NO (Progress: 2/3) | None | **PASS** |
| 3 Registrations in 1 Tournament | 1 distinct | None | NO (Progress: 1/3) | None | **PASS** |
| Tournament Veteran | 3 distinct | None | YES | `COMMISSION` | **PASS** |
| Subscribed Individual | 0 | `MARKETPLACE_SELLER` | YES | `SUBSCRIPTION` | **PASS** |
| Commercial Shop Owner | N/A | `MARKETPLACE_SHOP` | YES | `SHOP` | **PASS** |
