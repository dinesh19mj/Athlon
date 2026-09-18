# ATHLON E2E TEST STATE LEDGER
**Run Timestamp:** 2026-09-18T15:50:00+05:30  
**Environment:** Localhost (Gateway: 5050, User App: 3000, Admin App: 3001)  
**Status:** **AUDIT COMPLETE**

---

## 1. TEST USER ACCOUNTS MATRIX

| Account ID / Tag | Username / Email | Role | Athlon User UUID | User ID | Workspace Context | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `E2E_ORGANIZER` | `e2e_organizer@athlon.test` | `ROLE_ORGANIZER` | `b13ad96f-322a-49fc-8ee6-a2bb84b02c12` | `26` | `E2E Sports Organization` | **VERIFIED (PASS)** |
| `E2E_ACADEMY_OWNER` | `e2e_academy@athlon.test` | `ROLE_ACADEMY_OWNER` | `a7b6ec1b-b731-45b6-b111-77c92ab8f334` | `27` | `E2E Badminton Academy` | **VERIFIED (PASS)** |
| `E2E_CLUB_MANAGER` | `e2e_club@athlon.test` | `ROLE_CLUB_MANAGER` | `1e9be777-2302-42d1-bbde-4d86d52f6f72` | `28` | `E2E Premier Sports Club` | **VERIFIED (PASS)** |
| `E2E_COACH` | `e2e_coach@athlon.test` | `ROLE_COACH` | `05e085a5-764f-4db2-931b-b58cff049dc5` | `29` | `E2E Badminton Academy` | **VERIFIED (PASS)** |
| `E2E_VENUE_MANAGER` | `e2e_venue@athlon.test` | `ROLE_VENUE_MANAGER` | `60fadcfd-e130-43a5-9038-a6a44655b170` | `30` | `E2E Sports Arena` | **VERIFIED (PASS)** |
| `E2E_PLAYER_01` | `e2e_player01@athlon.test` | `ROLE_USER` | `abdfa805-99eb-43c0-9bc6-2072f2ad71ce` | `31` | Player Portal / Public | **VERIFIED (PASS)** |
| `E2E_PLAYER_02` | `e2e_player02@athlon.test` | `ROLE_USER` | `5dda1dfc-d70d-4798-91c5-7c7f9c40ff60` | `32` | Player Portal / Public | **VERIFIED (PASS)** |
| `E2E_PLAYER_03` | `e2e_player03@athlon.test` | `ROLE_USER` | `9010f985-b6bc-4059-9d13-065818a6130b` | `33` | Player Portal / Public | **VERIFIED (PASS)** |
| `E2E_PLAYER_04` | `e2e_player04@athlon.test` | `ROLE_USER` | `f200c4d8-8216-459c-8b88-e7e95bb1160c` | `34` | Player Portal / Public | **VERIFIED (PASS)** |
| `E2E_PLAYER_05` | `e2e_player05@athlon.test` | `ROLE_USER` | `74fcda11-948e-4707-9360-f7b90ff47338` | `35` | Player Portal / Public | **VERIFIED (PASS)** |
| `E2E_PLAYER_06` | `e2e_player06@athlon.test` | `ROLE_USER` | `0af79264-1e63-4dfe-bf54-2c0787c8514e` | `36` | Player Portal / Public | **VERIFIED (PASS)** |
| `E2E_PLAYER_07` | `e2e_player07@athlon.test` | `ROLE_USER` | `fe591d2f-d1b1-4831-9380-d7652d4dfe8f` | `37` | Player Portal / Public | **VERIFIED (PASS)** |
| `E2E_PLAYER_08` | `e2e_player08@athlon.test` | `ROLE_USER` | `b4880699-61c8-4a73-ad24-c57514891367` | `38` | Player Portal / Public | **VERIFIED (PASS)** |

---

## 2. TEST ORGANIZATIONS & WORKSPACES

