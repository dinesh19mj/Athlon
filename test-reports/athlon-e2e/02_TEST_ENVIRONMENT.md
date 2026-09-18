# ATHLON — TEST ENVIRONMENT SPECIFICATION
**Report ID:** ATH-E2E-ENV-002  
**Audit Date:** 2026-09-18  

---

## 1. Test Environment Topology

The E2E QA audit was conducted on the local ATHLON deployment on Windows OS, featuring a microservices architecture fronted by Spring Cloud Gateway and connected to a shared PostgreSQL database.

```
                    ┌─────────────────────────┐
                    │     ATHLON USER UI      │ (Next.js 14 / Port 3000)
                    │     ATHLON ADMIN UI     │ (Next.js 14 / Port 3001)
                    └────────────┬────────────┘
                                 │ HTTP / REST / SSE / WS
                                 ▼
                    ┌─────────────────────────┐
                    │     GATEWAYSERVICE      │ (Spring Cloud Gateway / Port 5050)
                    └────────────┬────────────┘
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   AUTHSERVICE    │    │ IDENTITYSERVICE  │    │TOURNAMENTSERVICE │
│   (Port 5051)    │    │   (Port 5052)    │    │   (Port 5053)    │
└────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │    POSTGRESQL RDBMS     │ (Port 5432 / localhost)
                    └─────────────────────────┘
```

---

## 2. Microservices & Network Configuration

| Service Name | Version / Runtime | Local Port | Gateway Route Pattern | Active Status | Health Endpoint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`GATEWAYSERVICE`** | Spring Cloud Gateway 4.1.5, Java 17 | `5050` | `/api/*` (Central Gateway) | **HEALTHY** | `http://localhost:5050/actuator/health` |
| **`AUTHSERVICE`** | Spring Boot 3.3.4, Spring Security 6 | `5051` | `/api/auth/*` | **HEALTHY** | `http://localhost:5051/api/auth/*` |
| **`IDENTITYSERVICE`** | Spring Boot 3.3.4, Hibernate 6.5 | `5052` | `/api/identity/*` | **HEALTHY** | `http://localhost:5052/api/identity/*` |
| **`TOURNAMENTSERVICE`** | Spring Boot 3.3.4, Spring Data JPA | `5053` | `/api/tournament/*` | **HEALTHY** | `http://localhost:5053/api/tournament/*` |
| **`athlon-user`** | Next.js 14.2.5, React 18, Tailwind | `3000` | Frontend Client Portal | **HEALTHY** | `http://localhost:3000` |
| **`athlon-admin`** | Next.js 14.2.5, React 18 | `3001` | Superadmin Portal | **HEALTHY** | `http://localhost:3001` |

---

## 3. Database & Persistence Layer

- **Database Engine:** PostgreSQL 16 (Relational Database)
- **Host / Port:** `localhost:5432`
- **Database Names / Schemas:** `identity_db`, `tournament_db`, `auth_db` / `athlon_db`
- **Connection Pool:** HikariCP (Max 10 connections per service)
- **Flyway / Liquibase / JPA:** `spring.jpa.hibernate.ddl-auto=update`

---

## 4. Authentication Mechanism

- **Token Type:** JSON Web Token (JWT) HMAC-SHA256
- **Access Token Expiry:** 15 minutes (900,000 ms)
- **Refresh Token Expiry:** 7 days (604,800,000 ms)
- **Header Injection:** Gateway forwards Bearer tokens with downstream `X-User-Id`, `X-User-Email`, `X-User-Roles` headers.
