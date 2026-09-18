# Local Functional QA Report — 18 September 2026

## Scope and test account

- Target: `http://localhost:3000` (running local application)
- Test account: `qa.venue.20260918@example.com` — created during this pass. The password is deliberately omitted.
- Tests covered: registration, login, authenticated dashboard, venue catalogue/detail/slot selection, booking catalogue, tournament catalogue/search, live score results, profile, academy catalogue, registered-event empty state, and match-history empty state.
- Automated checks: `npm run lint` completed successfully (ESLint exit code 0).

## Result summary

| Area | Result | Notes |
|---|---|---|
| Register and login | Pass | Account creation and subsequent login reached the authenticated dashboard. |
| Dashboard discovery | Pass with authorization concern | Real tournament, venue, academy, coach, and score data loaded. A brand-new player also sees an **Organizer / Matrix** workspace selector. |
| Tournament catalogue and search | Pass | Live totals loaded (13 events) and searching `Open League` reduced the result set to one matching championship. |
| Live scores and completed results | Pass | 0 live matches and 16 finished matches loaded; completed-scorecard list opened. |
| Registered events / My Matches empty state | Pass | Correctly shows no registrations and no matches for the new player. |
| Venue detail and availability | Fail (high) | Live slot listing loads, but price/facility selection can be inconsistent. |
| Booking catalogue | Fail (high) | Uses fake fallback venues/slots/prices/amenities when APIs are missing or incomplete. |
| Profile | Fail (high) | Displays fabricated match history for a new account and cannot resolve the account name on the profile page. |
| Academy catalogue | Fail (high) | Remained on the loading spinner after the page had loaded; code also has fallback academies. |
| Final booking, payment, enrollment, tournament/team registration, organizer actions | Not submitted | These create permanent records and/or payment state. No final submit was performed in this QA pass. |

## Verified defects

### P0 — Booking can be created as paid without a payment gateway

**Evidence:** The venue booking UI offers UPI/Card and `Pay at Venue`. In the implementation, any UPI/Card booking is posted with `paymentStatus: 'PAID'` and `paidAmount: selectedSlot.price`; there is no gateway intent, callback, signature validation, or server-side payment verification.

- [venues/[venueUuid]/page.tsx](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/venues/[venueUuid]/page.tsx:186) — direct booking request.
- [venues/[venueUuid]/page.tsx](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/venues/[venueUuid]/page.tsx:197) — client marks UPI/Card payments as `PAID`.

**Impact:** A user can obtain a confirmed paid booking without paying. Payment status must only be changed by a verified server-side payment webhook/callback.

### P0 — Missing phone number is silently replaced with a fake phone number

**Evidence:** The booking screen exposed an empty Phone Number field, yet `Confirm Booking` was enabled after slot selection. The request substitutes `+91 98765 43210` when the field is blank.

- [venues/[venueUuid]/page.tsx](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/venues/[venueUuid]/page.tsx:187)

**Impact:** Venue operators receive false contact details and cannot contact the customer. Require a validated phone number before booking; do not fabricate customer data.

### P1 — Selected facility and checkout price can diverge

**Reproduction:**

1. Open Playzone venue detail.
2. Wait for facility availability.
3. Select Arena 2.
4. Slot buttons display **₹250**, but the checkout summary and confirm label showed **₹200** for the same 06:00 AM time.

**Cause:** The async slot loader keeps a prior selection when *only* `startTime` matches. Both Arena 1 and Arena 2 offer 06:00 AM, so an Arena 1 slot is retained after switching to Arena 2.

- [venues/[venueUuid]/page.tsx](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/venues/[venueUuid]/page.tsx:147) — compares start time only.
- [venues/[venueUuid]/page.tsx](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/venues/[venueUuid]/page.tsx:194) — stale slot price is sent as the booking amount.

**Fix:** Clear `selectedSlot` before facility/date changes, or identify a selected slot by `{facilityId, date, startTime, endTime}`. Validate the slot, price, and availability again on the backend during checkout.

### P1 — Booking catalogue is still driven by static fallback inventory

The user-facing `/bookings` route presented a generic player image and `Address not provided` for the live Playzone record. Source inspection confirms that the page creates and displays invented inventory instead of an honest empty/error state.

- [bookings/page.tsx](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/bookings/page.tsx:82) — `generateDefaultSlots()` invents time slots and prices.
- [bookings/page.tsx](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/bookings/page.tsx:102) — five hard-coded `FALLBACK_BOOKING_VENUES`.
- [bookings/page.tsx](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/bookings/page.tsx:265) — fake venues influence location extraction.
- [bookings/page.tsx](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/bookings/page.tsx:321) and [line 337](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/bookings/page.tsx:337) — fabricated availability when the API returns no slots/facilities.
- [bookings/page.tsx](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/bookings/page.tsx:360) through [line 365](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/bookings/page.tsx:365) — fictional sport, address, amenities and image defaults.
- [bookings/page.tsx](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/bookings/page.tsx:376) and [line 381](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/bookings/page.tsx:381) — all API failures display fake venues.

**Fix:** Remove the fallback venue/slot generators from production. Show `No bookable slots for this date` with retry/error handling. Treat missing image/address/amenities as missing data, not fabricated data.

### P1 — New-player Profile displays fake match history and loses the registered name

