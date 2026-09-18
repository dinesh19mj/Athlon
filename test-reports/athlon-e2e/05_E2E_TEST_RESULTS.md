# ATHLON — E2E TEST EXECUTION RESULTS
**Report ID:** ATH-E2E-RES-005  
**Audit Date:** 2026-09-18  

---

## 1. Test Suite Progression Summary

```
Total Test Cases Executed: 58
├── Passed Cases: 53 (91.4%)
├── Partial / Conditional Passes: 4 (6.9%)
└── Failed Test Cases: 1 (1.7%)
```

---

## 2. Detailed Execution Log

| Test ID | Module | Scenario Tested | Preconditions | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | Authentication | Reject invalid email format during registration | Malformed email string | Rejected with HTTP 400 Bad Request | **PASS** |
| **TC-AUTH-02** | Authentication | Reject short password (< 3 characters) | Password of length 2 | Rejected with HTTP 400 Bad Request | **PASS** |
| **TC-AUTH-03** | Authentication | Valid user registration across all 13 QA personas | Valid registration payload | All 13 accounts registered successfully | **PASS** |
| **TC-AUTH-04** | Authentication | User authentication & JWT issuance | Valid credentials | Issued Bearer token with 15m expiration | **PASS** |
| **TC-AUTH-05** | Authentication | Reject incorrect password | Wrong password string | Rejected with HTTP 401 Unauthorized | **PASS** |
| **TC-PROF-01** | Player Profile | Fetch user profile by User UUID | Authenticated user | Retrieved full user name, email, phone | **PASS** |
| **TC-PROF-02** | Player Profile | Fetch dynamic user match history | User with match records | Fetched matches via MatchService.getByUser | **PASS** |
| **TC-WORK-01** | Workspace | Create Organizer Organization | Authenticated Organizer | Created `E2E Sports Organization` (UUID: `957db9e5-...`) | **PASS** |
| **TC-WORK-02** | Workspace | Create Academy Organization | Authenticated Academy Owner | Created `E2E Badminton Academy` (UUID: `3580ffb2-...`) | **PASS** |
| **TC-WORK-03** | Workspace | Create Club Organization | Authenticated Club Manager | Created `E2E Premier Sports Club` (UUID: `b9016368-...`) | **PASS** |
| **TC-KNOCK-01** | Knockout Tourn | Create Knockout Tournament `E2E_KNOCKOUT_01` | Active Organizer | Created tournament (UUID: `9ceab4f6-...`) | **PASS** |
| **TC-KNOCK-02** | Knockout Tourn | Create Category "Men's Singles Open" | Valid Tournament | Created Category ID 3 with Badminton sport | **PASS** |
| **TC-KNOCK-03** | Knockout Tourn | Register and approve 8 players | Published category | 8 participants approved and paid | **PASS** |
| **TC-KNOCK-04** | Knockout Tourn | Generate Knockout Draw for 8 participants | 8 approved players | Generated Draw ID 13 with 7 match fixtures | **PASS** |
| **TC-KNOCK-05** | Knockout Tourn | Complete 4 Quarterfinal Matches with live scores | 4 ready QF fixtures | Synchronized set scores, declared 4 winners | **PASS** |
| **TC-KNOCK-06** | Knockout Tourn | Verify winner advancement to Semifinals | Completed QF matches | 4 winners populated both Semifinal matches | **PASS** |
| **TC-KNOCK-07** | Knockout Tourn | Complete 2 Semifinal Matches with live scores | 2 ready SF fixtures | Synchronized set scores, declared 2 finalists | **PASS** |
| **TC-KNOCK-08** | Knockout Tourn | Verify finalists advancement to Final | Completed SF matches | 2 finalists populated Final match fixture | **PASS** |
| **TC-KNOCK-09** | Knockout Tourn | Complete Final Match and declare Champion | Ready Final fixture | Winner declared (`RegID: 70`), status `COMPLETED` | **PASS** |
| **TC-LEAG-01** | League Tourn | Create League Tournament `E2E_LEAGUE_01` | Active Organizer | Created tournament (UUID: `015e9727-...`) | **PASS** |
| **TC-LEAG-02** | League Tourn | Register & approve 8 League teams | Open League category | 8 participants approved | **PASS** |
| **TC-LEAG-03** | League Tourn | Generate League Draw with 2 Pools of 4 | 8 approved teams | Generated Pool A & Pool B round robin draws | **PASS** |
| **TC-LEAG-04** | League Tourn | Verify 12 round-robin pool fixtures generated | 2 pools of 4 | Exact match count of 12 fixtures created | **PASS** |
| **TC-LEAG-05** | League Tourn | Play all 12 pool matches & sync scores | 12 pool matches | All matches completed with set scores | **PASS** |
| **TC-LEAG-06** | League Tourn | Fetch & verify real-time pool standings | Completed matches | Dynamic points table computed accurately | **PASS** |
| **TC-LEAG-07** | League Tourn | Generate League Playoff Semifinals & Finals | Pool standings ready | Generated playoff knockout bracket | **PASS** |
| **TC-TEAM-01** | Team Event | Create Team Championship `E2E_TEAM_EVENT_01` | Active Organizer | Created Championship with 3 categories & 2 pools | **PASS** |
| **TC-MANU-01** | Manual Draw | Create manual tournament `E2E_MANUAL_KNOCKOUT_01` | Active Organizer | Created manual tournament (UUID: `f7918ff9-...`) | **PASS** |
| **TC-MANU-02** | Manual Draw | Register 4 manual offline participants | Open category | 4 offline players registered | **PASS** |
| **TC-MANU-03** | Manual Draw | Generate manual draw with custom pairings | 4 participants | Generated 3-match single elimination tree | **PASS** |
| **TC-MANU-04** | Manual Draw | Play Semifinals, Final, declare Champion | Manual fixtures | All matches completed, Champion declared | **PASS** |
| **TC-ACAD-01** | Academy | Create Academy Training Centre | Active Academy | Created South Bangalore Training Centre | **PASS** |
| **TC-ACAD-02** | Academy | Record Academy Finance Transaction | Active Academy | Recorded Student Fee income transaction | **PASS** |
| **TC-ACAD-03** | Academy | Record Academy Inventory Stock | Active Academy | Created consumable shuttlecock inventory item | **PASS** |
| **TC-CLUB-01** | Club | Record Club Membership Finance Transaction | Active Club | Recorded Annual Membership Fee transaction | **PASS** |
| **TC-COACH-01** | Coach | Record Coach Private Coaching Session Income | Active Coach | Recorded Private masterclass session income | **PASS** |
| **TC-VENU-01** | Venue Manager | Create Venue `E2E Sports Arena` | Active Venue Owner | Created Venue Arena entity | **PASS** |
| **TC-VENU-02** | Venue Manager | Create Facility `Badminton Court 1` | Active Venue | Created synthetic wooden court facility | **PASS** |
| **TC-VENU-03** | Venue Manager | Single Court Slot Booking | Available slot | Confirmed reservation for 18:00 slot | **PASS** |
| **TC-VENU-04** | Venue Manager | Concurrency Double Booking Prevention Test | Simultaneous requests | **FAILED**: Both simultaneous requests confirmed | **FAIL** |
| **TC-SEC-01** | Security | Unauthenticated organization creation rejection | Anonymous caller | Gateway returned HTTP 409 / 401 | **PASS** |
