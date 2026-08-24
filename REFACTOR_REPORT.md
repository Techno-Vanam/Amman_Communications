# Turborepo Refactoring Report
**Date:** 2026-08-24  
**Status:** ✅ Complete — structure validated, types clean, builds pass

---

## A. Existing Structure Discovered

**Root location:** `C:\Users\Pavith\Desktop\Fs\TechnoVanamClientProject\business-platform`  
**Repository state:** Clean git working tree on `main` branch, 28e35ac HEAD.

**Original monorepo shape:**
- Three separate Next.js applications: `apps/platform-web` (port 3000), `apps/employee-web` (port 3001), `apps/client-web` (port 3002)
- One centralized NestJS API: `apps/api` (port 3003)
- Prisma and database schema at repository root: `prisma/schema.prisma`
- Shared packages: `eslint-config`, `shared-auth`, `shared-types`, `shared-ui`, `tsconfig`
- Docker Compose: PostgreSQL 16 Alpine only
- Minimal models: only `HealthCheck` in Prisma

---

## B. What Was Changed

### Structural refactoring:
1. **Consolidated three Next.js apps into one:**
   - Promoted `apps/platform-web` → `apps/web`
   - Moved `apps/client-web` → `legacy/client-web` (preserved, excluded from workspace)
   - Moved `apps/employee-web` → `legacy/employee-web` (preserved, excluded from workspace)

2. **Moved Prisma ownership to backend:**
   - `prisma/` → `apps/api/prisma/`
   - Updated root scripts to delegate: `pnpm db:* → pnpm --filter @repo/api db:*`
   - Moved `@prisma/client` and `prisma` CLI from root to `apps/api` devDependencies

3. **Expanded Prisma schema with business models:**
   - Added: `Customer`, `Admin`, `Application`, `Document`, `DocumentVerificationStatus` enum
   - Maintained: `HealthCheck` for connection verification
   - All with proper relations, timestamps, and cascading deletes

4. **Added backend security and storage foundation:**
   - Created `apps/api/src/auth/` with `AuthService`, `AdminAuthGuard`, `CustomerAuthGuard`
   - Created `apps/api/src/documents/` with document metadata endpoints
   - Created `apps/api/src/storage/` with Firebase Admin service scaffolding
   - Added JWT support and bcrypt password hashing to dependencies

5. **Unified Next.js with route areas:**
   - Added `/portal` layouts and pages for customers
   - Added `/admin` layouts and pages for admins
   - Added public `/login` and `/admin/login` pages
   - Added `middleware.ts` for route protection (checks for access tokens)

6. **Updated environment configuration:**
   - Root `.env.example`: now includes all backend secrets (JWT, Firebase, CORS, Sentry)
   - `apps/api/.env.example`: full backend configuration template
   - `apps/web/.env.example`: frontend-only public variables

---

## C. Final Folder Structure

```
business-platform/
├── apps/
│   ├── web/              ← UNIFIED Next.js app (one frontend)
│   │   ├── src/app/
│   │   │   ├── (public)/page.tsx, login/
│   │   │   ├── portal/layout.tsx, dashboard/page.tsx, documents/page.tsx
│   │   │   └── admin/layout.tsx, login/page.tsx, dashboard/page.tsx
│   │   ├── middleware.ts
│   │   ├── package.json (@repo/web)
│   │   └── ...
│   └── api/              ← CENTRALIZED NestJS API
│       ├── prisma/
│       │   ├── schema.prisma (models: Customer, Admin, Application, Document, HealthCheck)
│       │   └── migrations/
│       ├── src/
│       │   ├── auth/ (AuthService, guards, strategies)
│       │   ├── documents/ (DocumentsService, controller)
│       │   ├── storage/ (FirebaseService)
│       │   ├── health/
│       │   ├── prisma/
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── package.json (@repo/api) — owns prisma & firebase-admin
│       └── ...
├── packages/
│   ├── eslint-config/
│   ├── shared-auth/
│   ├── shared-types/
│   ├── shared-ui/
│   └── tsconfig/
├── legacy/               ← Preserved old apps (excluded from workspace)
│   ├── client-web/
│   └── employee-web/
├── infrastructure/
│   ├── aws/
│   ├── docker/
│   └── scripts/
├── .env.example          (root: all environment variables)
├── docker-compose.yml    (PostgreSQL 16)
├── pnpm-workspace.yaml   (workspace definition)
├── turbo.json
├── package.json
└── README.md
```

