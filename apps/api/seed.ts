import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash('password123', 10);

  // 1. Create a customer
  await prisma.customer.upsert({
    where: { email: 'customer@test.com' },
    update: { passwordHash },
    create: {
      email: 'customer@test.com',
      passwordHash,
      name: 'Test Customer',
    },
  });
  console.log('Test customer created: customer@test.com / password123');

  // 2. Create an admin
  await prisma.admin.upsert({
    where: { email: 'admin@test.com' },
    update: { passwordHash },
    create: {
      email: 'admin@test.com',
      passwordHash,
      name: 'Test Admin',
    },
  });
  console.log('Test admin created: admin@test.com / password123');

  // 3. Create a duplicate identity for testing the rejection
  await prisma.customer.upsert({
    where: { email: 'duplicate@test.com' },
    update: { passwordHash },
    create: {
      email: 'duplicate@test.com',
      passwordHash,
      name: 'Duplicate Customer',
    },
  });
  await prisma.admin.upsert({
    where: { email: 'duplicate@test.com' },
    update: { passwordHash },
    create: {
      email: 'duplicate@test.com',
      passwordHash,
      name: 'Duplicate Admin',
    },
  });
  console.log('Test duplicate identity created: duplicate@test.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
