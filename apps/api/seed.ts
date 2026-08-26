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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
