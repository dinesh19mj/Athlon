# ATHLON — API & BACKEND MICROSERVICES REPORT
**Report ID:** ATH-E2E-API-017  
**Audit Date:** 2026-09-18  

---

## 1. Downstream Gateway Routing & API Mapping

Spring Cloud Gateway (`http://localhost:5050`) routes client traffic to internal Spring Boot microservices based on prefix paths:

| Incoming Gateway Route | Target Downstream Service | Target Port | Status | Protocol |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/**` | `AUTHSERVICE` | `5051` | HTTP 200 / 201 | REST / JSON |
| `/api/identity/**` | `IDENTITYSERVICE` | `5052` | HTTP 200 / 201 | REST / JSON |
| `/api/tournament/**` | `TOURNAMENTSERVICE` | `5053` | HTTP 200 / 201 | REST / JSON & WS |

---

## 2. API Resilience & Validation Observations

1. **Spring Data Validation (`@Valid`):**
   - Correctly enforced on `CreateUserRequest` (email format, minimum password length).
   - Correctly enforced on `TournamentCategoryCreateRequest` (sportType, categoryName, organizationId).
   - Correctly enforced on `ManualDrawRequest` and `LeagueDrawRequest`.
2. **Error Response Standardization:**
   - All microservices wrap responses in `ApiResponse<T>` with `success: boolean`, `message: string`, and `data: T`.
   - Exceptions are routed through `@RestControllerAdvice` (`GlobalExceptionHandler`).
3. **HTTP Status Code Discipline:**
   - Resource Creation: `HTTP 201 Created`
   - Successful Queries & Updates: `HTTP 200 OK`
   - Validation Failures: `HTTP 400 Bad Request`
   - Authentication Failures: `HTTP 401 Unauthorized`
   - Missing Resources: `HTTP 404 Not Found`
