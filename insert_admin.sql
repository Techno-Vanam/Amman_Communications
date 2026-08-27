INSERT INTO "Admin" (id, email, "passwordHash", name, "updatedAt") 
VALUES ('test-admin-id-123', 'admin@example.com', '$2a$10$XoM.z20jKx0R7vPzM8Z.J.j6/yVlCjR8G8Xh1R1Kq7uYhZ5W7Fh8.', 'Test Admin', NOW()) 
ON CONFLICT (email) DO NOTHING;