---

## D. Prisma Location & Why

**Location:** `apps/api/prisma/`

**Rationale:**
- Prisma is a backend-only dependency; frontend must never import `@prisma/client`.
- Centralizing schema, migrations, and client generation under the API enforces this architectural boundary.
- Only NestJS code reads the database; Next.js only calls REST endpoints.
- Secret database credentials (`DATABASE_URL`, `DIRECT_DATABASE_URL`) are backend-only environment variables.
- Root database scripts delegate to the API package: `pnpm db:generate` → `pnpm --filter @repo/api db:generate`.

---

## E. PostgreSQL Architecture

**Provider:** PostgreSQL 16 (via Docker Compose)

**Connection model:**
```
Next.js (apps/web)
   ↓ (HTTP REST API only)
NestJS (apps/api)
   ↓ (Prisma + pnpm)
PostgreSQL
```

**Credentials:**
- `DATABASE_URL`: pooled connection for runtime (NestJS).
- `DIRECT_DATABASE_URL`: direct connection for migrations and admin tasks.
- Both point to `postgresql://postgres:change-me-locally@localhost:5432/business_platform?schema=public` in local development.
- Secrets are **backend-only**, never exposed to Next.js.

**Data models:**
- `HealthCheck`: minimal model to verify database connection
- `Customer`: email, password hash, name; many applications and documents
- `Admin`: email, password hash, name; global access to all data
- `Application`: belongs to one customer; contains documents
- `Document`: belongs to customer + application; stores metadata (path, type, size, verification status); file bytes live in Firebase Storage

---

## F. Firebase Storage Architecture

**Purpose:** Store persistent application/user files (PDFs, images, documents).

**Ownership:** Backend-only (NestJS + Firebase Admin SDK).

**Path structure:**
```
gs://bucket/
├── documents/{customer_id}/{application_id}/
│   ├── aadhaar_{timestamp}.pdf
│   ├── pan_{timestamp}.jpg
│   └── sale_deed_{timestamp}.pdf
├── customer-photos/{customer_id}/
│   └── profile_{timestamp}.jpg
├── receipts/{application_id}/
│   └── receipt_{payment_id}.pdf
└── business-assets/
    └── logo_current.png
```

**Security:**
- Signed upload URLs: customers receive temporary URLs to upload directly to Firebase.
- Signed download URLs: backend generates temporary URLs for access.
- Bucket credentials are **backend-only** environment variables.
- Frontend never receives Firebase Admin credentials.

**Frontend dependencies:** None required yet. All file operations go through backend REST endpoints.

---

## G. File Upload Flow (Foundation)

### Upload initiation:
```
1. Customer: POST /api/customer/documents/upload-url
   {
     "applicationId": "...",
     "documentType": "aadhaar",
     "mimeType": "application/pdf",
     "fileSize": 1024000
   }

2. NestJS:
   - Authenticate customer (validate JWT)
   - Authorize application ownership
   - Validate file type/size
   - Generate Firebase signed upload URL
   - Create Document record (PENDING status)

3. Return to frontend:
   {
     "uploadUrl": "https://storage.googleapis.com/...",
     "documentId": "...",
     "expiresAt": "..."
   }

4. Frontend: Upload file directly to signed URL (no backend proxy)

5. Firebase: Stores file under gs://bucket/documents/{customerId}/{appId}/aadhaar_{timestamp}.pdf
```

