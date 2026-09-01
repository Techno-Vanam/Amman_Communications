-- 1. Insert Default Admins (password: password123 and admin123)
INSERT INTO "Admin" ("id", "email", "passwordHash", "name", "createdAt", "updatedAt")
VALUES 
  ('admin-1', 'admin@test.com', '$2b$10$oRZ4G5A25eSD6r2LeYXabe69VK3zugxnHFx0TJuqCk/3ylUnXoJja', 'Test Admin', NOW(), NOW()),
  ('admin-2', 'admin@ammancomm.in', '$2b$10$ddsdmrkLfdMEAKbrlmJo9.nFlAF5WNHFqfnmsb2xvChmB7Laiq6qW', 'Amman Admin', NOW(), NOW())
ON CONFLICT ("email") DO UPDATE SET "passwordHash" = EXCLUDED."passwordHash", "name" = EXCLUDED."name";

-- 2. Insert Business Profile
INSERT INTO "BusinessProfile" ("id", "businessName", "registrationNumber", "officeAddress", "primaryPhone", "supportEmail", "createdAt", "updatedAt")
VALUES 
  ('bp-1', 'Amman Communications', 'COMM-TN-2026-9921', '124, Anna Salai, Mount Road, Chennai, Tamil Nadu - 600002', '+91 44 2852 9000', 'support@ammancomm.in', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- 3. Insert Services
INSERT INTO "Service" ("id", "name", "description", "governmentFee", "serviceFee", "totalFee", "estimatedTime", "status", "createdAt", "updatedAt")
VALUES 
  ('srv-0001-fiber-business', 'Commercial High-Speed Fiber Broadband', 'Dedicated enterprise fiber optic connection with 99.9% SLA, static IP support, and 24/7 technical assistance.', 250.00, 750.00, 1000.00, '2-3 Business Days', 'ACTIVE', NOW(), NOW()),
  ('srv-0002-residential-bb', 'Residential FTTH Broadband Setup', 'Ultra-fast home fiber broadband with complimentary dual-band Wi-Fi 6 router and quick installation.', 100.00, 300.00, 400.00, '24-48 Hours', 'ACTIVE', NOW(), NOW()),
  ('srv-0003-doc-verify', 'Document Clearance & Legal Verification', 'Comprehensive verification and attestation for documentation, NOC certifications, and municipal clearances.', 75.00, 125.00, 200.00, '1-2 Business Days', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "totalFee" = EXCLUDED."totalFee", "status" = EXCLUDED."status";

-- 4. Insert Required Documents
INSERT INTO "RequiredDocument" ("id", "serviceId", "name", "displayOrder", "isRequired", "createdAt", "updatedAt")
VALUES
  ('req-1', 'srv-0001-fiber-business', 'Commercial Registration Certificate', 1, true, NOW(), NOW()),
  ('req-2', 'srv-0001-fiber-business', 'Authorized Signatory National ID', 2, true, NOW(), NOW()),
  ('req-3', 'srv-0001-fiber-business', 'Lease Agreement / Proof of Address', 3, true, NOW(), NOW()),
  ('req-4', 'srv-0002-residential-bb', 'National Identification / Passport', 1, true, NOW(), NOW()),
  ('req-5', 'srv-0002-residential-bb', 'Utility Bill (Electricity/Water)', 2, true, NOW(), NOW()),
  ('req-6', 'srv-0003-doc-verify', 'Identity Proof', 1, true, NOW(), NOW()),
  ('req-7', 'srv-0003-doc-verify', 'Document Copy for Verification', 2, true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- 5. Insert Offices
INSERT INTO "Office" ("id", "name", "address", "isActive")
VALUES 
  ('office-1', 'Chennai Head Office', '124, Anna Salai, Chennai', true),
  ('office-2', 'Anna Nagar Hub', '4th Avenue, Anna Nagar, Chennai', true)
ON CONFLICT ("id") DO NOTHING;
