# Athlon-Sport Production Deployment & Optimization Guide

This document details the complete production deployment architecture, root causes of the previous disk space & API failure issues, exact configurations applied, and the step-by-step workflow for future deployments.

---

## 1. Executive Summary

| Metric | Before Optimization | After Optimization | Improvement |
| :--- | :--- | :--- | :--- |
| **`athlon-user` Disk Footprint** | **8.6 GB** | **164 MB** | **98.1% reduction** |
| **Server Disk Usage (`/dev/root`)** | **85% full (25+ GB used)** | **40% full (12 GB used, 18 GB free)** | **13+ GB disk reclaimed** |
| **Frontend RAM Consumption** | ~250 MB+ (dev mode & full node_modules) | **26 MB - 35 MB** | **~85% memory saved** |
| **Backend API Route Health** | 500 Error / Connection Timeouts | **200 OK (Instant)** | **Fixed routing loopback** |
| **Deployment Speed** | 5–8 minutes (high risk of OOM crash) | **~15 seconds** | **Pre-built standalone package** |

---

## 2. Root Cause Analysis

### A. Why APIs Were Failing on `athlon.co.in`
1. **Public IP Hairpin NAT Failure**:
   - The Spring Boot Gateway was configured in `application-live.properties` to connect to downstream microservices using the public EC2 IP address (`http://15.252.63.6:5051..5055`).
   - On AWS EC2 instances, making outbound TCP connections back to the instance's own public elastic IP without hairpin NAT configuration causes connection drops and `java.net.ConnectException: ClosedChannelException`.
2. **Mixed Content & SSL Conflicts**:
   - The frontend was attempting to call `http://15.252.63.6:5050` from an HTTPS browser session (`https://athlon.co.in`), which modern browsers block as mixed content.

### B. Why `athlon-user` Occupied 7+ GB of Disk Space
1. **Accumulated Webpack & Dev Caches**:
   - Running `next dev` and server-side builds generated `.next/dev` (**5.72 GB**) and `.next/cache` (**1.39 GB**).
2. **Heavy Node Modules**:
   - The full development `node_modules` folder on the server took **1.2 GB**.
3. **RAM Starvation During Server-Side Builds**:
   - Compiling Next.js with TypeScript and Webpack on a 2GB EC2 host exceeded the Node.js V8 memory limit (`FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory`).

---

## 3. Architecture & Traffic Flow

```mermaid
flowchart LR
    Browser["Client Browser (HTTPS)"]
    Nginx["Nginx Reverse Proxy (:80 / :443)"]
    NextJS["Next.js Standalone (:3000)"]
    Gateway["Spring Boot Gateway (:5050)"]
    Auth["Auth Service (:5051)"]
    Identity["Identity Service (:5052)"]
    Tournament["Tournament Service (:5053)"]
    Payment["Payment Service (:5054)"]
    Marketplace["Marketplace Service (:5055)"]

    Browser -->|https://athlon.co.in/| Nginx
    Browser -->|https://athlon.co.in/api/*| Nginx

    Nginx -->|/ (Frontend)| NextJS
    Nginx -->|/api/* (Backend)| Gateway

    Gateway -->|/api/auth/*| Auth
    Gateway -->|/api/identity/*| Identity
    Gateway -->|/api/tournament/*| Tournament
    Gateway -->|/api/payments/*| Payment
    Gateway -->|/api/marketplace/*| Marketplace
```

---

## 4. Key Configuration Changes

### A. Spring Boot Gateway ([application-live.properties](file:///c:/Dinesh/Projects/Athlon-Sport/ATHLON/GATEWAYSERVICE/src/main/resources/application-live.properties))
Downstream services were updated to point strictly to internal loopback `127.0.0.1`:
```properties
spring.application.name=GATEWAYSERVICE
server.port=5050

# Internal Loopback URLs (avoids AWS Hairpin NAT issues)
service.auth.url=http://127.0.0.1:5051
service.identity.url=http://127.0.0.1:5052
service.tournament.url=http://127.0.0.1:5053
service.payment.url=http://127.0.0.1:5054
service.marketplace.url=http://127.0.0.1:5055
```