### Upload completion:
```
1. Frontend: POST /api/customer/documents/{documentId}/complete
   { "storagePath": "documents/..." }

2. NestJS:
   - Verify upload metadata
   - Update Document record with storagePath
   - Return metadata

3. PostgreSQL: Document record updated with real storage path
```

### Download:
```
1. Customer: GET /api/customer/documents/{documentId}/download

2. NestJS:
   - Authenticate
   - Verify document belongs to customer
   - Generate Firebase signed download URL (5 min expiry)
   - Return URL to frontend

3. Frontend: Redirect user to signed URL

4. Firebase: Serve file securely
```

---

## H. Environment Variables Required

### Root `.env.example`:
```
POSTGRES_DB=business_platform
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change-me-locally
POSTGRES_PORT=5432
DATABASE_URL=postgresql://postgres:change-me-locally@localhost:5432/business_platform?schema=public
DIRECT_DATABASE_URL=postgresql://postgres:change-me-locally@localhost:5432/business_platform?schema=public
NODE_ENV=development
PORT=3003
JWT_ACCESS_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-another-long-random-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_STORAGE_BUCKET=
MAX_UPLOAD_SIZE_MB=10
CORS_ALLOWED_ORIGINS=http://localhost:3000
SENTRY_DSN=
```

### `apps/api/.env.example`:
Backend-only configuration (same as above root variables).

### `apps/web/.env.example`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3003
NEXT_PUBLIC_ENV=development
```

**Rule:** Never use `NEXT_PUBLIC_*` for database, Prisma, or Firebase Admin credentials.

---

## I. Commands to Run Locally

### First-time setup:
```powershell
# Copy environment template to .env (user must do this manually)
Copy-Item .env.example .env
# Edit .env with real secrets/Firebase credentials before next steps

# Install dependencies
pnpm install

# Start PostgreSQL
docker compose up -d

# Generate Prisma Client
pnpm db:generate

# Apply initial migration
pnpm db:migrate -- --name init

# Start all services (web + API)
pnpm dev
```

### Repeat runs:
```powershell
# Pull latest dependencies
pnpm install

# Start database
docker compose up -d

# Start services
pnpm dev
```

### Validation commands:
```powershell
# Lint all packages
pnpm lint

# Type-check all packages
pnpm typecheck

# Build all packages (production)
pnpm build

# Run all tests
pnpm test

# Inspect database
pnpm db:studio

# Database state
docker compose ps
```

### Connect to running PostgreSQL:
```powershell
# From host (using psql or another client):
psql -h localhost -U postgres -d business_platform -W
# Password: (from .env POSTGRES_PASSWORD)

# Reset database (delete volume):
docker compose down -v
docker compose up -d
pnpm db:migrate -- --name init
```

---

## J. What Remains to Configure Manually

### Firebase:
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Cloud Storage
3. Create a service account key (JSON) with Storage admin permissions
4. Extract and set in `.env`:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` (raw JSON key content)
   - `FIREBASE_STORAGE_BUCKET` (e.g., `my-project.appspot.com`)

### PostgreSQL (local development):
- Use Docker Compose with `.env` credentials (included in template).
- For production: migrate to managed PostgreSQL (Supabase, RDS, or similar).

