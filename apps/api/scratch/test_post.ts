import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = 'dev-only-7c9f3a1d8e2b4f6a0c5d9e7b3a1f8c6d4e2b0a9f7c5d3e1b8a6f4c2d0e9b7a5';

async function testPost() {
  const admin = await prisma.admin.findFirst();
  if (!admin) {
    console.log("No admin found!");
    return;
  }

  const token = jwt.sign({ sub: admin.id, role: 'ADMIN' }, JWT_SECRET, { expiresIn: '1h' });
  
  const payload = {
    title: "Stationary",
    description: "sample",
    category: "PROPERTY",
    amount: 100,
    expenseDate: new Date("2026-08-25").toISOString(), // Converts to proper ISO format
    paymentMethod: "CASH",
    notes: "ubendiran expense"
  };

  const res = await fetch('http://localhost:3000/api/admin/expenses', {
    method: 'POST',
    headers: {
      Cookie: `access_token=${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Body:", text);
}

testPost().catch(console.error);