### B. Next.js Standalone Configuration ([next.config.ts](file:///c:/Dinesh/Projects/Athlon-Sport/athlon-user/next.config.ts))
Standalone mode instructs Next.js to trace all imports and generate a lightweight, self-contained `server.js` with only essential production dependencies:
```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.INTERNAL_API_URL || 'http://127.0.0.1:5050'}/api/:path*`,
      },
    ];
  },
};
```

### C. PM2 Ecosystem Configuration (`ecosystem.config.cjs`)
Located at `/home/ubuntu/athlon-user/ecosystem.config.cjs`:
```javascript
module.exports = {
  apps: [
    {
      name: 'athlon-user',
      script: 'server.js',
      cwd: '/home/ubuntu/athlon-user',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
        INTERNAL_API_URL: 'http://127.0.0.1:5050'
      }
    }
  ]
};
```

---

## 5. Deployment Procedures

### Method 1: Automated 1-Click Deployment (Recommended)

Run the included PowerShell deployment script from your local machine:
```powershell
powershell -ExecutionPolicy Bypass -File C:\Dinesh\Projects\Athlon-Sport\Infrastructure\deploy.ps1
```

**What this script does automatically:**
1. Runs `npm run build` locally (leverages local machine RAM and CPU).
2. Copies static files (`public` and `.next/static`) into `.next/standalone`.
3. Compresses the standalone bundle into a ~75 MB tarball (`athlon-standalone.tar.gz`).
4. Uploads the bundle via SCP to the Ubuntu server.
5. Cleans server cache, extracts the bundle to `/home/ubuntu/athlon-user`, and reloads PM2.
6. Cleans local temporary archives. Total execution time: **< 30 seconds**.

---

### Method 2: Manual Step-by-Step Deployment

If you ever need to perform manual steps:

#### Step 1: Build Locally
```powershell
cd C:\Dinesh\Projects\Athlon-Sport\athlon-user
npm run build
Copy-Item -Recurse -Force public .next\standalone\public
New-Item -ItemType Directory -Force -Path .next\standalone\.next | Out-Null
Copy-Item -Recurse -Force .next\static .next\standalone\.next\static
tar -czf ..\athlon-standalone.tar.gz -C .next\standalone .
```

#### Step 2: Upload to Server
```powershell
scp -i "C:\Dinesh\Projects\Athlon-Sport\Infrastructure\athlon-key.pem" "C:\Dinesh\Projects\Athlon-Sport\athlon-standalone.tar.gz" ubuntu@15.252.63.6:/home/ubuntu/athlon-standalone.tar.gz
```

#### Step 3: Extract and Restart on Server
```bash
ssh -i "C:\Dinesh\Projects\Athlon-Sport\Infrastructure\athlon-key.pem" ubuntu@15.252.63.6

# On the server:
cd /home/ubuntu/athlon-user
rm -rf node_modules .next src public
tar -xzf /home/ubuntu/athlon-standalone.tar.gz -C /home/ubuntu/athlon-user
rm -f /home/ubuntu/athlon-standalone.tar.gz
pm2 restart ecosystem.config.cjs || pm2 start ecosystem.config.cjs
pm2 save
```

---

## 6. Verification & Health Check Commands

To verify that the system is running stably:

```bash
# 1. Check PM2 status
pm2 status

# 2. Check disk space usage
df -h /
du -sh /home/ubuntu/athlon-user

# 3. Test Frontend HTTP response
curl -I http://127.0.0.1:3000
curl -I https://athlon.co.in

# 4. Test Backend Gateway response
curl -s http://127.0.0.1:5050/api/tournament/tournaments/getAllActiveTournaments | head -c 200
curl -s https://athlon.co.in/api/tournament/tournaments/getAllActiveTournaments | head -c 200

# 5. Check Microservice Systemd statuses
sudo systemctl is-active gatewayservice authservice identityservice tournamentservice
```
