# Implementation Notes — Exploration Phase

**Date:** 2026-08-25  
**Component:** Backend Document & Application Management System  

---

## 1. System Overview & Technology Stack

- **Backend Framework:** NestJS (v11) with TypeScript, Express platform (`@nestjs/platform-express`), class-validator, class-transformer, `@nestjs/jwt`, `@nestjs/config`.
- **Database & ORM:** PostgreSQL accessed via Prisma ORM (`@prisma/client` & `prisma` CLI 6.19.3). Schema located at `apps/api/prisma/schema.prisma`.
- **Monorepo Manager:** Turborepo with `pnpm` workspaces (`apps/api`, `apps/web`, `packages/*`).

---

## 2. Authentication & Authorization Architecture

- **Mechanism:** JWT token-based authentication with role verification in token claims (`aud: 'customer' | 'admin'`, `sub: userId`).
- **Guards:**
  - `CustomerAuthGuard`: Verifies Bearer token with `audience: 'customer'`, attaches decoded JWT payload to `request.user` (`req.user.sub` = `customerId`).
  - `AdminAuthGuard`: Verifies Bearer token with `audience: 'admin'`, attaches decoded JWT payload to `request.user` (`req.user.sub` = `adminId`).
- **Endpoints:**
  - `POST /customer/auth/login`
  - `POST /admin/auth/login`

---

## 3. Existing Models & Schema

Current Prisma schema (`apps/api/prisma/schema.prisma`):
- `Customer`: `id`, `email`, `passwordHash`, `name`, `applications`, `documents`, `createdAt`, `updatedAt`.
- `Admin`: `id`, `email`, `passwordHash`, `name`, `createdAt`, `updatedAt`.
- `Application`: `id`, `customerId`, `customer`, `documents`, `createdAt`, `updatedAt`.
- `Document`:
  - `id`: CUID
  - `customerId`: String (relation to `Customer`)
  - `applicationId`: String (relation to `Application`)
  - `documentType`: String
  - `storagePath`: String
  - `fileName`: String
  - `mimeType`: String
  - `fileSize`: Int
  - `verificationStatus`: `DocumentVerificationStatus` (`PENDING`, `VERIFIED`, `REJECTED`)
  - `verificationRemarks`: String?
  - `uploadedAt`: DateTime

### Identified Schema Gaps to Align with Master Specification:
1. **Uniqueness constraint:** Add `@@unique([applicationId, documentType])` to guarantee Single Source of Truth at database level (one active document record per application and type).
2. **Field additions:** Add `applicationNumber`, `status` (or mapping with `verificationStatus`), `version`, `originalFileName`, `verifiedAt`, `verifiedBy`, `rejectionReason`, `updatedAt` to `Document` and `Application` models.
3. **Status Enum:** Enhance/map `DocumentStatus` (`UPLOADED`, `UNDER_REVIEW`, `VERIFIED`, `REJECTED`, `ACTION_REQUIRED`).

---

## 4. Existing Storage Implementation

- **Provider:** `StorageService` (`apps/api/src/storage/storage.service.ts`) using `firebase-admin/storage`.
- **Methods:**
  - `createUploadUrl(path, contentType)`: Generates v4 signed URL for direct client upload (15 min expiry).
  - `createDownloadUrl(path)`: Generates v4 signed URL for document retrieval (15 min expiry).
- **Storage Path Pattern:** `documents/${customerId}/${applicationId}/${documentType}_${Date.now()}_${safeName}`.
- **Enhancement needed:** Local/fallback storage provider adapter so unit/integration tests and local environments run seamlessly without live Firebase credentials while maintaining full production cloud compatibility.

---

## 5. Existing Routes & Controllers

- `DocumentsController` (`apps/api/src/documents/documents.controller.ts`):
  - `POST /customer/documents/upload-url`
  - `POST /customer/documents/complete`
  - `GET /customer/documents/:id/download`
- **Application Endpoints:** Currently missing full Application CRUD and nested document endpoints.
- **Admin Endpoints:** Currently missing Admin document review/status update endpoints.
- **Routing Standard:** Need `/api/v1` global prefix or standard routing layout per Section 3 (`/api/v1/{role}/{resource}`).

---

## 6. Response Formatting, Validation & Error Handling

- **Validation:** Global `ValidationPipe` enabled with `transform: true, whitelist: true`.
- **Response Format:** Currently raw JSON returns from controllers. Needs standard envelope `{ success: true, message: string, data: any }` and error filter `{ success: false, message: string, error: { code: string } }`.

---

## 7. Testing Infrastructure

- **Current state:** `"test": "echo No tests configured"` in `apps/api/package.json`.
- **Requirement:** Install/configure Jest / Supertest to implement and run all 5 required synchronization and security tests.
