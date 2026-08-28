import { PrismaClient, ServiceStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash('password123', 10);
  const adminPasswordHash = await hash('admin123', 10);

  // 1. Create Default Admin accounts
  await prisma.admin.upsert({
    where: { email: 'admin@test.com' },
    update: { passwordHash, name: 'Test Admin' },
    create: {
      email: 'admin@test.com',
      passwordHash,
      name: 'Test Admin',
    },
  });

  await prisma.admin.upsert({
    where: { email: 'admin@ammancomm.in' },
    update: { passwordHash: adminPasswordHash, name: 'Amman Admin' },
    create: {
      email: 'admin@ammancomm.in',
      passwordHash: adminPasswordHash,
      name: 'Amman Admin',
    },
  });
  console.log('✅ Admin accounts initialized: admin@test.com (password123), admin@ammancomm.in (admin123)');

  // 2. Create Business Profile
  const existingProfile = await prisma.businessProfile.findFirst();
  if (!existingProfile) {
    await prisma.businessProfile.create({
      data: {
        businessName: 'Amman Communications',
        registrationNumber: 'COMM-TN-2026-9921',
        officeAddress: '124, Anna Salai, Mount Road, Chennai, Tamil Nadu - 600002',
        primaryPhone: '+91 44 2852 9000',
        supportEmail: 'support@ammancomm.in',
      },
    });
    console.log('✅ Business profile created');
  }

  // 3. Create Default Services
  const defaultServices = [
    {
      id: 'srv-0001-fiber-business',
      name: 'Commercial High-Speed Fiber Broadband',
      description: 'Dedicated enterprise fiber optic connection with 99.9% SLA, static IP support, and 24/7 technical assistance.',
      governmentFee: 250.00,
      serviceFee: 750.00,
      totalFee: 1000.00,
      estimatedTime: '2-3 Business Days',
      status: ServiceStatus.ACTIVE,
      requiredDocs: ['Commercial Registration Certificate', 'Authorized Signatory National ID', 'Lease Agreement / Proof of Address'],
    },
    {
      id: 'srv-0002-residential-bb',
      name: 'Residential FTTH Broadband Setup',
      description: 'Ultra-fast home fiber broadband with complimentary dual-band Wi-Fi 6 router and quick installation.',
      governmentFee: 100.00,
      serviceFee: 300.00,
      totalFee: 400.00,
      estimatedTime: '24-48 Hours',
      status: ServiceStatus.ACTIVE,
      requiredDocs: ['National Identification / Passport', 'Utility Bill (Electricity/Water)'],
    },
    {
      id: 'srv-0003-doc-verify',
      name: 'Document Clearance & Legal Verification',
      description: 'Comprehensive verification and attestation for documentation, NOC certifications, and municipal clearances.',
      governmentFee: 75.00,
      serviceFee: 125.00,
      totalFee: 200.00,
      estimatedTime: '1-2 Business Days',
      status: ServiceStatus.ACTIVE,
      requiredDocs: ['Identity Proof', 'Document Copy for Verification'],
    },
  ];

  for (const s of defaultServices) {
    const { requiredDocs, ...serviceData } = s;
    const service = await prisma.service.upsert({
      where: { id: s.id },
      update: {
        name: serviceData.name,
        description: serviceData.description,
        governmentFee: serviceData.governmentFee,
        serviceFee: serviceData.serviceFee,
        totalFee: serviceData.totalFee,
        estimatedTime: serviceData.estimatedTime,
        status: serviceData.status,
      },
      create: {
        ...serviceData,
      },
    });

    for (let i = 0; i < requiredDocs.length; i++) {
      const docName = requiredDocs[i];
      const existingDoc = await prisma.requiredDocument.findFirst({
        where: { serviceId: service.id, name: docName },
      });
      if (!existingDoc) {
        await prisma.requiredDocument.create({
          data: {
            serviceId: service.id,
            name: docName,
            displayOrder: i + 1,
            isRequired: true,
          },
        });
      }
    }
  }
  console.log('✅ Services and required documents seeded');

  // 4. Create Offices
  const officeCount = await prisma.office.count();
  if (officeCount === 0) {
    await prisma.office.createMany({
      data: [
        { name: 'Chennai Head Office', address: '124, Anna Salai, Chennai', isActive: true },
        { name: 'Anna Nagar Hub', address: '4th Avenue, Anna Nagar, Chennai', isActive: true },
      ],
    });
    console.log('✅ Offices seeded');
  }

  console.log('🚀 Database initialization and clean seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
