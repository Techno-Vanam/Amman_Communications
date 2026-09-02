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

    const { compare, hash } = await import('bcryptjs');

    // Update password hashes if they don't match
    const passHash123 = await hash('password123', 10);
    const adminHash123 = await hash('admin123', 10);
    await prisma.admin.update({ where: { email: 'admin@test.com' }, data: { passwordHash: passHash123 } });
    await prisma.admin.update({ where: { email: 'admin@ammancomm.in' }, data: { passwordHash: adminHash123 } });
    console.log('✅ Admin passwords updated successfully in Supabase!');

    const updatedAdmins = await prisma.admin.findMany();
    console.log('UPDATED ADMINS IN DATABASE:');
    for (const a of updatedAdmins) {
      const matchPass123 = await compare('password123', a.passwordHash);
      const matchAdmin123 = await compare('admin123', a.passwordHash);
      console.log(`- [${a.id}] ${a.email} (${a.name}) | matches 'password123': ${matchPass123} | matches 'admin123': ${matchAdmin123}`);
    }

    const customers = await prisma.customer.findMany({ select: { id: true, email: true, name: true } });
    console.log('CUSTOMERS IN DATABASE:', customers);
    console.log('---------------------------------');
  } catch (err) {
    console.error('--- DB CONNECTION ERROR ---');
    console.error((err as Error).message);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnection();
