import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkConnection() {
  try {
    const result = await prisma.$queryRaw<Array<{ current_database: string; current_user: string }>>`
      SELECT current_database(), current_user;
    `;
    console.log('--- DB CONNECTION TEST RESULT ---');
    console.log('CONNECTED: TRUE');
    console.log('DATABASE NAME:', result[0].current_database);
    console.log('CONNECTED USER:', result[0].current_user);
    console.log('---------------------------------');
  } catch (err) {
    console.error('--- DB CONNECTION ERROR ---');
    console.error((err as Error).message);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnection();