### Vercel (frontend deployment):
1. Connect `apps/web` to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com` (production API URL)
   - `NEXT_PUBLIC_ENV=production`
3. Configure rewrite to NestJS API if same domain, or CORS for separate domain

### Render/Railway (backend deployment):
1. Deploy `apps/api` as a containerized NestJS service
2. Use `infrastructure/docker/api.Dockerfile`
3. Provision a managed PostgreSQL database
4. Set backend environment variables (all from `.env`)
5. Update Vercel `NEXT_PUBLIC_API_BASE_URL` to point to deployed API

---

## K. Tests/Builds That Passed

✅ **TypeScript compilation:**
- `pnpm typecheck` — all 7 packages compile without errors
- API correctly resolves generated Prisma Client
- Web middleware and route components have correct types

✅ **Linting:**
- `pnpm lint` — all ESLint checks pass
- No Prisma or Firebase Admin imports in frontend

✅ **Production build:**
- `pnpm build` — NestJS builds to `dist/`, Next.js builds for static + server output
- Routes generated: `/`, `/admin/dashboard`, `/admin/login`, `/login`, `/portal/dashboard`, `/portal/documents`
- All pages are static pre-rendered

✅ **Test suite:**
- `pnpm test` — all projects run (currently echo "No tests configured", which is expected for foundation)

✅ **Prisma validation:**
- Schema valid with all business models
- Migrations directory ready for first `init` migration
- Client generation successful after moving to API package

✅ **Dependency audit:**
- No Prisma or Firebase imports found in `apps/web`
- No database credentials in frontend environment examples

---

## L. Problems & Decisions Requiring Approval

### ✅ Resolved:
1. **Multiple Next.js apps conflict:** Consolidated three separate apps into one unified `apps/web` with `/portal` and `/admin` route areas. Old apps preserved under `legacy/` for reference.
2. **Prisma at root:** Moved Prisma to `apps/api` to enforce backend-only access. Root scripts now delegate.
3. **Dependency boundary:** Confirmed no frontend imports of Prisma or Firebase Admin; all file/auth operations go through REST.
4. **Environment variables:** Created separate templates for root (all secrets), API (backend), and web (public only).

### ⚠️ Decisions made (awaiting your approval):

**1. One Next.js app vs. separate deployments:**
- ✅ Decision: One `apps/web` with `/portal` and `/admin` routes, deployed once to Vercel.
- Rationale: Simpler deployment, shared middleware, unified authentication flow.
- Alternative rejected: Multiple Next.js apps would require separate domains or subdomain routing, increasing complexity.

**2. Prisma migrations at `apps/api/prisma/migrations/`:**
- ✅ Decision: Keep here. Backend owns schema changes.
- Rationale: Only NestJS should trigger migrations; frontend never connects to database.
- Alternative rejected: Putting migrations at root would allow any package to trigger them.

**3. Firebase credentials in `.env` only (no Docker secrets yet):**
- ✅ Decision: Local development uses `.env` file; no Docker Compose secrets yet.
- Rationale: Simpler setup for local iteration. Production will use cloud provider secrets (Vercel env, Render env, etc.).
- Next step: Add Docker secrets for staging/production CI/CD later if needed.

**4. Signed URLs for file uploads (no proxy):**
- ✅ Decision: Backend issues signed URLs; frontend uploads directly to Firebase.
- Rationale: Reduces backend load, simplifies error handling, faster uploads for large files.
- Alternative rejected: Proxying through NestJS would consume network bandwidth and increase latency.

**5. Separate customer/admin authentication:**
- ✅ Decision: Different JWT audiences and endpoints (`/api/customer/auth/login` vs. `/api/admin/auth/login`).
- Rationale: Allows independent token lifespans, role-based access control, audit trails.
- Implementation: Guards (`CustomerAuthGuard`, `AdminAuthGuard`) enforce route-level access.

---

## Summary

| Aspect | Status |
|--------|--------|
| **Architecture** | ✅ One web app + one API, clear boundaries |
| **Types** | ✅ All packages compile cleanly |
| **Linting** | ✅ No violations |
| **Builds** | ✅ Production build succeeds |
| **Secrets** | ✅ No backend credentials in frontend |
| **Database** | ✅ Prisma schema valid, ownership backend-only |
| **Firebase** | ⏳ Credentials not yet configured (awaiting manual setup) |
| **Local dev** | ⏳ Requires `.env` copy + `docker compose up -d` + `pnpm db:migrate` |
| **Tests** | ✅ Suite runs (placeholder implementations ready for real tests) |

---

**Next phase:** Set up local `.env`, start PostgreSQL, run first migration, then begin integration and E2E testing or feature implementation as needed.
