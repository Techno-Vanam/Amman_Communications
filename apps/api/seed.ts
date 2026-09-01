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

<<<<<<< HEAD
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
=======
  // 4. Create Services (using valid v4 UUIDs)
  const services = [
    {
      id: '11111111-0000-4000-8000-000000000001',
      name: 'Trade License Renewal & Documentation',
      description: 'Complete assistance for commercial and trade license renewals, document verification, and government submissions.',
      requiredDocuments: ['trade_license', 'passport_copy', 'lease_agreement'],
      governmentFee: 150.00,
      serviceFee: 50.00,
      estimatedTime: '3-5 Business Days',
    },
    {
      id: '11111111-0000-4000-8000-000000000002',
      name: 'Company Establishment & Office Registration',
      description: 'End-to-end registration of new company structures, tax identification setup, and office lease certification.',
      requiredDocuments: ['identity_card', 'business_plan', 'bank_reference'],
      governmentFee: 300.00,
      serviceFee: 100.00,
      estimatedTime: '7-10 Business Days',
    },
    {
      id: '11111111-0000-4000-8000-000000000003',
      name: 'Legal & Tax Clearance Advisory',
      description: 'Professional consultation regarding corporate taxation, legal compliance, and regulatory documentation.',
      requiredDocuments: ['tax_returns', 'audit_report'],
      governmentFee: 75.00,
      serviceFee: 75.00,
      estimatedTime: '1-2 Business Days',
    },
    // Also include legacy prefix IDs for existing references
    {
      id: 'srv-00000000-0000-0000-0000-000000000001',
      name: 'Trade License Renewal & Documentation',
      description: 'Complete assistance for commercial and trade license renewals, document verification, and government submissions.',
      requiredDocuments: ['trade_license', 'passport_copy', 'lease_agreement'],
      governmentFee: 150.00,
      serviceFee: 50.00,
      estimatedTime: '3-5 Business Days',
    },
    {
      id: 'srv-00000000-0000-0000-0000-000000000002',
      name: 'Company Establishment & Office Registration',
      description: 'End-to-end registration of new company structures, tax identification setup, and office lease certification.',
      requiredDocuments: ['identity_card', 'business_plan', 'bank_reference'],
      governmentFee: 300.00,
      serviceFee: 100.00,
      estimatedTime: '7-10 Business Days',
    },
    {
      id: 'srv-00000000-0000-0000-0000-000000000003',
      name: 'Legal & Tax Clearance Advisory',
      description: 'Professional consultation regarding corporate taxation, legal compliance, and regulatory documentation.',
      requiredDocuments: ['tax_returns', 'audit_report'],
      governmentFee: 75.00,
      serviceFee: 75.00,
      estimatedTime: '1-2 Business Days',
    },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: {
        name: s.name,
        description: s.description,
        governmentFee: s.governmentFee,
        serviceFee: s.serviceFee,
        totalFee: s.governmentFee + s.serviceFee,
        estimatedTime: s.estimatedTime,
        status: 'ACTIVE',
        requiredDocuments: {
          deleteMany: {},
          create: s.requiredDocuments.map((name, displayOrder) => ({ name, displayOrder })),
        },
      },
      create: {
        id: s.id,
        name: s.name,
        description: s.description,
        governmentFee: s.governmentFee,
        serviceFee: s.serviceFee,
        totalFee: s.governmentFee + s.serviceFee,
        estimatedTime: s.estimatedTime,
        status: 'ACTIVE',
        requiredDocuments: {
          create: s.requiredDocuments.map((name, displayOrder) => ({ name, displayOrder })),
        },
      },
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
>>>>>>> origin/backend-merge
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
