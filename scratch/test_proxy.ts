import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = 'dev-only-7c9f3a1d8e2b4f6a0c5d9e7b3a1f8c6d4e2b0a9f7c5d3e1b8a6f4c2d0e9b7a5';
const NEXTJS_API = 'http://localhost:3000/api';

async function testProxy() {
  const admin = await prisma.admin.findFirst();
  if (!admin) {
    console.log("No admin found in DB!");
    return;
  }
  
  const token = jwt.sign(
    { sub: admin.id, role: 'ADMIN' },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  console.log("Generated token for admin:", admin.email);
  
  // Test hitting the Next.js Route Handler Proxy directly with a cookie
  const res = await fetch(`${NEXTJS_API}/admin/expenses/stats`, {
    headers: {
      Cookie: `access_token=${token}`
    }
  });
  
  console.log("Proxy response status:", res.status);
  const text = await res.text();
  console.log("Proxy response body:", text);
}

testProxy().catch(console.error);