| Organization Tag | Type | UUID / ID | Owner Email | Status |
| :--- | :--- | :--- | :--- | :--- |
| `E2E_ORG_MAIN` | `ORGANIZER` | `957db9e5-787e-4e3c-9b8a-b9930ecbeb58` / ID 1 | `e2e_organizer@athlon.test` | **ACTIVE (PASS)** |
| `E2E_ACADEMY_MAIN` | `ACADEMY` | `3580ffb2-a0b9-4a71-b640-136c20aad351` / ID 2 | `e2e_academy@athlon.test` | **ACTIVE (PASS)** |
| `E2E_CLUB_MAIN` | `CLUB` | `b9016368-42c0-4fb1-af1e-8c3ccb948536` / ID 3 | `e2e_club@athlon.test` | **ACTIVE (PASS)** |
| `E2E_VENUE_MAIN` | `VENUE` | `e6f9628d-7d52-4581-9824-2ba2ecde20a6` / ID 4 | `e2e_venue@athlon.test` | **ACTIVE (PASS)** |

---

## 3. TEST TOURNAMENTS & CHAMPIONSHIPS

| Tournament Tag | Type | Sport | Category | Participants | Matches Completed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `E2E_KNOCKOUT_01` | KNOCKOUT | Badminton | Men's Singles Open (Cat 3) | 8 Players | 7 / 7 (100%) | **COMPLETED (PASS)** |
| `E2E_LEAGUE_01` | LEAGUE_KNOCKOUT | Badminton | Open Pool League (Cat 4) | 8 Players (2 Pools) | 12 / 12 (100%) | **COMPLETED (PASS)** |
| `E2E_MANUAL_KNOCKOUT_01` | KNOCKOUT | Tennis | Manual Open Singles (Cat 5) | 4 Players | 3 / 3 (100%) | **COMPLETED (PASS)** |
| `E2E_TEAM_EVENT_01` | TEAM_EVENT | Badminton | Multi-Category Tie | 4 Teams (Squads) | Pool fixtures generated | **ACTIVE (PASS)** |

---

## 4. TOURNAMENT EXECUTION LEDGERS

### A. Knockout Tournament Progression (`E2E_KNOCKOUT_01`)
- **Tournament UUID:** `9ceab4f6-4682-466e-8647-0e6c78e14d08`
- **Draw ID:** `13` (8-player single elimination)
- **Round 1 (Quarterfinals):**
  - Match 1: Player 01 (Reg 70) vs Player 06 (Reg 71) &rarr; **Winner: Player 01 (Reg 70)**
  - Match 2: Player 02 (Reg 66) vs Player 07 (Reg 72) &rarr; **Winner: Player 02 (Reg 66)**
  - Match 3: Player 03 (Reg 67) vs Player 08 (Reg 73) &rarr; **Winner: Player 03 (Reg 67)**
  - Match 4: Player 04 (Reg 68) vs Player 05 (Reg 69) &rarr; **Winner: Player 04 (Reg 68)**
- **Round 2 (Semifinals):**
  - Match 5: Player 01 (Reg 70) vs Player 02 (Reg 66) &rarr; **Winner: Player 01 (Reg 70)**
  - Match 6: Player 03 (Reg 67) vs Player 04 (Reg 68) &rarr; **Winner: Player 03 (Reg 67)**
- **Round 3 (Final):**
  - Match 7: Player 01 (Reg 70) vs Player 03 (Reg 67) &rarr; **Winner: Player 01 (Reg 70)**
- **Champion:** **E2E Player 01 (Reg ID: 70)**
- **Final Status:** **COMPLETED (PASS)**

---

### B. League Tournament Progression (`E2E_LEAGUE_01`)
- **Tournament UUID:** `015e9727-5948-49c8-97ea-bc1e0988e9e4`
- **Pool A:** League Team 1, League Team 2, League Team 3, League Team 4 (6 matches played)
- **Pool B:** League Team 5, League Team 6, League Team 7, League Team 8 (6 matches played)
- **Pool A Qualifiers:** League Team 1 (A1), League Team 2 (A2)
- **Pool B Qualifiers:** League Team 5 (B1), League Team 6 (B2)
- **Playoffs:** Semifinals & Finals generated successfully
- **Champion:** **League Team 1**
- **Final Status:** **COMPLETED (PASS)**

---

### C. Manual Tournament Progression (`E2E_MANUAL_KNOCKOUT_01`)
- **Tournament UUID:** `f7918ff9-5dcf-4018-8128-42cf69990e81`
- **Semifinals:** P1 def. P2 (6-4), P3 def. P4 (6-4)
- **Final:** P1 def. P3 (6-3)
- **Champion:** **Manual Player 1**
- **Final Status:** **COMPLETED (PASS)**
