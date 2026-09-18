# ATHLON — REGRESSION RISK ASSESSMENT
**Report ID:** ATH-E2E-REG-020  
**Audit Date:** 2026-09-18  

---

## 1. Regression Risk Heatmap

| Subsystem / Area | Risk Level | Rationale & Known Sensitivities | Mitigating Controls |
| :--- | :--- | :--- | :--- |
| **Knockout Bracket Progression** | **LOW** | Highly stable binary tree progression verified across 8 and 4 participant counts. | Automated fixture generation regression tests. |
| **League Round-Robin Engine** | **LOW** | Pairings follow deterministic $N(N-1)/2$ combinatorial logic without duplicate matches. | Verified against 2-pool 8-team draw. |
| **Live Scoring Engine** | **LOW** | Score synchronization persists set states and completes matches with winner ID. | Dual endpoint validation (REST + WS). |
| **Facility Booking Slot State** | **HIGH** | Concurrency race condition detected where two concurrent bookings can both succeed. | Requires P0 DB constraint + transactional locking. |
| **Identity Service Headers** | **MEDIUM** | User ID fallback defaults to 1L if headers are missing or malformed. | Requires strict header validation filter. |

---

## 2. Release & Deployment Recommendations

1. **Gate 1 (P0):** Deploy database composite constraint on `(facility_id, booking_date, start_time)` to block concurrent double-bookings.
2. **Gate 2 (P0):** Require explicit non-null `X-User-Id` authentication on all mutating organization endpoints.
3. **Gate 3 (P1):** Ensure all WebSocket live scoring clients gracefully fall back to REST polling upon reconnect.