**Browser evidence:** The newly registered QA player displayed as **Athlete** on `/profile`, although the authenticated dashboard showed **QA Venue Tester Sep18**. The profile also showed four historic matches from 2024 despite the account having no matches.

- [profile/page.tsx](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/(personal)/profile/page.tsx:333) — hard-coded `matchHistory` begins.
- [profile/page.tsx](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/(personal)/profile/page.tsx:337) through [line 364](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/(personal)/profile/page.tsx:364) — static opponents, scores, tournaments and dates.
- [profile/page.tsx](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/(personal)/profile/page.tsx:508) — falls back to `Athlete` when profile API data is absent.

**Fix:** Fetch real match history and render a zero-state. Persist the registration user UUID/name consistently and use authenticated-store name as a temporary display fallback while profile data loads.

### P1 — Academy catalogue can remain indefinitely in loading state

**Browser evidence:** `/academies` showed `Available Academies & Training Batches (4)` but continued showing `Discovering sports academies...` after page navigation/settling rather than rendering the four records or an error state.

- [academies/page.tsx](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/academies/page.tsx:173) — unbounded `OrganizationService.getAll()` request.
- [academies/page.tsx](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/academies/page.tsx:228) — loading only resolves after that request settles.
- [academies/page.tsx](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/academies/page.tsx:70) — static academy fallback data.
- [academies/page.tsx](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/academies/page.tsx:194) through [line 209](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/academies/page.tsx:209) — fake rating/review/image values when real fields are absent.
- [academies/page.tsx](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/academies/page.tsx:222), [line 226](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/academies/page.tsx:226), and [line 253](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/academies/page.tsx:253) — static listings replace API absence/failure.

**Fix:** Add a request timeout/abort, proper error UI, and use an empty state rather than default academies. Ratings, reviews, and images should be null/omitted unless returned by the backend.

### P1 — New player appears to receive organizer workspace context

**Browser evidence:** Immediately after first login, the player dashboard showed an `ORGANIZER / Matrix` workspace selector and listed Matrix, 89 Mentors, Elite, and Deepak workspaces. A fresh user should not inherit unrelated organizations or organizer capabilities.

**Required investigation:** Verify registration-side role assignment, `OrganizationService.getByUserUuid`, workspace-store hydration, and every organization endpoint's server-side membership authorization. This can be a cross-tenant data/permission exposure if the data is not merely a client-side shell.

### P2 — Registration has no visible success state during submit

The registration form vanished into an empty panel immediately after submission before navigation completed. Login afterwards confirmed the account was created, so this is a feedback/rendering defect rather than a registration failure.

- [register/page.tsx](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/register/page.tsx:93) through [line 105](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/register/page.tsx:105) — success is set and redirect deferred by 2.6 seconds.
- [register/page.tsx](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/app/register/page.tsx:181) — success panel branch to validate visually.

## Other implementation gaps confirmed by code inspection

| Priority | File | Lines | Gap |
|---|---|---:|---|
| P1 | [DrawEngineService.java](C:/Dinesh/Projects/Athlon-Sport/ATHLON/TOURNAMENTSERVICE/src/main/java/com/athlon/tournamentservice/drawengine/DrawEngineService.java:91) | 91, 141, 184, 210, 370 | Tournament draw processing hard-codes `categoryId = 1L`; any other category can generate/read the wrong draw. |
| P1 | [mockSocket.ts](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/lib/live/mockSocket.ts:72) | 72 | Live match client uses a mock socket; this is not production real-time transport. |
| P2 | [qualification.ts](C:/Dinesh/Projects/Athlon-Sport/athlon-user/src/lib/draw-engine/engines/qualification.ts:57) | 57 | Qualification tie-breaking returns `0`; head-to-head tie-break logic is explicitly missing. |

## Recommended remediation order

1. **Protect booking integrity:** eliminate client-side paid status, fake phone numbers, fake slot inventory, and stale facility/slot selection. Re-price and lock the chosen slot in one backend transaction.
2. **Remove production mock data:** booking fallbacks, academy fallbacks, profile match history, mock socket, and default ratings/reviews/images.
3. **Fix identity/workspace boundaries:** test a completely new user against every organization API and require server-side membership/role checks.
4. **Make loading/errors honest:** introduce timeouts, cancellation, and clear retry/empty states for venues and academies.
5. **Complete tournament correctness:** replace hard-coded draw category selection and implement deterministic tie-break rules.
6. **Add automated coverage:** API integration tests for registration/login/profile, booking price/facility race tests, payment state tests, tenant-isolation authorization tests, and browser tests for the zero states above.

## Static data inventory observed in the current user flow

| Route/module | Static data appearing to users |
|---|---|
| `/bookings` | Five fake venues, 10 generated slots per facility, default ₹400/₹450/etc. prices, addresses, amenities, sport lists, and Unsplash imagery — `bookings/page.tsx:82-166`. |
| `/academies` | Four fake academy records, ratings, review counts, distance/location, timing, phone and imagery — `academies/page.tsx:70-132`; additional per-live-record fake rating/review/image defaults at `194-209`. |
| `/profile` | Four fake historic matches, opponents and scores — `profile/page.tsx:333-364`. |
| Live match support | In-memory mock socket — `lib/live/mockSocket.ts:72`, consumed by `hooks/useLiveMatch.ts:2-28`. |

