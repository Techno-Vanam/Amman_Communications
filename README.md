# Amman Communications Platform

Foundation for a documentation and office-management system using one Next.js application, one NestJS API, PostgreSQL through Prisma, and Firebase Storage for persistent user files.

## Architecture

```text
Next.js (apps/web)
   /portal/* customer area
   /admin/* admin area
               |
               v
NestJS (apps/api)
   Prisma -> PostgreSQL
   Firebase Admin -> Firebase Storage
```

`apps/web` is the only frontend application. Customer and admin areas have separate route layouts and middleware. `apps/api` is the only application allowed to access PostgreSQL, Prisma, or Firebase Admin credentials.

## Repository layout

- `apps/web`: public pages plus `/portal` and `/admin` route areas.
- `apps/api`: centralized NestJS modular API, Prisma schema, and migrations.
- `packages/*`: shared configuration and contracts.

## Local development

Prerequisites: Node.js 24+, pnpm 11+, and Docker.

```powershell
Copy-Item .env.example .env   //Copy the .env.example file content and create .env file and passte it 
pnpm install
docker compose up -d
pnpm db:generate
pnpm db:migrate -- --name init
pnpm dev
```

The web app runs at `http://localhost:3000`; the API runs at `http://localhost:3003`. Configure Firebase server credentials only in the API environment. Never use `NEXT_PUBLIC_*` for database or Firebase Admin secrets.

Run repository checks with:

```powershell
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

## Document foundation

The API provides customer/admin authentication boundaries and document endpoints for issuing signed upload URLs, recording metadata after upload, and issuing signed download URLs. PostgreSQL stores document metadata; file bytes remain in Firebase Storage under customer/application-scoped paths.
