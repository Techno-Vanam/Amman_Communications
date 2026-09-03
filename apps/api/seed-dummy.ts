import {
  PrismaClient,
  ServiceStatus,
  AppointmentStatus,
  ApplicationStatus,
  ExpenseCategory,
  CustomerStatus,
  InvoiceStatus,
  PaymentStatus,
  PaymentMethod,
  DocumentStatus,
  AppointmentMode,
  NotificationType,
  NotificationUserType
} from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding rich test data into Supabase...');

  const passHash = await hash('password123', 10);
  const adminPassHash = await hash('admin123', 10);

  // 1. Ensure Admins
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@ammancomm.in' },
    update: { passwordHash: adminPassHash, name: 'Amman Admin' },
    create: {
      email: 'admin@ammancomm.in',
      name: 'Amman Admin',
      passwordHash: adminPassHash,
    },
  });

  await prisma.admin.upsert({
    where: { email: 'admin@test.com' },
    update: { passwordHash: passHash, name: 'Test Admin' },
    create: {
      email: 'admin@test.com',
      name: 'Test Admin',
      passwordHash: passHash,
    },
  });

  // 2. Fetch or create Services
  let services = await prisma.service.findMany();
  if (services.length === 0) {
    await prisma.service.createMany({
      data: [
        {
          id: 'srv-0001-fiber-business',
          name: 'Commercial High-Speed Fiber Broadband',
          description: 'Enterprise dedicated fiber connection with 99.9% uptime SLA.',
          governmentFee: 250,
          serviceFee: 750,
          totalFee: 1000,
          estimatedTime: '2-3 Business Days',
          status: ServiceStatus.ACTIVE,
        },
        {
          id: 'srv-0002-residential-bb',
          name: 'Residential FTTH Broadband Setup',
          description: 'Ultra-fast home fiber broadband with dual-band Wi-Fi 6 router.',
          governmentFee: 100,
          serviceFee: 300,
          totalFee: 400,
          estimatedTime: '24-48 Hours',
          status: ServiceStatus.ACTIVE,
        },
        {
          id: 'srv-0003-doc-verify',
          name: 'Document Clearance & Legal Verification',
          description: 'Attestation and NOC municipal clearances.',
          governmentFee: 75,
          serviceFee: 125,
          totalFee: 200,
          estimatedTime: '1-2 Business Days',
          status: ServiceStatus.ACTIVE,
        },
      ],
    });
    services = await prisma.service.findMany();
  }

  // 3. Fetch or create Offices
  let offices = await prisma.office.findMany();
  if (offices.length === 0) {
    await prisma.office.createMany({
      data: [
        { name: 'Chennai Head Office', address: '124, Anna Salai, Chennai', isActive: true },
        { name: 'Anna Nagar Hub', address: '4th Avenue, Anna Nagar, Chennai', isActive: true },
      ],
    });
    offices = await prisma.office.findMany();
  }

  // 4. Create Customers
  const customerData = [
    { name: 'Ramesh Kumar', email: 'ramesh.kumar@example.com', phone: '+91 98401 23456', address: 'T. Nagar, Chennai', status: CustomerStatus.ACTIVE },
    { name: 'Priya Sharma', email: 'priya.sharma@example.com', phone: '+91 98840 12345', address: 'Velachery, Chennai', status: CustomerStatus.ACTIVE },
    { name: 'Rajesh Sundaram', email: 'rajesh.sundaram@example.com', phone: '+91 97909 87654', address: 'Anna Nagar, Chennai', status: CustomerStatus.ACTIVE },
    { name: 'Ananya Reddy', email: 'ananya.reddy@example.com', phone: '+91 99620 54321', address: 'Adyar, Chennai', status: CustomerStatus.ACTIVE },
    { name: 'Karthik Nathan', email: 'karthik.nathan@example.com', phone: '+91 94440 98765', address: 'Tambaram, Chennai', status: CustomerStatus.ACTIVE },
    { name: 'Meera Krishnan', email: 'meera.krishnan@example.com', phone: '+91 98410 45678', address: 'Mylapore, Chennai', status: CustomerStatus.ACTIVE },
  ];

  const customers = [];
  for (const cd of customerData) {
    const cust = await prisma.customer.upsert({
      where: { email: cd.email },
      update: { name: cd.name, phone: cd.phone, address: cd.address, isProfileCompleted: true },
      create: {
        ...cd,
        passwordHash: passHash,
        isProfileCompleted: true,
      },
    });
    customers.push(cust);
  }
  console.log(`✅ ${customers.length} Customers ready`);

  // 5. Create Applications
  const appConfigs = [
    { custIdx: 0, srvIdx: 0, status: ApplicationStatus.APPROVED, appNum: 'AMC-2026-0001', title: 'Commercial Fiber 500Mbps' },
    { custIdx: 1, srvIdx: 1, status: ApplicationStatus.UNDER_REVIEW, appNum: 'AMC-2026-0002', title: 'Home Gigabit Broadband' },
    { custIdx: 2, srvIdx: 2, status: ApplicationStatus.SUBMITTED, appNum: 'AMC-2026-0003', title: 'Commercial NOC Attestation' },
    { custIdx: 3, srvIdx: 0, status: ApplicationStatus.APPROVED, appNum: 'AMC-2026-0004', title: 'Enterprise Dedicated Line' },
    { custIdx: 4, srvIdx: 1, status: ApplicationStatus.SUBMITTED, appNum: 'AMC-2026-0005', title: 'Residential FTTH Connection' },
    { custIdx: 5, srvIdx: 2, status: ApplicationStatus.UNDER_REVIEW, appNum: 'AMC-2026-0006', title: 'Property Legal Verification' },
  ];

  const applications = [];
  for (const ac of appConfigs) {
    const cust = customers[ac.custIdx];
    const srv = services[ac.srvIdx % services.length];
    const existing = await prisma.application.findUnique({ where: { applicationNumber: ac.appNum } });
    if (!existing) {
      const app = await prisma.application.create({
        data: {
          applicationNumber: ac.appNum,
          customerId: cust.id,
          serviceId: srv.id,
          title: ac.title,
          serviceType: srv.name,
          fullName: cust.name,
          email: cust.email,
          phone: cust.phone,
          status: ac.status,
          address: cust.address,
        },
      });
      applications.push(app);
    } else {
      applications.push(existing);
    }
  }
  console.log(`✅ ${applications.length} Applications ready`);

  // 6. Create Documents
  for (let i = 0; i < applications.length; i++) {
    const app = applications[i];
    const docTypes = ['Identity Proof (Aadhaar/Passport)', 'Address Proof', 'Registration Certificate'];
    for (let j = 0; j < 2; j++) {
      const docType = docTypes[j];
      const existingDoc = await prisma.document.findUnique({
        where: {
          applicationId_documentType: {
            applicationId: app.id,
            documentType: docType,
          },
        },
      });
      if (!existingDoc) {
        await prisma.document.create({
          data: {
            customerId: app.customerId,
            applicationId: app.id,
            documentType: docType,
            fileName: `${app.applicationNumber}_doc_${j + 1}.pdf`,
            storagePath: `/uploads/applications/${app.id}/${app.applicationNumber}_doc_${j + 1}.pdf`,
            mimeType: 'application/pdf',
            fileSize: 245000 + j * 120000,
            status: i % 2 === 0 ? DocumentStatus.VERIFIED : DocumentStatus.UNDER_REVIEW,
          },
        });
      }
    }
  }
  console.log('✅ Documents seeded');

  // 7. Create Appointments
  const aptConfigs = [
    { custIdx: 0, srvIdx: 0, status: AppointmentStatus.CONFIRMED, mode: AppointmentMode.OFFLINE, daysAhead: 1 },
    { custIdx: 1, srvIdx: 1, status: AppointmentStatus.PENDING, mode: AppointmentMode.ONLINE, daysAhead: 2 },
    { custIdx: 2, srvIdx: 2, status: AppointmentStatus.CONFIRMED, mode: AppointmentMode.OFFLINE, daysAhead: 3 },
    { custIdx: 3, srvIdx: 0, status: AppointmentStatus.COMPLETED, mode: AppointmentMode.OFFLINE, daysAhead: -2 },
    { custIdx: 4, srvIdx: 1, status: AppointmentStatus.CONFIRMED, mode: AppointmentMode.ONLINE, daysAhead: 4 },
  ];

  for (let i = 0; i < aptConfigs.length; i++) {
    const apt = aptConfigs[i];
    const cust = customers[apt.custIdx];
    const srv = services[apt.srvIdx % services.length];
    const office = offices[i % offices.length];
    const aptDate = new Date();
    aptDate.setDate(aptDate.getDate() + apt.daysAhead);

    const aptNumber = `APT-2026-${(i + 1).toString().padStart(4, '0')}`;
    const existing = await prisma.appointment.findUnique({ where: { appointmentNumber: aptNumber } });
    if (!existing) {
      await prisma.appointment.create({
        data: {
          appointmentNumber: aptNumber,
          customerId: cust.id,
          customerName: cust.name,
          customerEmail: cust.email,
          customerPhone: cust.phone || '',
          serviceId: srv.id,
          officeId: office.id,
          appointmentDate: aptDate,
          mode: apt.mode,
          status: apt.status,
          notes: 'Customer requested morning slot between 10:00 AM - 12:00 PM',
        },
      });
    }
  }
  console.log('✅ Appointments seeded');

  // 8. Create Invoices and Payments (Total Revenue: ₹18,500)
  const invoiceConfigs = [
    { custIdx: 0, srvIdx: 0, appIdx: 0, amount: 5000, status: InvoiceStatus.PAID, paidAmount: 5000 },
    { custIdx: 1, srvIdx: 1, appIdx: 1, amount: 2500, status: InvoiceStatus.PAID, paidAmount: 2500 },
    { custIdx: 2, srvIdx: 2, appIdx: 2, amount: 3000, status: InvoiceStatus.PAID, paidAmount: 3000 },
    { custIdx: 3, srvIdx: 0, appIdx: 3, amount: 8000, status: InvoiceStatus.PAID, paidAmount: 8000 },
    { custIdx: 4, srvIdx: 1, appIdx: 4, amount: 2000, status: InvoiceStatus.UNPAID, paidAmount: 0 },
    { custIdx: 5, srvIdx: 2, appIdx: 5, amount: 1500, status: InvoiceStatus.UNPAID, paidAmount: 0 },
  ];

  for (let i = 0; i < invoiceConfigs.length; i++) {
    const inv = invoiceConfigs[i];
    const cust = customers[inv.custIdx];
    const srv = services[inv.srvIdx % services.length];
    const app = applications[inv.appIdx];
    const invNum = `INV-2026-${(1001 + i).toString()}`;

    let invoice = await prisma.invoice.findUnique({ where: { invoiceNumber: invNum } });
    if (!invoice) {
      invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: invNum,
          customerId: cust.id,
          serviceId: srv.id,
          applicationId: app.id,
          governmentFee: inv.amount * 0.3,
          serviceFee: inv.amount * 0.7,
          totalAmount: inv.amount,
          status: inv.status,
        },
      });

      if (inv.paidAmount > 0) {
        await prisma.payment.create({
          data: {
            paymentNumber: `PAY-2026-${(5001 + i).toString()}`,
            invoiceId: invoice.id,
            customerId: cust.id,
            amount: inv.paidAmount,
            paymentMethod: i % 2 === 0 ? PaymentMethod.UPI : PaymentMethod.BANK_TRANSFER,
            status: PaymentStatus.PAID,
            reference: `UPI-TXN-${900000 + i * 11111}`,
          },
        });
      }
    }
  }
  console.log('✅ Invoices & Payments seeded');

  // 9. Create Expenses (Total: ₹7,800)
  const expenseData = [
    { title: 'Office Fiber Line Maintenance', amount: 3500, category: ExpenseCategory.UTILITIES, description: 'Backbone line servicing' },
    { title: 'Technician Field Travel Allowance', amount: 1800, category: ExpenseCategory.TRAVEL, description: 'Onsite installation transport' },
    { title: 'Office Stationeries & Printing Supplies', amount: 2500, category: ExpenseCategory.OFFICE, description: 'A4 paper, toner cartridges' },
  ];

  for (const exp of expenseData) {
    const existing = await prisma.expense.findFirst({ where: { title: exp.title } });
    if (!existing) {
      await prisma.expense.create({
        data: {
          ...exp,
          expenseDate: new Date(),
          createdById: admin.id,
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          isVoided: false,
        },
      });
    }
  }
  console.log('✅ Expenses seeded');

  // 10. Notifications
  const existingNotification = await prisma.notification.findFirst();
  if (!existingNotification) {
    await prisma.notification.createMany({
      data: [
        {
          title: 'New Commercial Application Received',
          message: 'Ramesh Kumar submitted an application for Commercial High-Speed Fiber Broadband.',
          type: NotificationType.INFO,
          userType: NotificationUserType.ADMIN,
          href: '/admin/applications',
        },
        {
          title: 'Appointment Booked',
          message: 'Rajesh Sundaram booked an office consultation for tomorrow 10:30 AM.',
          type: NotificationType.SUCCESS,
          userType: NotificationUserType.ADMIN,
          href: '/admin/appointments',
        },
        {
          title: 'Payment Received: ₹8,000',
          message: 'Enterprise line invoice #INV-2026-1004 was marked PAID via UPI.',
          type: NotificationType.SUCCESS,
          userType: NotificationUserType.ADMIN,
          href: '/admin/finance',
        },
      ],
    });
    console.log('✅ Notifications seeded');
  }

  console.log('🎉 All test data successfully populated into Supabase!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

