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

  // 4. Create Services (using valid v4 UUIDs)
  const services = [
    {
      id: '11111111-0000-4000-8000-000000000001',
      name: 'Trade License Renewal & Documentation',
      description: 'Complete assistance for commercial and trade license renewals, document verification, and government submissions.',
      requiredDocuments: ['trade_license', 'passport_copy', 'lease_agreement'],
      governmentFee: 150.00,
      officeCharge: 50.00,
      estimatedProcessingTime: '3-5 Business Days',
      isActive: true,
    },
    {
      id: '11111111-0000-4000-8000-000000000002',
      name: 'Company Establishment & Office Registration',
      description: 'End-to-end registration of new company structures, tax identification setup, and office lease certification.',
      requiredDocuments: ['identity_card', 'business_plan', 'bank_reference'],
      governmentFee: 300.00,
      officeCharge: 100.00,
      estimatedProcessingTime: '7-10 Business Days',
      isActive: true,
    },
    {
      id: '11111111-0000-4000-8000-000000000003',
      name: 'Legal & Tax Clearance Advisory',
      description: 'Professional consultation regarding corporate taxation, legal compliance, and regulatory documentation.',
      requiredDocuments: ['tax_returns', 'audit_report'],
      governmentFee: 75.00,
      officeCharge: 75.00,
      estimatedProcessingTime: '1-2 Business Days',
      isActive: true,
    },
    // Also include legacy prefix IDs for existing references
    {
      id: 'srv-00000000-0000-0000-0000-000000000001',
      name: 'Trade License Renewal & Documentation',
      description: 'Complete assistance for commercial and trade license renewals, document verification, and government submissions.',
      requiredDocuments: ['trade_license', 'passport_copy', 'lease_agreement'],
      governmentFee: 150.00,
      officeCharge: 50.00,
      estimatedProcessingTime: '3-5 Business Days',
      isActive: true,
    },
    {
      id: 'srv-00000000-0000-0000-0000-000000000002',
      name: 'Company Establishment & Office Registration',
      description: 'End-to-end registration of new company structures, tax identification setup, and office lease certification.',
      requiredDocuments: ['identity_card', 'business_plan', 'bank_reference'],
      governmentFee: 300.00,
      officeCharge: 100.00,
      estimatedProcessingTime: '7-10 Business Days',
      isActive: true,
    },
    {
      id: 'srv-00000000-0000-0000-0000-000000000003',
      name: 'Legal & Tax Clearance Advisory',
      description: 'Professional consultation regarding corporate taxation, legal compliance, and regulatory documentation.',
      requiredDocuments: ['tax_returns', 'audit_report'],
      governmentFee: 75.00,
      officeCharge: 75.00,
      estimatedProcessingTime: '1-2 Business Days',
      isActive: true,
    },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: { ...s },
      create: { ...s },
    });
  }
  // 5. Seed Appointments
  const fiberService = await prisma.service.findFirst({ where: { name: 'Commercial Fiber Broadband' } });
  const homeService = await prisma.service.findFirst({ where: { name: 'Residential Broadband Setup' } });
  const testCustomer = await prisma.customer.findUnique({ where: { email: 'customer@test.com' } });

  const now = new Date();
  const today10am = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
  const today2pm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 30, 0);
  const today4pm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0, 0);
  const tomorrow11am = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 0, 0);
  const nextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 15, 0, 0);
  const nextMonth = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 8, 10, 30, 0);
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 11, 30, 0);
  const pastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5, 14, 0, 0);

  const appointmentsData = [
    {
      customerName: 'Aravind Kumar',
      customerEmail: 'aravind.k@gmail.com',
      customerPhone: '+91 98765 43210',
      customerId: testCustomer?.id,
      serviceId: fiberService?.id,
      appointmentDate: today10am,
      durationMinutes: 45,
      mode: 'OFFLINE' as const,
      meetingLink: 'Branch Office - Counter 3, Chennai Hub',
      status: 'CONFIRMED' as const,
      notes: 'Initial site survey and commercial document verification.',
    },
    {
      customerName: 'Priya Sundaram',
      customerEmail: 'priya.sundar@outlook.com',
      customerPhone: '+91 94432 10987',
      serviceId: homeService?.id,
      appointmentDate: today2pm,
      durationMinutes: 30,
      mode: 'ONLINE' as const,
      onlineType: 'VIDEO' as const,
      meetingLink: 'https://meet.google.com/abc-wxyz-pqr',
      status: 'CONFIRMED' as const,
      notes: 'Video KYC and high-speed broadband plan selection.',
    },
    {
      customerName: 'Karthik Raja',
      customerEmail: 'karthik.raja@techfirm.io',
      customerPhone: '+91 98401 23456',
      serviceId: fiberService?.id,
      appointmentDate: today4pm,
      durationMinutes: 30,
      mode: 'ONLINE' as const,
      onlineType: 'PHONE' as const,
      meetingLink: '+91 98401 23456 (Direct Call)',
      status: 'PENDING' as const,
      notes: 'Consultation on static IP allocation and enterprise SLA.',
    },
    {
      customerName: 'Meenakshi Iyer',
      customerEmail: 'meenakshi.iyer@gmail.com',
      customerPhone: '+91 97890 12345',
      serviceId: homeService?.id,
      appointmentDate: tomorrow11am,
      durationMinutes: 30,
      mode: 'ONLINE' as const,
      onlineType: 'MEETING' as const,
      meetingLink: 'https://zoom.us/j/9876543210',
      status: 'CONFIRMED' as const,
      notes: 'Optical network terminal installation schedule discussion.',
    },
    {
      customerName: 'Saravanan M',
      customerEmail: 'saravanan.m@enterprise.com',
      customerPhone: '+91 99400 55667',
      serviceId: fiberService?.id,
      appointmentDate: nextWeek,
      durationMinutes: 60,
      mode: 'OFFLINE' as const,
      meetingLink: 'Headquarters - Conference Room B',
      status: 'RESCHEDULED' as const,
      rescheduledFrom: yesterday,
      rescheduleReason: 'Customer was travelling; requested reschedule to next week.',
      notes: 'Multi-branch fiber connectivity contract signing.',
    },
    {
      customerName: 'Deepa Natarajan',
      customerEmail: 'deepa.n@gmail.com',
      customerPhone: '+91 98840 99887',
      serviceId: homeService?.id,
      appointmentDate: nextMonth,
      durationMinutes: 30,
      mode: 'ONLINE' as const,
      onlineType: 'VIDEO' as const,
      meetingLink: 'https://meet.google.com/uvw-mnop-xyz',
      status: 'CONFIRMED' as const,
      notes: 'Apartment complex FTTH connection review.',
    },
    {
      customerName: 'Venkatesh Babu',
      customerEmail: 'venkat.babu@gmail.com',
      customerPhone: '+91 97100 11223',
      serviceId: homeService?.id,
      appointmentDate: yesterday,
      durationMinutes: 30,
      mode: 'OFFLINE' as const,
      meetingLink: 'Anna Nagar Service Center',
      status: 'COMPLETED' as const,
      notes: 'Application verification completed and router handed over.',
    },
    {
      customerName: 'Rajesh Kannan',
      customerEmail: 'rajesh.k@gmail.com',
      customerPhone: '+91 96000 44332',
      serviceId: fiberService?.id,
      appointmentDate: pastWeek,
      durationMinutes: 30,
      mode: 'ONLINE' as const,
      onlineType: 'PHONE' as const,
      status: 'CANCELLED' as const,
      notes: 'Cancelled due to change of commercial location.',
    },
  ];

  for (const appt of appointmentsData) {
    const existing = await prisma.appointment.findFirst({
      where: {
        customerEmail: appt.customerEmail,
        appointmentDate: appt.appointmentDate,
      },
    });
    if (!existing) {
      await prisma.appointment.create({
        data: appt,
      });
    }
  }
  console.log('Default appointments seeded');
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


}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
