# Complete Backend API Documentation

| API Endpoint | Feature |
|---|---|
| `GET /api/v1/admin/applications` | Get Applications |
| `PUT /api/v1/admin/applications/:id/status` | Update Status |
| `GET /api/v1/admin/applications/:applicationId/documents` | Get Application Documents |
| `GET /api/v1/admin/applications/:applicationId/documents/:documentId` | Get Document |
| `PUT /api/v1/admin/applications/:applicationId/documents/:documentId/status` | Update Document Status |
| `GET /api/v1/admin/applications/:applicationId/documents/:documentId/stream` | Stream Document By Id |
| `GET /api/v1/admin/appointments` | Find All |
| `POST /api/v1/admin/appointments` | Create |
| `GET /api/v1/admin/appointments/:id` | Find One |
| `PATCH /api/v1/admin/appointments/:id` | Update |
| `DELETE /api/v1/admin/appointments/:id` | Remove |
| `PATCH /api/v1/admin/appointments/:id/reschedule` | Reschedule |
| `PATCH /api/v1/admin/appointments/:id/status` | Update Status |
| `GET /api/v1/admin/appointments/stats` | Get Stats |
| `POST /api/v1/auth/login` | Login |
| `POST /api/v1/auth/register` | Register |
| `GET /api/v1/admin/settings/business-profile` | Get Profile |
| `PATCH /api/v1/admin/settings/business-profile` | Update Profile |
| `DELETE /api/v1/admin/settings/business-profile/logo` | Delete Logo |
| `GET /api/v1/customer/applications` | List Applications |
| `POST /api/v1/customer/applications` | Create Application |
| `GET /api/v1/customer/applications/:applicationId` | Get Application |
| `PUT /api/v1/customer/applications/:applicationId` | Update Application |
| `POST /api/v1/customer/appointments` | Create Appointment |
| `GET /api/v1/customer/appointments` | Get Appointments |
| `GET /api/v1/customer/appointments/:id` | Get Appointment Detail |
| `DELETE /api/v1/customer/appointments/:id` | Cancel Appointment |
| `POST /api/v1/customer/appointments/:id/documents` | Complete Document Upload |
| `POST /api/v1/customer/appointments/:id/documents/upload-url` | Create Document Upload Url |
| `GET /api/v1/customer/offices` | Get Offices |
| `GET /api/v1/customer/services` | Get Services |
| `GET /api/v1/customer/applications/:applicationId/documents` | Get Application Documents |
| `POST /api/v1/customer/applications/:applicationId/documents` | Upload Or Replace Document |
| `GET /api/v1/customer/applications/:applicationId/documents/:documentId` | Get Document |
| `PUT /api/v1/customer/applications/:applicationId/documents/:documentId` | Replace Document |
| `DELETE /api/v1/customer/applications/:applicationId/documents/:documentId` | Delete Document |
| `POST /api/v1/customer/applications/:applicationId/documents/upload` | Direct Upload |
| `POST /api/v1/customer/applications/:applicationId/documents/upload-url` | Request Upload Url |
| `GET /api/v1/customer/documents` | Get All Documents Grouped |
| `GET /api/v1/customer/documents/download-stream` | Download Stream |
| `GET /api/v1/customer/services-catalog` | Get Services Catalog |
| `GET /api/v1/customer/me` | Get Profile |
| `GET /api/v1/customer` | Get Profile |
| `GET /api/v1/customer/contact-info` | Get Contact Info |
| `PATCH /api/v1/customer/contact-info` | Update Contact Info |
| `PATCH /api/v1/customer/password` | Change Password |
| `GET /api/v1/customer/preferences` | Get Preferences |
| `PATCH /api/v1/customer/preferences` | Update Preferences |
| `PATCH /api/v1/customer/profile` | Update Profile |
| `GET /api/v1/admin/customers` | Find All |
| `POST /api/v1/admin/customers` | Create |
| `GET /api/v1/admin/customers/:id` | Find One |
| `PATCH /api/v1/admin/customers/:id` | Update |
| `DELETE /api/v1/admin/customers/:id` | Delete |
| `PATCH /api/v1/admin/customers/:id/status` | Update Status |
| `GET /api/v1/admin/customers/stats` | Get Stats |
| `GET /api/v1/admin/dashboard/me` | Me |
| `GET /api/v1/admin/dashboard/profile` | Profile |
| `GET /api/v1/admin/dashboard/summary` | Summary |
| `GET /api/v1/admin/dashboard/verification-queue` | Verification Queue |
| `POST /api/v1/admin/expenses` | Create |
| `GET /api/v1/admin/expenses` | Find All |
| `GET /api/v1/admin/expenses/:id` | Find One |
| `PATCH /api/v1/admin/expenses/:id` | Update |
| `DELETE /api/v1/admin/expenses/:id` | Remove |
| `GET /api/v1/admin/expenses/stats` | Get Stats |
| `GET /api/v1/admin/finance/invoices` | Find All Invoices |
| `POST /api/v1/admin/finance/invoices` | Create Invoice |
| `GET /api/v1/admin/finance/invoices/:id` | Find One Invoice |
| `PATCH /api/v1/admin/finance/invoices/:id` | Update Invoice |
| `POST /api/v1/admin/finance/invoices/:id/payments` | Record Payment |
| `PATCH /api/v1/admin/finance/invoices/:id/status` | Update Invoice Status |
| `GET /api/v1/admin/finance/payments` | Find All Payments |
| `GET /api/v1/admin/finance/payments/:id` | Find One Payment |
| `GET /api/v1/admin/finance/summary` | Get Summary |
| `GET /api/v1/health` | Check |
| `GET /api/v1/admin/services` | Find All |
| `POST /api/v1/admin/services` | Create |
| `GET /api/v1/admin/services/:id` | Find One |
| `PATCH /api/v1/admin/services/:id` | Update |
| `DELETE /api/v1/admin/services/:id` | Remove |
| `PATCH /api/v1/admin/services/:id/status` | Update Status |
| `GET /api/v1/admin/services/stats` | Get Stats |
