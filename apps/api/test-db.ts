import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const pooler5432 =
  'postgresql://postgres.urakhvsfqmbmtiokxuua:Qazxswplmnko%40123@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?connection_limit=2&connect_timeout=60&sslmode=require';

const prisma = new PrismaClient({
  datasources: { db: { url: pooler5432 } },
});

async function testDashboardStats() {
  console.log('Testing stats()...');
  try {
    const [
      customersCount,
      applicationsCount,
      invoices,
      expensesSum,
      appointments,
      totalAppointmentsCount,
      pendingVerificationsCount,
      recentApplications,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.application.count(),
      prisma.invoice.findMany({
        select: {
          id: true,
          status: true,
          service: { select: { name: true } },
          payments: { select: { amount: true, status: true } },
        },
      }),
      prisma.expense.aggregate({
        where: { isVoided: false },
        _sum: { amount: true },
      }),
      prisma.appointment.findMany({
        take: 5,
        orderBy: { appointmentDate: 'desc' },
        include: { service: { select: { name: true } } },
      }),
      prisma.appointment.count(),
      prisma.document.count({
        where: { status: { in: ['UPLOADED', 'UNDER_REVIEW'] } },
      }),
      prisma.application.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { name: true } } },
      }),
    ]);
    console.log('✅ stats() succeeded!');
    console.log({
      customersCount,
      applicationsCount,
      totalAppointmentsCount,
      pendingVerificationsCount,
      invoiceCount: invoices.length,
      recentApplicationsCount: recentApplications.length,
      expensesTotal: expensesSum._sum.amount,
      appointmentsCount: appointments.length,
    });
  } catch (err: any) {
    console.error('❌ stats() failed:', err);
  }
}

async function testExports() {
  console.log('\nTesting ReportsService exports...');
  // @ts-ignore
  const { ReportsService } = await import('./src/admin/reports/reports.service');
  // @ts-ignore
  const reportsService = new ReportsService(prisma);
  try {
    const pdfBuf = await reportsService.generatePdfReport({ page: 1, limit: 10 });
    console.log('✅ PDF Generation succeeded! Size:', pdfBuf.length, 'bytes');

    const excelBuf = await reportsService.generateExcelReport({ page: 1, limit: 10 });
    console.log('✅ Excel Generation succeeded! Size:', excelBuf.length, 'bytes');
  } catch (err: any) {
    console.error('❌ Export failed:', err);
  }
}

async function runAll() {
  await testDashboardStats();
  await testExports();
}

runAll().finally(() => prisma.$disconnect());
