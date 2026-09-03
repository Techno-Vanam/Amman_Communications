import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Admin - Dashboard')
@ApiBearerAuth()
@Controller(['admin/dashboard', 'v1/admin/dashboard', 'api/v1/admin/dashboard'])
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminDashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get summary statistics for the admin dashboard' })
  async summary() {
    const [customers, applications, documents] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.application.count(),
      this.prisma.document.count(),
    ]);
    return { customers, applications, documents };
  }

  @Get('verification-queue')
  @ApiOperation({ summary: 'Get recent documents for verification queue' })
  async verificationQueue() {
    const documents = await this.prisma.document.findMany({
      orderBy: { uploadedAt: 'desc' },
      include: {
        application: {
          include: {
            customer: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    return documents.map((doc) => ({
      id: doc.id,
      documentType: doc.documentType,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      status: doc.status,
      version: doc.version,
      rejectionReason: doc.rejectionReason,
      uploadedAt: doc.uploadedAt,
      storagePath: doc.storagePath,
      applicationId: doc.applicationId,
      applicationNumber: doc.application?.applicationNumber || `AMC-${doc.applicationId.slice(0, 8)}`,
      customerName: doc.application?.fullName || doc.application?.customer?.name || 'Customer Applicant',
      downloadUrl: `/api/v1/admin/applications/${doc.applicationId}/documents/${doc.id}/stream`,
    }));
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get consolidated admin dashboard stats in a single fast call' })
  async stats() {
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
      this.prisma.customer.count(),
      this.prisma.application.count(),
      this.prisma.invoice.findMany({
        select: {
          id: true,
          status: true,
          service: { select: { name: true } },
          payments: { select: { amount: true, status: true } },
        },
      }),
      this.prisma.expense.aggregate({
        where: { isVoided: false },
        _sum: { amount: true },
      }),
      this.prisma.appointment.findMany({
        take: 5,
        orderBy: { appointmentDate: 'desc' },
        include: { service: { select: { name: true } } },
      }),
      this.prisma.appointment.count(),
      this.prisma.document.count({
        where: { status: { in: ['UPLOADED', 'UNDER_REVIEW'] } },
      }),
      this.prisma.application.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { name: true } } },
      }),
    ]);

    let totalIncome = 0;
    let pendingPaymentCount = 0;
    const serviceRevenueMap: Record<string, number> = {};

    invoices.forEach((inv) => {
      const paid = inv.payments
        .filter((p) => p.status === 'PAID')
        .reduce((sum, p) => sum + Number(p.amount), 0);
      totalIncome += paid;
      if (inv.status === 'UNPAID') pendingPaymentCount++;

      const sName = inv.service?.name || 'Technical Onsite Survey';
      serviceRevenueMap[sName] = (serviceRevenueMap[sName] || 0) + paid;
    });

    const totalExpense = Number(expensesSum._sum.amount || 0);

    const DB_TO_UI_STATUS: Record<string, string> = {
      CONFIRMED: 'Confirmed',
      PENDING: 'Pending',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      RESCHEDULED: 'Rescheduled',
    };

    const recentAppointments = appointments.map((apt) => ({
      id: apt.id,
      customer: apt.customerName,
      service: apt.service?.name || 'Technical Onsite Survey',
      date: apt.appointmentDate ? apt.appointmentDate.toISOString().split('T')[0] : '',
      status: DB_TO_UI_STATUS[apt.status] || 'Confirmed',
    }));

    const recentApps = recentApplications.map((app) => ({
      id: app.id,
      customer: app.fullName || app.customer?.name || '—',
      service: app.serviceType || app.title || 'Support',
      date: app.createdAt ? app.createdAt.toISOString().split('T')[0] : '',
      status:
        app.status === 'APPROVED'
          ? 'Completed'
          : app.status === 'REJECTED'
            ? 'Rejected'
            : 'Under Verification',
    }));

    const pieColors = ['#12372A', '#3d7a60', '#f4b251', '#e56b6f', '#6c757d'];
    const servicesPieData = Object.keys(serviceRevenueMap)
      .map((name, idx) => ({
        name,
        value: totalIncome > 0 ? Math.round((serviceRevenueMap[name] / totalIncome) * 100) : 0,
        color: pieColors[idx % pieColors.length],
      }))
      .filter((item) => item.value > 0);

    return {
      stats: {
        totalClients: customersCount,
        totalIncome,
        totalExpense,
        totalProfit: totalIncome - totalExpense,
        totalAppointments: totalAppointmentsCount,
        pendingVerifications: pendingVerificationsCount,
        totalApplications: applicationsCount,
        pendingPayment: pendingPaymentCount,
      },
      recentAppointments,
      recentApplications: recentApps,
      servicesPieData,
    };
  }
}

@ApiTags('Customer - Dashboard')
@ApiBearerAuth()
@Controller(['customer/dashboard', 'v1/customer/dashboard', 'api/v1/customer/dashboard'])
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER')
export class CustomerDashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get summary statistics for the customer dashboard' })
  async summary(@Req() request: { user: { sub?: string; id?: string; customerId?: string } }) {
    const customerId = request.user.sub || request.user.id || request.user.customerId;
    if (!customerId) return { applications: 0, documents: 0, verifiedDocs: 0, pendingDocs: 0, actionRequiredDocs: 0 };
    const [applications, documents] = await Promise.all([
      this.prisma.application.count({ where: { customerId } }),
      this.prisma.document.findMany({ 
        where: { customerId },
        select: { status: true }
      }),
    ]);
    
    return { 
      applications, 
      documents: documents.length,
      verifiedDocs: documents.filter(d => d.status === 'VERIFIED').length,
      pendingDocs: documents.filter(d => d.status === 'UPLOADED' || d.status === 'UNDER_REVIEW').length,
      actionRequiredDocs: documents.filter(d => d.status === 'ACTION_REQUIRED').length,
    };
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get customer profile details' })
  async profile(@Req() request: { user: { sub?: string; id?: string; customerId?: string } }) {
    const customerId = request.user.sub || request.user.id || request.user.customerId;
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    });
    return customer;
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current customer session details (alias for profile)' })
  async me(@Req() request: { user: { sub?: string; id?: string; customerId?: string } }) {
    return this.profile(request);
  }
}
