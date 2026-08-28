# Amman Communications API — Endpoints Reference (Table View)

Comprehensive reference and specification of all REST API endpoints for the **Amman Communications Platform**.

- **Base URL**: `http://localhost:3003` (or `http://127.0.0.1:3003`)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` *(for protected routes)*

---

## 🚀 1. Master Endpoints Table (Quick Summary)

| # | HTTP Method | Endpoint | Access Level | Description | Success Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **1** | `POST` | `/v1/auth/login` | 🌐 Public | Authenticate user & issue JWT | `200 / 201` |
| **2** | `POST` | `/v1/auth/register` | 🌐 Public | Register new customer (`+91` phone required) | `201 Created` |
| **3** | `GET` | `/v1/admin/services/stats` | 🔒 Admin | Service catalog summary counts | `200 OK` |
| **4** | `GET` | `/v1/admin/services` | 🔒 Admin | List & filter service offerings | `200 OK` |
| **5** | `GET` | `/v1/admin/services/:id` | 🔒 Admin | Get single service & document checklist | `200 OK` |
| **6** | `POST` | `/v1/admin/services` | 🔒 Admin | Create new service & fee configuration | `201 Created` |
| **7** | `PATCH` | `/v1/admin/services/:id` | 🔒 Admin | Update service details & document checklist | `200 OK` |
| **8** | `PATCH` | `/v1/admin/services/:id/status` | 🔒 Admin | Toggle status (`DRAFT` / `ACTIVE` / `INACTIVE`) | `200 OK` |
| **9** | `DELETE` | `/v1/admin/services/:id` | 🔒 Admin | Delete service catalog entry | `200 OK` |
| **10** | `GET` | `/v1/admin/customers/stats` | 🔒 Admin | Customer directory summary statistics | `200 OK` |
| **11** | `GET` | `/v1/admin/customers` | 🔒 Admin | Paginated customer directory with search | `200 OK` |
| **12** | `GET` | `/v1/admin/customers/:id` | 🔒 Admin | Customer profile with apps & docs activity | `200 OK` |
| **13** | `POST` | `/v1/admin/customers` | 🔒 Admin | Admin create customer account | `201 Created` |
| **14** | `PATCH` | `/v1/admin/customers/:id` | 🔒 Admin | Update customer profile (`name`, `email`, `phone`) | `200 OK` |
| **15** | `PATCH` | `/v1/admin/customers/:id/status` | 🔒 Admin | Toggle customer status (`ACTIVE` / `INACTIVE`) | `200 OK` |
| **16** | `DELETE` | `/v1/admin/customers/:id` | 🔒 Admin | Delete customer record | `200 OK` |
| **17** | `POST` | `/customer/documents/upload-url` | 👤 Customer | Request presigned document upload URL | `201 Created` |
| **18** | `POST` | `/customer/documents/complete` | 👤 Customer | Complete document submission | `201 Created` |
| **19** | `GET` | `/customer/documents/:id/download` | 👤 Customer | Download customer document | `200 OK` |
| **20** | `GET` | `/admin/dashboard/summary` | 🔒 Admin | Admin dashboard overview counts | `200 OK` |
| **21** | `GET` | `/customer/dashboard/summary` | 👤 Customer | Customer portal dashboard counts | `200 OK` |
| **22** | `GET` | `/health` | 🌐 Public | Backend health check status | `200 OK` |

---

## 🛠️ 2. Service Management Endpoints (`/v1/admin/services`)

| HTTP Method | Endpoint | Query / Path Params | Request Body Fields | Description | Response Codes |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `GET` | `/v1/admin/services/stats` | None | None | Returns total count, active count, inactive count, and draft count. | `200`, `401`, `403` |
| `GET` | `/v1/admin/services` | `search` *(str)*<br>`status` *(enum)* | None | Retrieves matching services with calculated total fee and required document checklist. | `200`, `401`, `403` |
| `GET` | `/v1/admin/services/:id` | `id` *(Path)* | None | Retrieves a single service by ID with required document checklist. | `200`, `404`, `401` |
| `POST` | `/v1/admin/services` | None | `name` *(str, req)*<br>`description` *(str)*<br>`governmentFee` *(num, req)*<br>`serviceFee` *(num, req)*<br>`estimatedTime` *(str)*<br>`status` *(enum)*<br>`requiredDocuments` *(arr)* | Creates a new service offering. `totalFee` is computed as `govFee + serviceFee`. | `201`, `400`, `401` |
| `PATCH` | `/v1/admin/services/:id` | `id` *(Path)* | `name` *(str)*<br>`description` *(str)*<br>`governmentFee` *(num)*<br>`serviceFee` *(num)*<br>`estimatedTime` *(str)*<br>`status` *(enum)*<br>`requiredDocuments` *(arr)* | Updates existing service fields and synchronizes required document checklist. | `200`, `400`, `404` |
| `PATCH` | `/v1/admin/services/:id/status` | `id` *(Path)* | `status` *(`DRAFT` \| `ACTIVE` \| `INACTIVE`, req)* | Toggles active/inactive/draft status of the service. | `200`, `400`, `404` |
| `DELETE` | `/v1/admin/services/:id` | `id` *(Path)* | None | Removes a service from the catalog (safely rejects if active applications exist). | `200`, `400`, `404` |

### Service Request / Response Schemas

#### `POST /v1/admin/services` (Request Payload)
```json
{
  "name": "Commercial Fiber Broadband",
  "description": "Dedicated fiber optic connection for enterprises.",
  "governmentFee": 250,
  "serviceFee": 750,
  "estimatedTime": "3-5 Business Days",
  "status": "ACTIVE",
  "requiredDocuments": [
    { "name": "Commercial Registration Certificate", "displayOrder": 1, "isRequired": true },
    { "name": "Authorized Signatory National ID", "displayOrder": 2, "isRequired": true }
  ]
}
```

#### `GET /v1/admin/services/:id` (Response Payload)
```json
{
  "id": "cmtb098f0001i8...",
  "name": "Commercial Fiber Broadband",
  "description": "Dedicated fiber optic connection for enterprises.",
  "governmentFee": "250.00",
  "serviceFee": "750.00",
  "totalFee": "1000.00",
  "estimatedTime": "3-5 Business Days",
  "status": "ACTIVE",
  "requiredDocuments": [
    { "id": "cmtb098f0002i8...", "name": "Commercial Registration Certificate", "displayOrder": 1, "isRequired": true }
  ],
  "_count": { "applications": 3 },
  "createdAt": "2026-08-25T15:11:43.000Z",
  "updatedAt": "2026-08-27T04:29:59.000Z"
}
```

---

## 👥 3. Customer Directory Endpoints (`/v1/admin/customers`)

| HTTP Method | Endpoint | Query / Path Params | Request Body Fields | Description | Response Codes |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `GET` | `/v1/admin/customers/stats` | None | None | Returns total customers, active accounts, inactive accounts, and applicant counts. | `200`, `401`, `403` |
| `GET` | `/v1/admin/customers` | `page` *(num)*<br>`limit` *(num)*<br>`search` *(str)*<br>`status` *(enum)* | None | Returns paginated list of customers searching across `name`, `email`, and `phone`. | `200`, `401`, `403` |
| `GET` | `/v1/admin/customers/:id` | `id` *(Path)* | None | Returns customer profile with 5 recent applications and documents. | `200`, `404`, `401` |
| `POST` | `/v1/admin/customers` | None | `name` *(str, req)*<br>`email` *(str, req)*<br>`phone` *(str, opt)*<br>`password` *(str, req)*<br>`status` *(enum)* | Creates a customer account directly from the admin workspace. | `201`, `400`, `401` |
| `PATCH` | `/v1/admin/customers/:id` | `id` *(Path)* | `name` *(str)*<br>`email` *(str)*<br>`phone` *(str)*<br>`status` *(enum)* | Updates customer name, email address, phone number, or status. | `200`, `400`, `404` |
| `PATCH` | `/v1/admin/customers/:id/status` | `id` *(Path)* | `status` *(`ACTIVE` \| `INACTIVE`, req)* | Activates or deactivates customer account access. | `200`, `400`, `404` |
| `DELETE` | `/v1/admin/customers/:id` | `id` *(Path)* | None | Deletes customer if no active documents/applications exist. | `200`, `400`, `404` |

### Customer Paginated Response Format (`GET /v1/admin/customers`)
```json
{
  "items": [
    {
      "id": "cmtb1qefq0000i8aw264opi95",
      "name": "Priya Sharma",
      "email": "priya.sharma@example.com",
      "phone": "+91 9876543210",
      "status": "ACTIVE",
      "createdAt": "2026-08-27T04:52:17.174Z",
      "updatedAt": "2026-08-27T04:52:17.174Z",
      "_count": {
        "applications": 0,
        "documents": 0
      }
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

## 🔐 4. Authentication Endpoints (`/v1/auth`)

| HTTP Method | Endpoint | Access Level | Request Body Fields | Description | Response Codes |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `POST` | `/v1/auth/login` | 🌐 Public | `email` *(str, req)*<br>`password` *(str, req, min 8)* | Verifies Admin/Customer credentials and returns a signed 15m JWT access token. | `200 / 201`<br>`401` *(Incorrect email or password)* |
| `POST` | `/v1/auth/register` | 🌐 Public | `name` *(str, req, min 2)*<br>`email` *(str, req, valid email)*<br>`phone` *(str, req, min 10 digits)*<br>`password` *(str, req, min 8)* | Registers a customer account with mandatory `+91` phone number and signs them in. | `201 Created`<br>`400` *(Validation error)*<br>`401` *(Email exists)* |

### Registration Request Payload (`POST /v1/auth/register`)
```json
{
  "name": "Priya Sharma",
  "email": "priya.sharma@example.com",
  "phone": "+91 9876543210",
  "password": "password123"
}
```

---

## 📁 5. Customer Documents & Dashboard Endpoints

| HTTP Method | Endpoint | Access Level | Query / Body Params | Description | Response Codes |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `POST` | `/customer/documents/upload-url` | 👤 Customer | Body: `applicationId`, `documentType`, `fileName`, `mimeType`, `fileSize` | Generates a presigned storage upload URL for documents. | `201`, `401`, `403` |
| `POST` | `/customer/documents/complete` | 👤 Customer | Body: `applicationId`, `documentType`, `storagePath`, `fileName`, `mimeType`, `fileSize` | Records completed document verification metadata. | `201`, `401`, `404` |
| `GET` | `/customer/documents/:id/download` | 👤 Customer | Path: `id` | Retrieves authenticated download URL for customer document. | `200`, `401`, `404` |
| `GET` | `/admin/dashboard/summary` | 🔒 Admin | None | Returns total count of customers, applications, and documents. | `200`, `401`, `403` |
| `GET` | `/customer/dashboard/summary` | 👤 Customer | None | Returns count of applications and documents belonging to authenticated customer. | `200`, `401` |
| `GET` | `/health` | 🌐 Public | None | System liveness probe returning `{ "status": "ok" }`. | `200 OK` |

---

## 📊 6. HTTP Status Code & Error Summary Table

| Status Code | Meaning | When it is Triggered | Example Error Message |
| :---: | :--- | :--- | :--- |
| **`200 OK`** | Request Successful | Successful query, status update, or deletion | `{ "success": true }` |
| **`201 Created`** | Entity Created | Successful creation of service, customer, or session | `{ "id": "...", "name": "..." }` |
| **`400 Bad Request`** | Validation Error | Missing required fields, invalid phone, negative fees | `{"message": ["phone should not be empty"]}` |
| **`401 Unauthorized`** | Authentication Failure | Wrong password, unauthenticated request, expired token | `{"message": "Incorrect email or password"}` |
| **`403 Forbidden`** | Permission Denied | Customer attempting to access `/v1/admin/*` routes | `{"message": "Forbidden resource"}` |
| **`404 Not Found`** | Resource Missing | Non-existent Service ID or Customer ID | `{"message": "Service not found"}` |
| **`500 Internal Error`** | Server Exception | Uncaught database or backend exception | `{"message": "Internal server error"}` |
