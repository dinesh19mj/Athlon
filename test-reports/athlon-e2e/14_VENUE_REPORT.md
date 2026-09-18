# ATHLON — VENUE & FACILITY BOOKING REPORT
**Venue Tag:** `E2E_VENUE_MAIN`  
**Venue Name:** `E2E Sports Arena`  
**Venue UUID:** `e6f9628d-7d52-4581-9824-2ba2ecde20a6`  
**Facility Name:** `Badminton Court 1 (Synthetic Wood)`  
**Facility UUID:** `46edc9e4-3ca2-44cf-ad92-c5ff1c22cbcb`  
**Owner:** `e2e_venue@athlon.test`  
**Status:** **CRITICAL DEFECT DETECTED** | **Result:** **FAIL (ATH-BUG-004)**

---

## 1. Facility Setup & Normal Booking Flow

- **Venue Creation:** `POST /api/identity/venues` &rarr; Successfully created venue in Bangalore with operating hours and amenities (**PASS**).
- **Facility Court Creation:** `POST /api/identity/facilities` &rarr; Successfully added BWF standard synthetic wooden court with 60-minute slots (**PASS**).
- **Single User Reservation:** Player 01 booked slot `2026-09-25 18:00:00 - 19:00:00` for ₹600.00 &rarr; Status `CONFIRMED` (**PASS**).

---

## 2. High-Concurrency Double Booking Audit (CRITICAL FINDING)

### Scenario:
Two independent users (`e2e_player01@athlon.test` and `e2e_player02@athlon.test`) concurrently submitted reservation requests for the exact same court facility, date, and time slot (`2026-09-25 18:00:00 - 19:00:00`).

### Observed Result:
- **Player 01 Request:** HTTP 200 OK &rarr; Booking Status: `CONFIRMED`
- **Player 02 Request:** HTTP 200 OK &rarr; Booking Status: `CONFIRMED`

```
Thread 1 (Player 1) ──► POST /bookings (Court 1, 18:00-19:00) ──► Check: Free? Yes ──► INSERT booking (CONFIRMED) ──► HTTP 200
Thread 2 (Player 2) ──► POST /bookings (Court 1, 18:00-19:00) ──► Check: Free? Yes ──► INSERT booking (CONFIRMED) ──► HTTP 200
```

### Risk & Business Impact:
Two customers will arrive at the venue having paid for the exact same court at the same hour, causing immediate disputes, operational confusion, and reputational damage.

### Remediation Plan:
1. Add a composite database unique index on `(facility_id, booking_date, start_time, status)` where `status IN ('CONFIRMED', 'HELD')`.
2. Wrap `FacilityBookingService.createBooking` in a transactional method utilizing pessimistic write locking (`@Lock(LockModeType.PESSIMISTIC_WRITE)`) on the facility slot record.
