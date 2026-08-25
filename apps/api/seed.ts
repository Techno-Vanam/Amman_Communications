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

  // 4. Seed default services
  const defaultServices = [
    {
      name: 'Commercial Fiber Broadband',
      description: 'High-speed dedicated fiber optic connectivity for corporate & business premises.',
      governmentFee: 250,
      serviceFee: 750,
      totalFee: 1000,
      estimatedTime: '3-5 Business Days',
      status: 'ACTIVE' as const,
      documents: [
        { name: 'Commercial Registration Certificate', displayOrder: 1, isRequired: true },
        { name: 'Authorized Signatory National ID', displayOrder: 2, isRequired: true },
        { name: 'Lease Agreement / Proof of Address', displayOrder: 3, isRequired: true },
      ],
    },
    {
      name: 'Residential Broadband Setup',
      description: 'High-speed home internet connection with included Wi-Fi router setup.',
      governmentFee: 100,
      serviceFee: 300,
      totalFee: 400,
      estimatedTime: '1-2 Business Days',
      status: 'ACTIVE' as const,
      documents: [
        { name: 'National Identification / Passport', displayOrder: 1, isRequired: true },
        { name: 'Utility Bill (Electricity/Water)', displayOrder: 2, isRequired: true },
      ],
    },
    {
      name: 'Enterprise Leased Line (10Gbps)',
      description: 'Ultra-low latency symmetrical dedicated leased line for data centers.',
      governmentFee: 1200,
      serviceFee: 3800,
      totalFee: 5000,
      estimatedTime: '7-10 Business Days',
      status: 'DRAFT' as const,
      documents: [
        { name: 'Company Trade License', displayOrder: 1, isRequired: true },
        { name: 'Network Topology Diagram', displayOrder: 2, isRequired: true },
        { name: 'Tax Identification Document', displayOrder: 3, isRequired: true },
      ],
    },
    {
      name: 'Legacy Copper Landline',
      description: 'Analog copper voice line connection. (Phased out for new applications).',
      governmentFee: 50,
      serviceFee: 150,
      totalFee: 200,
      estimatedTime: '5 Business Days',
      status: 'INACTIVE' as const,
      documents: [
        { name: 'Subscriber ID Copy', displayOrder: 1, isRequired: true },
      ],
    },
  ];

  for (const s of defaultServices) {
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.service.create({
        data: {
          name: s.name,
          description: s.description,
          governmentFee: s.governmentFee,
          serviceFee: s.serviceFee,
          totalFee: s.totalFee,
          estimatedTime: s.estimatedTime,
          status: s.status,
          requiredDocuments: {
            create: s.documents,
          },
        },
      });
    }
  }
  console.log('Default services seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
