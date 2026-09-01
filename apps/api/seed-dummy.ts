import { PrismaClient, ServiceStatus, AppointmentStatus, ApplicationStatus, ExpenseCategory, CustomerStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding dummy data...');

  // Admin for expenses
  let admin = await prisma.admin.findFirst();
  if (!admin) {
    admin = await prisma.admin.create({
      data: {
        name: 'Super Admin',
        email: 'admin@example.com',
        passwordHash: 'dummy'
      }
    });
  }

  // Customers
  const customers = [];
  for (let i = 1; i <= 5; i++) {
    const status = i % 2 === 0 ? CustomerStatus.INACTIVE : CustomerStatus.ACTIVE;
    const c = await prisma.customer.create({
      data: {
        name: `Dummy Customer ${i}`,
        email: `dummy${i}@example.com`,
        phone: `987654321${i}`,
        passwordHash: 'dummy_hash',
        status: status,
      }
    });
    customers.push(c);
  }

  // Services
  const services = [];
  for (let i = 1; i <= 3; i++) {
    const status = i === 1 ? ServiceStatus.ACTIVE : i === 2 ? ServiceStatus.INACTIVE : ServiceStatus.DRAFT;
    const s = await prisma.service.create({
      data: {
        name: `Dummy Service ${i}`,
        description: `[Category${i}] Description for service ${i}`,
        governmentFee: 100 * i,
        serviceFee: 50 * i,
        totalFee: 150 * i,
        status: status,
      }
    });
    services.push(s);
  }

  // Appointments
  for (let i = 1; i <= 4; i++) {
    const statuses = [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING, AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED];
    await prisma.appointment.create({
      data: {
        customerName: customers[0].name,
        customerEmail: customers[0].email,
        customerPhone: customers[0].phone || '',
        appointmentDate: new Date(),
        status: statuses[i-1],
      }
    });
  }

  // Applications
  for (let i = 1; i <= 4; i++) {
    const statuses = [ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_REVIEW, ApplicationStatus.APPROVED, ApplicationStatus.REJECTED];
    await prisma.application.create({
      data: {
        customerId: customers[1].id,
        serviceId: services[0].id,
        status: statuses[i-1],
      }
    });
  }

  // Expenses
  for (let i = 1; i <= 3; i++) {
    const cats = [ExpenseCategory.OFFICE, ExpenseCategory.UTILITIES, ExpenseCategory.EMPLOYEE];
    await prisma.expense.create({
      data: {
        title: `Dummy expense ${i}`,
        expenseDate: new Date(),
        amount: 500 * i,
        category: cats[i-1],
        description: `Dummy expense ${i}`,
        createdById: admin.id
      }
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
