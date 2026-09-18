# ATHLON — QA CREDENTIAL MATRIX & TEST DATA LEDGER
**Report ID:** ATH-E2E-CRED-003  
**Audit Date:** 2026-09-18  

---

## 1. QA User Credentials Matrix

All test accounts were dynamically created using the standard platform registration flows and prefixed with `E2E_` for full data isolation:

| Role | Username / Email | Password (Local QA) | User UUID | User ID | Workspace Context | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Tournament Organizer** | `e2e_organizer@athlon.test` | `Password123!` | `b13ad96f-322a-49fc-8ee6-a2bb84b02c12` | `26` | `E2E Sports Organization` | Tournament Creation, Draw Generation, Live Scoring |
| **Academy Owner** | `e2e_academy@athlon.test` | `Password123!` | `a7b6ec1b-b731-45b6-b111-77c92ab8f334` | `27` | `E2E Badminton Academy` | Academy Centres, Students, Coaches, Fees |
| **Club Manager** | `e2e_club@athlon.test` | `Password123!` | `1e9be777-2302-42d1-bbde-4d86d52f6f72` | `28` | `E2E Premier Sports Club` | Memberships, Ladders, Club Finances |
| **Coach** | `e2e_coach@athlon.test` | `Password123!` | `05e085a5-764f-4db2-931b-b58cff049dc5` | `29` | `E2E Badminton Academy` | Private Sessions, Batches, Attendance |
| **Venue Manager** | `e2e_venue@athlon.test` | `Password123!` | `60fadcfd-e130-43a5-9038-a6a44655b170` | `30` | `E2E Sports Arena` | Courts, Slot Schedule, Hourly Pricing |
| **Player 01 (Seed 1)** | `e2e_player01@athlon.test` | `Password123!` | `abdfa805-99eb-43c0-9bc6-2072f2ad71ce` | `31` | Player Portal / Public | Knockout Champion & Booking Concurrency |
| **Player 02 (Seed 2)** | `e2e_player02@athlon.test` | `Password123!` | `5dda1dfc-d70d-4798-91c5-7c7f9c40ff60` | `32` | Player Portal / Public | Knockout Finalist & Booking Concurrency |
| **Player 03** | `e2e_player03@athlon.test` | `Password123!` | `9010f985-b6bc-4059-9d13-065818a6130b` | `33` | Player Portal / Public | Knockout Semifinalist & League Pool A |
| **Player 04** | `e2e_player04@athlon.test` | `Password123!` | `f200c4d8-8216-459c-8b88-e7e95bb1160c` | `34` | Player Portal / Public | Knockout Semifinalist & League Pool A |
| **Player 05** | `e2e_player05@athlon.test` | `Password123!` | `74fcda11-948e-4707-9360-f7b90ff47338` | `35` | Player Portal / Public | Knockout Quarterfinalist & League Pool B |
| **Player 06** | `e2e_player06@athlon.test` | `Password123!` | `0af79264-1e63-4dfe-bf54-2c0787c8514e` | `36` | Player Portal / Public | Knockout Quarterfinalist & League Pool B |
| **Player 07** | `e2e_player07@athlon.test` | `Password123!` | `fe591d2f-d1b1-4831-9380-d7652d4dfe8f` | `37` | Player Portal / Public | Knockout Quarterfinalist & League Pool B |
| **Player 08** | `e2e_player08@athlon.test` | `Password123!` | `b4880699-61c8-4a73-ad24-c57514891367` | `38` | Player Portal / Public | Knockout Quarterfinalist & League Pool B |

---

## 2. Test Organizations Created

| Organization Name | Type | Organization UUID | Organization ID | Owner Account |
| :--- | :--- | :--- | :--- | :--- |
| **`E2E Sports Organization`** | `ORGANIZER` | `957db9e5-787e-4e3c-9b8a-b9930ecbeb58` | `1` | `e2e_organizer@athlon.test` |
| **`E2E Badminton Academy`** | `ACADEMY` | `3580ffb2-a0b9-4a71-b640-136c20aad351` | `2` | `e2e_academy@athlon.test` |
| **`E2E Premier Sports Club`** | `CLUB` | `b9016368-42c0-4fb1-af1e-8c3ccb948536` | `3` | `e2e_club@athlon.test` |
| **`E2E Sports Arena`** | `VENUE` | `e6f9628d-7d52-4581-9824-2ba2ecde20a6` | `4` | `e2e_venue@athlon.test` |

---

## 3. Test Tournaments & Events Created

| Tournament Name | Format | Tournament UUID | Tournament ID | Category | Matches Played | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`E2E_KNOCKOUT_01`** | KNOCKOUT (8-draw) | `9ceab4f6-4682-466e-8647-0e6c78e14d08` | `12` | Men's Singles Open (Cat ID 3) | 7 / 7 | **COMPLETED** |
| **`E2E_LEAGUE_01`** | LEAGUE (2 Pools of 4) | `015e9727-5948-49c8-97ea-bc1e0988e9e4` | `13` | Open Pool League (Cat ID 4) | 12 / 12 | **COMPLETED** |
| **`E2E_MANUAL_KNOCKOUT_01`** | KNOCKOUT (Manual 4) | `f7918ff9-5dcf-4018-8128-42cf69990e81` | `14` | Manual Open Singles (Cat ID 5) | 3 / 3 | **COMPLETED** |
| **`E2E_TEAM_EVENT_01`** | TEAM_EVENT (Championship) | `5bd68d41-9314-4932-b1bd-8c77e02aea34` | `6` | Multi-category Team Tie | Initialized | **ACTIVE** |
