# ATHLON — TECHNICAL & PRODUCT IMPROVEMENTS REPORT
**Report ID:** ATH-E2E-IMP-019  
**Audit Date:** 2026-09-18  

---

## 1. Improvement Prioritization Matrix

| Area | Recommended Improvement | User / System Impact | Implementation Complexity | Suggested Priority |
| :--- | :--- | :--- | :--- | :--- |
| **Concurrency / DB** | Slot reservation pessimistic locking & unique index | Prevents double bookings and financial disputes | MEDIUM | **P0** |
| **Security / Auth** | Enforce non-null `X-User-Id` in Identity controllers | Eliminates fallback spoofing to user ID 1 | SMALL | **P0** |
| **Tournament Engine** | WebSocket reconnection toast for live scoring | Improves umpire resilience during temporary WiFi disconnects | MEDIUM | **P1** |
| **Tournament Engine** | League pool automatic tie-breaking rule selector | Clear head-to-head vs set difference rules | MEDIUM | **P1** |
| **Venue Booking** | Redis / in-memory 5-minute temporary slot hold | Holds slot while customer completes UPI checkout | MEDIUM | **P1** |
| **Academy Workspace** | Batch QR code attendance check-in for students | Speeds up daily coaching class roll-calls | MEDIUM | **P2** |
| **Club Workspace** | Automated membership renewal reminder emails/SMS | Increases recurring membership retention | SMALL | **P2** |
| **Mobile UX** | Haptic vibration feedback on live scoring points | Tactile feedback for tablet/phone umpires | SMALL | **P3** |
