# ATHLON — TEST COVERAGE MATRIX
**Report ID:** ATH-E2E-COV-004  
**Audit Date:** 2026-09-18  

---

## 1. Full Module & Feature Coverage Matrix

| Module | Feature / Capability | Desktop (1440px) | Mobile (375px/430px) | Positive Flow | Negative Flow | API Verification | Final Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication** | Registration (Email/Password) | PASS | PASS | PASS | PASS | PASS | **PASS** |
| **Authentication** | Login & JWT Issuance | PASS | PASS | PASS | PASS | PASS | **PASS** |
| **Authentication** | Invalid Password Rejection | PASS | PASS | PASS | PASS | PASS | **PASS** |
| **Authentication** | Token Session Persistence | PASS | PASS | PASS | N/A | PASS | **PASS** |
| **Player Portal** | View Personal Profile | PASS | PASS | PASS | N/A | PASS | **PASS** |
| **Player Portal** | Sports Profile Configuration | PASS | PASS | PASS | PASS | PASS | **PASS** |
| **Player Portal** | Dynamic Match History | PASS | PASS | PASS | N/A | PASS | **PASS** |
| **Workspaces** | Context Switching & Headers | PASS | PASS | PASS | PASS | PASS | **PASS** |
| **Workspaces** | Direct URL Route Access | PASS | PASS | PASS | PASS | PASS | **PASS** |
| **Tournament Org** | Create Tournament Wizard | PASS | PASS | PASS | PASS | PASS | **PASS** |
| **Tournament Org** | Category / Event Definitions | PASS | PASS | PASS | PASS | PASS | **PASS** |
| **Tournament Org** | Public Registration & Approval | PASS | PASS | PASS | PASS | PASS | **PASS** |
| **Knockout Engine** | Binary Bracket Draw Generation | PASS | PASS | PASS | PASS | PASS | **PASS** |
| **Knockout Engine** | Live Scoring & Set Transitions | PASS | PASS | PASS | PASS | PASS | **PASS** |
| **Knockout Engine** | Auto-Advance Winners to Next Round | PASS | PASS | PASS | N/A | PASS | **PASS** |
| **Knockout Engine** | Final & Champion Declaration | PASS | PASS | PASS | N/A | PASS | **PASS** |
| **League Engine** | Multi-Pool Round Robin Draw | PASS | PASS | PASS | PASS | PASS | **PASS** |
| **League Engine** | Real-Time Pool Standings | PASS | PASS | PASS | N/A | PASS | **PASS** |
| **League Engine** | Playoff Knockout Progression | PASS | PASS | PASS | N/A | PASS | **PASS** |
| **Team Event** | Multi-Category Championship Tie | PASS | PASS | PASS | N/A | PASS | **PASS** |
| **Manual Draw** | Organizer Offline Participant Entry | PASS | PASS | PASS | PASS | PASS | **PASS** |
| **Academy** | Training Centres Management | PASS | PASS | PASS | PASS | PASS | **PASS** |
| **Academy** | Fee Collection & Invoices | PASS | PASS | PASS | PASS | PASS | **PASS** |
| **Academy** | Equipment Inventory Tracking | PASS | PASS | PASS | PASS | PASS | **PASS** |
| **Club** | Club Profile & Finance Records | PASS | PASS | PASS | PASS | PASS | **PASS** |
| **Coach** | Coach Profile & Private Coaching | PASS | PASS | PASS | PASS | PASS | **PASS** |
| **Venue Bookings**| Arena & Court Facility Setup | PASS | PASS | PASS | PASS | PASS | **PASS** |
| **Venue Bookings**| Single Slot Reservation | PASS | PASS | PASS | PASS | PASS | **PASS** |
| **Venue Bookings**| Concurrency Double-Booking Lock | FAIL | FAIL | FAIL | FAIL | FAIL | **FAIL** |
| **Security** | Cross-Tenant Data Isolation | PASS | PASS | PASS | PASS | PASS | **PASS** |
| **Security** | Unauthenticated Access Protection | PARTIAL | PARTIAL | PASS | FAIL | PARTIAL | **PARTIAL** |
| **UI Aesthetics** | Dark / Light Mode Themes | PASS | PASS | PASS | N/A | PASS | **PASS** |
| **UI Aesthetics** | Responsive Breakpoints | PASS | PASS | PASS | N/A | PASS | **PASS** |
