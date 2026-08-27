import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash('password123', 10);

  // 1. Create customers
  await prisma.customer.upsert({
    where: { email: 'customer@test.com' },
    update: { passwordHash, status: 'ACTIVE', phone: '+962 7 9123 4567' },
    create: {
      email: 'customer@test.com',
      passwordHash,
      name: 'Test Customer',
      phone: '+962 7 9123 4567',
      status: 'ACTIVE',
    },
  });

  await prisma.customer.upsert({
    where: { email: 'sarah.smith@example.com' },
    update: { passwordHash, status: 'ACTIVE', phone: '+962 7 8876 5432' },
    create: {
      email: 'sarah.smith@example.com',
      passwordHash,
      name: 'Sarah Smith',
      phone: '+962 7 8876 5432',
      status: 'ACTIVE',
    },
  });

  await prisma.customer.upsert({
    where: { email: 'john.doe@example.com' },
    update: { passwordHash, status: 'INACTIVE', phone: '+962 7 7000 1122' },
    create: {
      email: 'john.doe@example.com',
      passwordHash,
      name: 'John Doe',
      phone: '+962 7 7000 1122',
      status: 'INACTIVE',
    },
  });

  await prisma.customer.upsert({
    where: { email: 'acme.corp@business.com' },
    update: { passwordHash, status: 'ACTIVE', phone: '+962 6 5500 9988' },
    create: {
      email: 'acme.corp@business.com',
      passwordHash,
      name: 'Acme Corporation',
      phone: '+962 6 5500 9988',
      status: 'ACTIVE',
    },
  });
  console.log('Sample customers created');

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

  // 5. Seed sample Invoices and Payments
  const acmeCustomer = await prisma.customer.findUnique({ where: { email: 'acme.corp@business.com' } });
  const sarahCustomer = await prisma.customer.findUnique({ where: { email: 'sarah.smith@example.com' } });
  const testCustomer = await prisma.customer.findUnique({ where: { email: 'customer@test.com' } });
  const johnCustomer = await prisma.customer.findUnique({ where: { email: 'john.doe@example.com' } });
  const fiberService = await prisma.service.findFirst({ where: { name: 'Commercial Fiber Broadband' } });
  const broadbandService = await prisma.service.findFirst({ where: { name: 'Residential Broadband Setup' } });
  const legacyService = await prisma.service.findFirst({ where: { name: 'Legacy Copper Landline' } });

  if (acmeCustomer && fiberService) {
    const inv1 = await prisma.invoice.upsert({
      where: { invoiceNumber: 'INV-202608-0001' },
      update: {},
      create: {
        invoiceNumber: 'INV-202608-0001',
        customerId: acmeCustomer.id,
        serviceId: fiberService.id,
        governmentFee: 250,
        serviceFee: 750,
        totalAmount: 1000,
        status: 'PAID',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        notes: 'Corporate fiber annual subscription setup fee',
      },
    });

    await prisma.payment.upsert({
      where: { paymentNumber: 'PAY-202608-0001' },
      update: {},
      create: {
        paymentNumber: 'PAY-202608-0001',
        invoiceId: inv1.id,
        customerId: acmeCustomer.id,
        amount: 1000,
        paymentMethod: 'BANK_TRANSFER',
        status: 'PAID',
        reference: 'TXN-HDFC-9928172',
        notes: 'Direct wire transfer received',
        paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    });
  }

  if (sarahCustomer && broadbandService) {
    const inv2 = await prisma.invoice.upsert({
      where: { invoiceNumber: 'INV-202608-0002' },
      update: {},
      create: {
        invoiceNumber: 'INV-202608-0002',
        customerId: sarahCustomer.id,
        serviceId: broadbandService.id,
        governmentFee: 100,
        serviceFee: 300,
        totalAmount: 400,
        status: 'PARTIALLY_PAID',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        notes: 'Home broadband installation advance payment',
      },
    });

    await prisma.payment.upsert({
      where: { paymentNumber: 'PAY-202608-0002' },
      update: {},
      create: {
        paymentNumber: 'PAY-202608-0002',
        invoiceId: inv2.id,
        customerId: sarahCustomer.id,
        amount: 200,
        paymentMethod: 'UPI',
        status: 'PAID',
        reference: 'UPI-778899112233',
        notes: 'Advance 50% deposit received via UPI',
        paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    });
  }

  if (testCustomer && fiberService) {
    await prisma.invoice.upsert({
      where: { invoiceNumber: 'INV-202608-0003' },
      update: {},
      create: {
        invoiceNumber: 'INV-202608-0003',
        customerId: testCustomer.id,
        serviceId: fiberService.id,
        governmentFee: 250,
        serviceFee: 750,
        totalAmount: 1000,
        status: 'UNPAID',
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        notes: 'Pending initial payment invoice',
      },
    });
  }

  if (johnCustomer && legacyService) {
    await prisma.invoice.upsert({
      where: { invoiceNumber: 'INV-202608-0004' },
      update: {},
      create: {
        invoiceNumber: 'INV-202608-0004',
        customerId: johnCustomer.id,
        serviceId: legacyService.id,
        governmentFee: 50,
        serviceFee: 150,
        totalAmount: 200,
        status: 'OVERDUE',
        dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        notes: 'Overdue copper line reconnection bill',
      },
    });
  }

  console.log('Sample invoices and payments seeded');

  // 6. Seed sample Applications and Documents
  if (acmeCustomer && fiberService) {
    let acmeApp = await prisma.application.findFirst({ where: { customerId: acmeCustomer.id } });
    if (!acmeApp) {
      acmeApp = await prisma.application.create({
        data: {
          customerId: acmeCustomer.id,
          serviceId: fiberService.id,
        },
      });
    }

    const docCount = await prisma.document.count({ where: { customerId: acmeCustomer.id } });
    if (docCount === 0) {
      await prisma.document.createMany({
        data: [
          {
            customerId: acmeCustomer.id,
            applicationId: acmeApp.id,
            documentType: 'Commercial Registration Certificate',
            fileName: 'Acme_Corp_Registration_2026.pdf',
            mimeType: 'application/pdf',
            fileSize: 2450000,
            storagePath: `documents/${acmeCustomer.id}/${acmeApp.id}/cr_cert.pdf`,
            verificationStatus: 'VERIFIED',
            verificationRemarks: 'Verified against Ministry records',
          },
          {
            customerId: acmeCustomer.id,
            applicationId: acmeApp.id,
            documentType: 'Authorized Signatory National ID',
            fileName: 'Director_National_ID.jpg',
            mimeType: 'image/jpeg',
            fileSize: 1240000,
            storagePath: `documents/${acmeCustomer.id}/${acmeApp.id}/director_id.jpg`,
            verificationStatus: 'VERIFIED',
            verificationRemarks: 'Clear government photo ID confirmed',
          },
          {
            customerId: acmeCustomer.id,
            applicationId: acmeApp.id,
            documentType: 'Lease Agreement / Proof of Address',
            fileName: 'Office_Lease_Agreement_Amman_Tower.pdf',
            mimeType: 'application/pdf',
            fileSize: 3890000,
            storagePath: `documents/${acmeCustomer.id}/${acmeApp.id}/lease.pdf`,
            verificationStatus: 'PENDING',
          },
        ],
      });
    }
  }

  if (sarahCustomer && broadbandService) {
    let sarahApp = await prisma.application.findFirst({ where: { customerId: sarahCustomer.id } });
    if (!sarahApp) {
      sarahApp = await prisma.application.create({
        data: {
          customerId: sarahCustomer.id,
          serviceId: broadbandService.id,
        },
      });
    }

    const docCount = await prisma.document.count({ where: { customerId: sarahCustomer.id } });
    if (docCount === 0) {
      await prisma.document.createMany({
        data: [
          {
            customerId: sarahCustomer.id,
            applicationId: sarahApp.id,
            documentType: 'National Identification / Passport',
            fileName: 'Sarah_Smith_Passport.pdf',
            mimeType: 'application/pdf',
            fileSize: 1850000,
            storagePath: `documents/${sarahCustomer.id}/${sarahApp.id}/passport.pdf`,
            verificationStatus: 'VERIFIED',
            verificationRemarks: 'Valid passport provided',
          },
          {
            customerId: sarahCustomer.id,
            applicationId: sarahApp.id,
            documentType: 'Utility Bill (Electricity/Water)',
            fileName: 'Electricity_Bill_July2026.png',
            mimeType: 'image/png',
            fileSize: 950000,
            storagePath: `documents/${sarahCustomer.id}/${sarahApp.id}/bill.png`,
            verificationStatus: 'REJECTED',
            verificationRemarks: 'Document is blurry and billing date is older than 3 months. Please re-upload latest bill.',
          },
        ],
      });
    }
  }

  if (testCustomer && fiberService) {
    let testApp = await prisma.application.findFirst({ where: { customerId: testCustomer.id } });
    if (!testApp) {
      testApp = await prisma.application.create({
        data: {
          customerId: testCustomer.id,
          serviceId: fiberService.id,
        },
      });
    }

    const docCount = await prisma.document.count({ where: { customerId: testCustomer.id } });
    if (docCount === 0) {
      await prisma.document.createMany({
        data: [
          {
            customerId: testCustomer.id,
            applicationId: testApp.id,
            documentType: 'National Identification / Passport',
            fileName: 'Customer_National_ID.pdf',
            mimeType: 'application/pdf',
            fileSize: 1540000,
            storagePath: `documents/${testCustomer.id}/${testApp.id}/national_id.pdf`,
            verificationStatus: 'PENDING',
          },
        ],
      });
    }
  }

  console.log('Sample documents and applications seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
