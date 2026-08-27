# Amman Communications — Backend API List

Base URL: `http://localhost:3003`

---

## 1. Authentication APIs (`/v1/auth`)

| Method | Endpoint | Auth | Request Body / Parameters | Description |
|---|---|---|---|---|
| `POST` | `/v1/auth/login` | Public | `{ email, password }` | Authenticates customer or admin; returns JWT access token & user role |
| `POST` | `/v1/auth/register` | Public | `{ name, email, password }` | Registers a new customer account and creates session |

---

## 2. Admin Appointments APIs (`/v1/admin/appointments`)

| Method | Endpoint | Auth | Query / Body Parameters | Description |
|---|---|---|---|---|
| `GET` | `/v1/admin/appointments/stats` | Admin | *None* | Get counts for Today, Upcoming, Confirmed, Completed, Cancelled, Total |
| `GET` | `/v1/admin/appointments` | Admin | `search`, `status`, `mode`, `date`, `startDate`, `endDate`, `timeframe` | List appointments with filters and search |
| `GET` | `/v1/admin/appointments/:id` | Admin | `:id` (route param) | Get single appointment details with customer and service |
| `POST` | `/v1/admin/appointments` | Admin | `{ customerName, customerEmail, customerPhone, serviceId?, appointmentDate, durationMinutes?, mode, onlineType?, meetingLink?, status?, notes? }` | Book / create a new appointment |
| `PATCH` | `/v1/admin/appointments/:id` | Admin | `:id`, `{ customerName?, customerEmail?, customerPhone?, serviceId?, appointmentDate?, durationMinutes?, mode?, onlineType?, meetingLink?, status?, notes? }` | Update appointment details |
| `PATCH` | `/v1/admin/appointments/:id/reschedule` | Admin | `:id`, `{ newDate, reason?, mode?, onlineType?, meetingLink?, notes? }` | Reschedule appointment, records previous schedule and reason |
| `PATCH` | `/v1/admin/appointments/:id/status` | Admin | `:id`, `{ status: "PENDING" \| "CONFIRMED" \| "COMPLETED" \| "CANCELLED" \| "RESCHEDULED" }` | Quick status change |
| `DELETE` | `/v1/admin/appointments/:id` | Admin | `:id` (route param) | Delete an appointment record |

---

## 3. Admin Services APIs (`/v1/admin/services`)

| Method | Endpoint | Auth | Query / Body Parameters | Description |
|---|---|---|---|---|
| `GET` | `/v1/admin/services/stats` | Admin | *None* | Get services statistics (total, active, inactive, draft) |
| `GET` | `/v1/admin/services` | Admin | `search`, `status` (`DRAFT`, `ACTIVE`, `INACTIVE`) | List all services with filters |
| `GET` | `/v1/admin/services/:id` | Admin | `:id` (route param) | Get single service details |
| `POST` | `/v1/admin/services` | Admin | `{ name, description?, governmentFee, serviceFee, totalFee, estimatedTime?, status?, requiredDocuments? }` | Create a new service offering |
| `PATCH` | `/v1/admin/services/:id` | Admin | `:id`, `{ name?, description?, governmentFee?, serviceFee?, totalFee?, estimatedTime?, status?, requiredDocuments? }` | Update service details |
| `PATCH` | `/v1/admin/services/:id/status` | Admin | `:id`, `{ status: "DRAFT" \| "ACTIVE" \| "INACTIVE" }` | Update service status |
| `DELETE` | `/v1/admin/services/:id` | Admin | `:id` (route param) | Delete a service |

---

## 4. Dashboard APIs (`/admin/dashboard` & `/customer/dashboard`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/dashboard/summary` | Admin | System-wide counts (customers, applications, documents) |
| `GET` | `/customer/dashboard/summary` | Customer | Customer-specific counts (applications, documents) |

---

## 5. Customer Documents APIs (`/customer/documents`)

| Method | Endpoint | Auth | Request Body / Parameters | Description |
|---|---|---|---|---|
| `POST` | `/customer/documents/upload-url` | Customer | `{ applicationId, documentType, fileName, mimeType, fileSize }` | Request presigned upload URL for direct file upload |
| `POST` | `/customer/documents/complete` | Customer | `{ applicationId, documentType, storagePath, fileName, mimeType, fileSize }` | Finalize and save uploaded document metadata in DB |
| `GET` | `/customer/documents/:id/download` | Customer | `:id` (route param) | Request presigned download URL for document |

---

## 6. System Health API (`/health`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Health check verifying server and PostgreSQL connectivity |
