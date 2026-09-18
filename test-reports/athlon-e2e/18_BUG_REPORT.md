# ATHLON — BUG DEFECT REPORT
**Report ID:** ATH-E2E-BUG-018  
**Audit Date:** 2026-09-18  
**Status:** ALL CRITICAL & HIGH DEFECTS REMEDIATED AND VERIFIED  

---

## 1. Defect Classification Summary

| Severity | Total Discovered | Resolved & Verified | Open | Summary |
| :--- | :--- | :--- | :--- | :--- |
| **CRITICAL** | 1 | 1 | 0 | Concurrency double-booking defect in venue reservation resolved via pessimistic write locking |
| **HIGH** | 1 | 1 | 0 | Unauthenticated organization creation resolved via strict header and identity context enforcement |
| **MEDIUM** | 0 | 0 | 0 | (All schema & category request mappings resolved) |
| **LOW** | 0 | 0 | 0 | Minor visual formatting |

---

## 2. Comprehensive Bug Breakdown & Remediation

### BUG ID: ATH-BUG-004
- **TITLE:** Double Booking Permitted on Identical Facility Slot Under Concurrent Requests
- **SEVERITY:** **CRITICAL**
- **STATUS:** **RESOLVED & VERIFIED**
- **MODULE:** Venue Management / Facility Bookings
- **ENVIRONMENT:** Local QA (Microservices + PostgreSQL)
- **PRECONDITION:** Active Venue Arena with at least one active facility court (e.g. `Badminton Court 1`).
- **STEPS TO REPRODUCE:**
  1. Open two concurrent asynchronous HTTP sessions (User A and User B).
  2. Both users simultaneously send `POST /api/identity/bookings` for `facilityUuid = 46edc9e4-...`, `bookingDate = 2026-09-25`, `startTime = 18:00:00`, `endTime = 19:00:00`.
  3. Observe response from both requests.
- **EXPECTED BEHAVIOR:**
  One request must succeed with `HTTP 200/201 (CONFIRMED)`, and the concurrent conflicting request MUST be rejected with `HTTP 409 Conflict` ("The selected time slot is already booked.").
- **ACTUAL BEHAVIOR (Prior to fix):**
  Both concurrent requests succeeded with `HTTP 200 OK` and returned `status: "CONFIRMED"`.
- **REMEDIATION IMPLEMENTED:**
  1. Added pessimistic write locking `findByIdForUpdate` (`@Lock(LockModeType.PESSIMISTIC_WRITE)`) in `VenueFacilityRepository`.
  2. `FacilityBookingService.createBooking` and `holdSlot` lock the parent facility record to serialize overlapping slot queries and insertions.
  3. `GlobalExceptionHandler` maps `IllegalStateException` to `HTTP 409 Conflict`.
- **VERIFICATION:**
  Automated concurrency test in `e2e_master_suite.mjs` executed:
  `[PASS] [BOOKING_CONCURRENCY] Double booking prevention successfully rejected conflicting simultaneous slot request`

---

### BUG ID: ATH-BUG-005
- **TITLE:** Organization Creation Endpoint Missing Strict Token Enforcement
- **SEVERITY:** **HIGH**
- **STATUS:** **RESOLVED & VERIFIED**
- **MODULE:** Identity / Organizations
- **ENVIRONMENT:** Local QA
- **PRECONDITION:** Gateway running on `:5050`.
- **STEPS TO REPRODUCE:**
  1. Send `POST /api/identity/organizations/createOrganization` without any `Authorization: Bearer <token>` header or `X-User-Id` / `X-User-Uuid`.
  2. Include valid JSON body: `{"name": "Anonymous Org", "type": "ORGANIZER"}`.
- **EXPECTED BEHAVIOR:**
  HTTP 400 Bad Request or HTTP 401 Unauthorized.
- **ACTUAL BEHAVIOR (Prior to fix):**
  Request created organization and defaulted fallback user ID `1L`.
- **REMEDIATION IMPLEMENTED:**
  Updated `OrganizationController.parseUserId` and `parseUserUuid` to require non-null, valid headers, throwing `BadRequestException("Authentication context missing: X-User-Id header is required")` upon missing credentials.
- **VERIFICATION:**
  Automated security test in `e2e_master_suite.mjs` executed:
  `[PASS] [SECURITY_AUTH] Reject unauthenticated organization creation - Status 400`
