import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportFilterDto } from './dto/report-filter.dto';
import { ApplicationStatus, DocumentStatus, AppointmentStatus, InvoiceStatus, PaymentStatus } from '@prisma/client';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private getDateFilter(from?: string, to?: string) {
    if (!from && !to) return undefined;
    const filter: { gte?: Date; lte?: Date } = {};
    if (from) {
      const start = new Date(from);
      start.setHours(0, 0, 0, 0);
      filter.gte = start;
    }
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      filter.lte = end;
    }
    return filter;
  }

  // 1. SUMMARY METRICS
  async getSummary(filter: ReportFilterDto) {
    const dateFilter = this.getDateFilter(filter.from, filter.to);
    const now = new Date();

    const appWhere: any = {};
    if (dateFilter) appWhere.createdAt = dateFilter;
    if (filter.serviceId) appWhere.serviceId = filter.serviceId;
    if (filter.applicationStatus && filter.applicationStatus !== 'ALL') {
      appWhere.status = filter.applicationStatus as ApplicationStatus;
    }

    const [
      totalCustomers,
      totalApplications,
      activeServices,
      pendingApplications,
      pendingDocuments,
      upcomingAppointments,
      invoices,
      payments,
    ] = await Promise.all([
      this.prisma.customer.count({
        where: dateFilter ? { createdAt: dateFilter } : undefined,
      }),
      this.prisma.application.count({ where: appWhere }),
      this.prisma.service.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.application.count({
        where: {
          ...appWhere,
          status: { in: [ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_REVIEW] },
        },
      }),
      this.prisma.document.count({
        where: {
          status: { in: [DocumentStatus.UPLOADED, DocumentStatus.UNDER_REVIEW, DocumentStatus.ACTION_REQUIRED] },
          ...(dateFilter ? { uploadedAt: dateFilter } : {}),
        },
      }),
      this.prisma.appointment.count({
        where: {
          appointmentDate: { gte: now },
          status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING] },
          ...(filter.serviceId ? { serviceId: filter.serviceId } : {}),
        },
      }),
      this.prisma.invoice.findMany({
        where: {
          ...(dateFilter ? { createdAt: dateFilter } : {}),
          ...(filter.serviceId ? { serviceId: filter.serviceId } : {}),
        },
        select: {
          totalAmount: true,
          status: true,
          payments: {
            where: { status: PaymentStatus.PAID },
            select: { amount: true },
          },
        },
      }),
      this.prisma.payment.findMany({
        where: {
          status: PaymentStatus.PAID,
          ...(dateFilter ? { paidAt: dateFilter } : {}),
        },
        select: { amount: true },
      }),
    ]);

    let totalBilled = 0;
    let totalRevenue = 0;
    let totalPaidFromInvoices = 0;

    payments.forEach((p) => {
      totalRevenue += Number(p.amount);
    });

    invoices.forEach((inv) => {
      const invTotal = Number(inv.totalAmount);
      totalBilled += invTotal;
      const invPaid = inv.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      totalPaidFromInvoices += invPaid;
    });

    const outstandingPayments = Math.max(0, totalBilled - totalPaidFromInvoices);

    return {
      totalCustomers,
      totalApplications,
      activeServices,
      totalRevenue,
      pendingApplications,
      pendingDocuments,
      upcomingAppointments,
      outstandingPayments,
      totalBilled,
    };
  }

  // 2. APPLICATIONS REPORT
  async getApplicationsReport(filter: ReportFilterDto) {
    const dateFilter = this.getDateFilter(filter.from, filter.to);
    const { page = 1, limit = 10, search, serviceId, applicationStatus, sortBy = 'createdAt', sortOrder = 'desc' } = filter;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (dateFilter) where.createdAt = dateFilter;
    if (serviceId) where.serviceId = serviceId;
    if (applicationStatus && applicationStatus !== 'ALL') {
      where.status = applicationStatus as ApplicationStatus;
    }
    if (search) {
      where.OR = [
        { applicationNumber: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { serviceType: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items, statusCounts] = await Promise.all([
      this.prisma.application.count({ where }),
      this.prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          service: { select: { id: true, name: true, totalFee: true } },
        },
      }),
      this.prisma.application.groupBy({
        by: ['status'],
        where: dateFilter || serviceId ? { ...(dateFilter ? { createdAt: dateFilter } : {}), ...(serviceId ? { serviceId } : {}) } : undefined,
        _count: { status: true },
      }),
    ]);

    const statusMap: Record<string, number> = {
      SUBMITTED: 0,
      UNDER_REVIEW: 0,
      APPROVED: 0,
      REJECTED: 0,
      DRAFT: 0,
    };

    statusCounts.forEach((s) => {
      statusMap[s.status] = s._count.status;
    });

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      statusCounts: statusMap,
      items: items.map((app) => ({
        id: app.id,
        applicationNumber: app.applicationNumber || `AMC-${app.id.slice(0, 8)}`,
        customerName: app.fullName || app.customer?.name || 'Applicant',
        customerEmail: app.email || app.customer?.email || '',
        customerPhone: app.phone || app.customer?.phone || '',
        serviceName: app.service?.name || app.serviceType || app.title || 'General Service',
        serviceFee: app.service ? Number(app.service.totalFee) : 0,
        status: app.status,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
      })),
    };
  }

  // 3. SERVICES REPORT
  async getServicesReport(filter: ReportFilterDto) {
    const dateFilter = this.getDateFilter(filter.from, filter.to);
    const { search, sortBy = 'totalApplications', sortOrder = 'desc' } = filter;

    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const services = await this.prisma.service.findMany({
      where,
      include: {
        applications: {
          where: dateFilter ? { createdAt: dateFilter } : undefined,
          select: { id: true, status: true },
        },
        invoices: {
          where: dateFilter ? { createdAt: dateFilter } : undefined,
          select: {
            totalAmount: true,
            payments: {
              where: { status: PaymentStatus.PAID },
              select: { amount: true },
            },
          },
        },
      },
    });

    const reportItems = services.map((svc) => {
      const totalApplications = svc.applications.length;
      const pending = svc.applications.filter((a) => a.status === ApplicationStatus.SUBMITTED || a.status === ApplicationStatus.UNDER_REVIEW).length;
      const approved = svc.applications.filter((a) => a.status === ApplicationStatus.APPROVED).length;
      const rejected = svc.applications.filter((a) => a.status === ApplicationStatus.REJECTED).length;

      let revenue = 0;
      svc.invoices.forEach((inv) => {
        inv.payments.forEach((p) => {
          revenue += Number(p.amount);
        });
      });

      return {
        id: svc.id,
        name: svc.name,
        status: svc.status,
        governmentFee: Number(svc.governmentFee),
        serviceFee: Number(svc.serviceFee),
        totalFee: Number(svc.totalFee),
        totalApplications,
        pending,
        approved,
        rejected,
        revenue,
      };
    });

    reportItems.sort((a: any, b: any) => {
      const fieldA = a[sortBy] ?? a.totalApplications;
      const fieldB = b[sortBy] ?? b.totalApplications;
      return sortOrder === 'asc' ? (fieldA > fieldB ? 1 : -1) : (fieldA < fieldB ? 1 : -1);
    });

    return {
      total: reportItems.length,
      items: reportItems,
    };
  }

  // 4. CUSTOMERS REPORT
  async getCustomersReport(filter: ReportFilterDto) {
    const dateFilter = this.getDateFilter(filter.from, filter.to);
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = filter;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (dateFilter) where.createdAt = dateFilter;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items, withAppsCount, withPendingDocsCount] = await Promise.all([
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              applications: true,
              documents: true,
              appointments: true,
            },
          },
        },
      }),
      this.prisma.customer.count({
        where: {
          applications: { some: {} },
        },
      }),
      this.prisma.customer.count({
        where: {
          documents: {
            some: {
              status: { in: [DocumentStatus.ACTION_REQUIRED, DocumentStatus.UNDER_REVIEW] },
            },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      metrics: {
        totalCustomers: total,
        customersWithApplications: withAppsCount,
        customersWithPendingActions: withPendingDocsCount,
      },
      items: items.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        status: c.status,
        applicationsCount: c._count.applications,
        documentsCount: c._count.documents,
        appointmentsCount: c._count.appointments,
        createdAt: c.createdAt,
      })),
    };
  }

  // 5. DOCUMENTS REPORT
  async getDocumentsReport(filter: ReportFilterDto) {
    const dateFilter = this.getDateFilter(filter.from, filter.to);
    const { page = 1, limit = 10, search, sortBy = 'uploadedAt', sortOrder = 'desc' } = filter;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (dateFilter) where.uploadedAt = dateFilter;
    if (search) {
      where.OR = [
        { fileName: { contains: search, mode: 'insensitive' } },
        { documentType: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, items, statusCounts] = await Promise.all([
      this.prisma.document.count({ where }),
      this.prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: { select: { id: true, name: true, email: true } },
          application: { select: { id: true, applicationNumber: true, serviceType: true } },
        },
      }),
      this.prisma.document.groupBy({
        by: ['status'],
        where: dateFilter ? { uploadedAt: dateFilter } : undefined,
        _count: { status: true },
      }),
    ]);

    const statusMap: Record<string, number> = {
      UPLOADED: 0,
      UNDER_REVIEW: 0,
      VERIFIED: 0,
      REJECTED: 0,
      ACTION_REQUIRED: 0,
    };

    statusCounts.forEach((s) => {
      statusMap[s.status] = s._count.status;
    });

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      statusCounts: statusMap,
      items: items.map((d) => ({
        id: d.id,
        fileName: d.fileName,
        documentType: d.documentType,
        status: d.status,
        rejectionReason: d.rejectionReason,
        customerName: d.customer?.name || 'Customer',
        customerEmail: d.customer?.email || '',
        applicationNumber: d.application?.applicationNumber || `AMC-${d.applicationId.slice(0, 8)}`,
        uploadedAt: d.uploadedAt,
      })),
    };
  }

  // 6. APPOINTMENTS REPORT
  async getAppointmentsReport(filter: ReportFilterDto) {
    const dateFilter = this.getDateFilter(filter.from, filter.to);
    const { page = 1, limit = 10, search, serviceId, sortBy = 'appointmentDate', sortOrder = 'desc' } = filter;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (dateFilter) where.appointmentDate = dateFilter;
    if (serviceId) where.serviceId = serviceId;
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { appointmentNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items, statusCounts] = await Promise.all([
      this.prisma.appointment.count({ where }),
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          service: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.appointment.groupBy({
        by: ['status'],
        where: dateFilter || serviceId ? { ...(dateFilter ? { appointmentDate: dateFilter } : {}), ...(serviceId ? { serviceId } : {}) } : undefined,
        _count: { status: true },
      }),
    ]);

    const statusMap: Record<string, number> = {
      CONFIRMED: 0,
      PENDING: 0,
      RESCHEDULED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    statusCounts.forEach((s) => {
      statusMap[s.status] = s._count.status;
    });

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      statusCounts: statusMap,
      items: items.map((apt) => ({
        id: apt.id,
        appointmentNumber: apt.appointmentNumber || `APT-${apt.id.slice(0, 8)}`,
        customerName: apt.customerName,
        customerEmail: apt.customerEmail,
        customerPhone: apt.customerPhone,
        serviceName: apt.service?.name || 'Standard Consultation',
        appointmentDate: apt.appointmentDate,
        mode: apt.mode,
        status: apt.status,
        createdAt: apt.createdAt,
      })),
    };
  }

  // 7. FINANCE REPORT
  async getFinanceReport(filter: ReportFilterDto) {
    const dateFilter = this.getDateFilter(filter.from, filter.to);
    const { serviceId, paymentStatus } = filter;

    const invWhere: any = {};
    if (dateFilter) invWhere.createdAt = dateFilter;
    if (serviceId) invWhere.serviceId = serviceId;
    if (paymentStatus && paymentStatus !== 'ALL') {
      invWhere.status = paymentStatus as InvoiceStatus;
    }

    const [invoices, payments, services] = await Promise.all([
      this.prisma.invoice.findMany({
        where: invWhere,
        include: {
          service: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true, email: true } },
          payments: {
            select: { id: true, amount: true, status: true, paidAt: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.findMany({
        where: {
          status: PaymentStatus.PAID,
          ...(dateFilter ? { paidAt: dateFilter } : {}),
        },
        select: {
          amount: true,
          paidAt: true,
          invoice: {
            select: {
              service: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.service.findMany({
        select: { id: true, name: true },
      }),
    ]);

    let totalBilled = 0;
    let totalCollected = 0;
    let pendingPayments = 0;
    let overduePayments = 0;
    let cancelledPayments = 0;

    const monthlyRevenueMap: Record<string, number> = {};
    const serviceRevenueMap: Record<string, number> = {};

    services.forEach((s) => {
      serviceRevenueMap[s.name] = 0;
    });

    invoices.forEach((inv) => {
      const totalAmt = Number(inv.totalAmount);
      totalBilled += totalAmt;

      const paidForInv = inv.payments
        .filter((p) => p.status === PaymentStatus.PAID)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const uncollected = Math.max(0, totalAmt - paidForInv);

      if (inv.status === InvoiceStatus.UNPAID || inv.status === InvoiceStatus.PARTIALLY_PAID) {
        pendingPayments += uncollected;
      } else if (inv.status === InvoiceStatus.OVERDUE) {
        overduePayments += uncollected;
      } else if (inv.status === InvoiceStatus.CANCELLED) {
        cancelledPayments += totalAmt;
      }
    });

    payments.forEach((p) => {
      const amt = Number(p.amount);
      totalCollected += amt;

      if (p.paidAt) {
        const monthKey = p.paidAt.toISOString().slice(0, 7); // 'YYYY-MM'
        monthlyRevenueMap[monthKey] = (monthlyRevenueMap[monthKey] || 0) + amt;
      }

      const sName = p.invoice?.service?.name || 'General Services';
      serviceRevenueMap[sName] = (serviceRevenueMap[sName] || 0) + amt;
    });

    const outstandingAmount = Math.max(0, totalBilled - totalCollected);

    const monthlyRevenue = Object.keys(monthlyRevenueMap)
      .sort()
      .map((month) => ({
        month,
        revenue: monthlyRevenueMap[month],
      }));

    const revenueByService = Object.keys(serviceRevenueMap)
      .map((serviceName) => ({
        serviceName,
        revenue: serviceRevenueMap[serviceName],
      }))
      .filter((s) => s.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue);

    return {
      totalBilled,
      totalCollected,
      pendingPayments,
      overduePayments,
      cancelledPayments,
      outstandingAmount,
      monthlyRevenue,
      revenueByService,
      invoices: invoices.slice(0, 50).map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customer?.name || 'Customer',
        serviceName: inv.service?.name || 'Service',
        totalAmount: Number(inv.totalAmount),
        status: inv.status,
        createdAt: inv.createdAt,
      })),
    };
  }

  // 8. EXCEL EXPORT GENERATION
  // 8. EXCEL EXPORT GENERATION
  async generateExcelReport(filter: ReportFilterDto): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Amman Communications';
    workbook.lastModifiedBy = 'Amman Communications Admin';
    workbook.created = new Date();

    const [summary, appsReport, servicesReport, customersReport, docsReport, aptsReport, financeReport] =
      await Promise.all([
        this.getSummary(filter),
        this.getApplicationsReport({ ...filter, limit: 5000 }),
        this.getServicesReport(filter),
        this.getCustomersReport({ ...filter, limit: 5000 }),
        this.getDocumentsReport({ ...filter, limit: 5000 }),
        this.getAppointmentsReport({ ...filter, limit: 5000 }),
        this.getFinanceReport(filter),
      ]);

    const headerFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF12372A' },
    };
    const headerFont: Partial<ExcelJS.Font> = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };

    // Helper to add Applications Sheet
    const createAppsSheet = () => {
      const sheet = workbook.addWorksheet('Applications');
      sheet.views = [{ state: 'frozen', ySplit: 1, showGridLines: true }];
      sheet.columns = [
        { header: 'Application Number', key: 'appNo', width: 22 },
        { header: 'Customer Name', key: 'customer', width: 26 },
        { header: 'Customer Email', key: 'email', width: 30 },
        { header: 'Customer Phone', key: 'phone', width: 18 },
        { header: 'Service Name', key: 'service', width: 32 },
        { header: 'Status', key: 'status', width: 20 },
        { header: 'Service Fee (INR)', key: 'fee', width: 18 },
        { header: 'Created Date', key: 'date', width: 18 },
      ];
      appsReport.items.forEach((app, idx) => {
        const row = sheet.addRow({
          appNo: app.applicationNumber,
          customer: app.customerName,
          email: app.customerEmail,
          phone: app.customerPhone || '—',
          service: app.serviceName,
          status: app.status,
          fee: app.serviceFee,
          date: new Date(app.createdAt).toISOString().split('T')[0],
        });
        if (idx % 2 === 1) {
          row.eachCell((c) => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
          });
        }
      });
      return sheet;
    };

    // Helper to add Services Sheet
    const createServicesSheet = () => {
      const sheet = workbook.addWorksheet('Services');
      sheet.views = [{ state: 'frozen', ySplit: 1, showGridLines: true }];
      sheet.columns = [
        { header: 'Service Name', key: 'name', width: 32 },
        { header: 'Status', key: 'status', width: 16 },
        { header: 'Govt Fee (INR)', key: 'govtFee', width: 18 },
        { header: 'Service Fee (INR)', key: 'svcFee', width: 18 },
        { header: 'Total Fee (INR)', key: 'totalFee', width: 18 },
        { header: 'Applications Count', key: 'apps', width: 20 },
        { header: 'Approved Count', key: 'approved', width: 16 },
        { header: 'Rejected Count', key: 'rejected', width: 16 },
        { header: 'Collected Revenue (INR)', key: 'revenue', width: 24 },
      ];
      servicesReport.items.forEach((svc, idx) => {
        const row = sheet.addRow({
          name: svc.name,
          status: svc.status,
          govtFee: svc.governmentFee,
          svcFee: svc.serviceFee,
          totalFee: svc.totalFee,
          apps: svc.totalApplications,
          approved: svc.approved,
          rejected: svc.rejected,
          revenue: svc.revenue,
        });
        if (idx % 2 === 1) {
          row.eachCell((c) => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
          });
        }
      });
      return sheet;
    };

    // Helper to add Customers Sheet
    const createCustomersSheet = () => {
      const sheet = workbook.addWorksheet('Customers');
      sheet.views = [{ state: 'frozen', ySplit: 1, showGridLines: true }];
      sheet.columns = [
        { header: 'Customer Name', key: 'name', width: 28 },
        { header: 'Email Address', key: 'email', width: 32 },
        { header: 'Phone Number', key: 'phone', width: 20 },
        { header: 'Account Status', key: 'status', width: 16 },
        { header: 'Applications Count', key: 'apps', width: 20 },
        { header: 'Documents Count', key: 'docs', width: 18 },
        { header: 'Appointments Count', key: 'apts', width: 20 },
        { header: 'Registered Date', key: 'date', width: 18 },
      ];
      customersReport.items.forEach((c, idx) => {
        const row = sheet.addRow({
          name: c.name,
          email: c.email,
          phone: c.phone || '—',
          status: c.status,
          apps: c.applicationsCount,
          docs: c.documentsCount,
          apts: c.appointmentsCount,
          date: new Date(c.createdAt).toISOString().split('T')[0],
        });
        if (idx % 2 === 1) {
          row.eachCell((c) => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
          });
        }
      });
      return sheet;
    };

    // Helper to add Documents Sheet
    const createDocsSheet = () => {
      const sheet = workbook.addWorksheet('Documents');
      sheet.views = [{ state: 'frozen', ySplit: 1, showGridLines: true }];
      sheet.columns = [
        { header: 'File Name', key: 'fileName', width: 32 },
        { header: 'Document Type', key: 'type', width: 26 },
        { header: 'Application Number', key: 'appNo', width: 24 },
        { header: 'Customer Name', key: 'customer', width: 26 },
        { header: 'Verification Status', key: 'status', width: 20 },
        { header: 'Uploaded Date', key: 'date', width: 18 },
        { header: 'Rejection / Action Reason', key: 'reason', width: 34 },
      ];
      docsReport.items.forEach((d, idx) => {
        const row = sheet.addRow({
          fileName: d.fileName,
          type: d.documentType,
          appNo: d.applicationNumber,
          customer: d.customerName,
          status: d.status,
          date: new Date(d.uploadedAt).toISOString().split('T')[0],
          reason: d.rejectionReason || '—',
        });
        if (idx % 2 === 1) {
          row.eachCell((c) => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
          });
        }
      });
      return sheet;
    };

    // Helper to add Appointments Sheet
    const createAppointmentsSheet = () => {
      const sheet = workbook.addWorksheet('Appointments');
      sheet.views = [{ state: 'frozen', ySplit: 1, showGridLines: true }];
      sheet.columns = [
        { header: 'Appointment #', key: 'aptNo', width: 22 },
        { header: 'Customer Name', key: 'customer', width: 26 },
        { header: 'Customer Email', key: 'email', width: 30 },
        { header: 'Customer Phone', key: 'phone', width: 20 },
        { header: 'Service Name', key: 'service', width: 30 },
        { header: 'Mode', key: 'mode', width: 16 },
        { header: 'Status', key: 'status', width: 16 },
        { header: 'Appointment Date', key: 'date', width: 22 },
      ];
      aptsReport.items.forEach((a, idx) => {
        const row = sheet.addRow({
          aptNo: a.appointmentNumber,
          customer: a.customerName,
          email: a.customerEmail,
          phone: a.customerPhone,
          service: a.serviceName,
          mode: a.mode,
          status: a.status,
          date: new Date(a.appointmentDate).toLocaleString(),
        });
        if (idx % 2 === 1) {
          row.eachCell((c) => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
          });
        }
      });
      return sheet;
    };

    // Helper to add Finance Sheet
    const createFinanceSheet = () => {
      const sheet = workbook.addWorksheet('Finance & Invoices');
      sheet.views = [{ state: 'frozen', ySplit: 1, showGridLines: true }];
      sheet.columns = [
        { header: 'Invoice Number', key: 'invNo', width: 22 },
        { header: 'Customer Name', key: 'customer', width: 26 },
        { header: 'Service Name', key: 'service', width: 30 },
        { header: 'Total Amount (INR)', key: 'amount', width: 20 },
        { header: 'Payment Status', key: 'status', width: 18 },
        { header: 'Invoice Date', key: 'date', width: 18 },
      ];
      financeReport.invoices.forEach((inv, idx) => {
        const row = sheet.addRow({
          invNo: inv.invoiceNumber,
          customer: inv.customerName,
          service: inv.serviceName,
          amount: inv.totalAmount,
          status: inv.status,
          date: new Date(inv.createdAt).toISOString().split('T')[0],
        });
        if (idx % 2 === 1) {
          row.eachCell((c) => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
          });
        }
      });
      return sheet;
    };

    // Helper to add Summary Sheet
    const createSummarySheet = () => {
      const sheet = workbook.addWorksheet('Summary KPIs');
      sheet.views = [{ showGridLines: true }];
      sheet.columns = [
        { header: 'Metric', key: 'metric', width: 34 },
        { header: 'Value', key: 'value', width: 24 },
      ];
      sheet.addRows([
        { metric: 'Total Customers', value: summary.totalCustomers },
        { metric: 'Total Applications', value: summary.totalApplications },
        { metric: 'Active Services', value: summary.activeServices },
        { metric: 'Total Revenue Collected (INR)', value: summary.totalRevenue },
        { metric: 'Total Amount Billed (INR)', value: summary.totalBilled },
        { metric: 'Outstanding Payments (INR)', value: summary.outstandingPayments },
        { metric: 'Pending Applications', value: summary.pendingApplications },
        { metric: 'Pending Documents', value: summary.pendingDocuments },
        { metric: 'Upcoming Appointments', value: summary.upcomingAppointments },
      ]);
      return sheet;
    };

    // Build sheets based on section filter
    const section = filter.section?.toLowerCase();
    const createdSheets: ExcelJS.Worksheet[] = [];

    if (section === 'applications') {
      createdSheets.push(createAppsSheet());
      createdSheets.push(createSummarySheet());
    } else if (section === 'services') {
      createdSheets.push(createServicesSheet());
      createdSheets.push(createSummarySheet());
    } else if (section === 'customers') {
      createdSheets.push(createCustomersSheet());
      createdSheets.push(createSummarySheet());
    } else if (section === 'documents') {
      createdSheets.push(createDocsSheet());
      createdSheets.push(createSummarySheet());
    } else if (section === 'appointments') {
      createdSheets.push(createAppointmentsSheet());
      createdSheets.push(createSummarySheet());
    } else if (section === 'finance') {
      createdSheets.push(createFinanceSheet());
      createdSheets.push(createSummarySheet());
    } else {
      // Overview/All: Sheet 1 is Applications (so records are shown immediately upon opening Excel!)
      createdSheets.push(createAppsSheet());
      createdSheets.push(createServicesSheet());
      createdSheets.push(createCustomersSheet());
      createdSheets.push(createDocsSheet());
      createdSheets.push(createAppointmentsSheet());
      createdSheets.push(createFinanceSheet());
      createdSheets.push(createSummarySheet());
    }

    // Apply uniform styling across all created sheets
    createdSheets.forEach((sheet) => {
      const headerRow = sheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.fill = headerFill;
        cell.font = headerFont;
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      });
      headerRow.height = 28;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  // 9. PDF EXPORT GENERATION
  async generatePdfReport(filter: ReportFilterDto): Promise<Buffer> {
    const [summary, appsReport, servicesReport, customersReport, docsReport, aptsReport, financeReport] =
      await Promise.all([
        this.getSummary(filter),
        this.getApplicationsReport({ ...filter, limit: 5000 }),
        this.getServicesReport(filter),
        this.getCustomersReport({ ...filter, limit: 5000 }),
        this.getDocumentsReport({ ...filter, limit: 5000 }),
        this.getAppointmentsReport({ ...filter, limit: 5000 }),
        this.getFinanceReport(filter),
      ]);

    const section = (filter.section || 'overview').toLowerCase();

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const drawHeaderBanner = (title: string, subtitle: string) => {
        doc.rect(40, 35, 515, 55).fill('#12372A');
        doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold').text('AMMAN COMMUNICATIONS', 55, 45);
        doc.fontSize(9.5).font('Helvetica').text(subtitle || 'Official Management Report', 55, 66);
        doc.fontSize(8.5).text(`Date: ${new Date().toLocaleDateString()}`, 360, 48, { align: 'right', width: 180 });
        if (filter.from || filter.to) {
          doc.fontSize(7.5).text(`Range: ${filter.from || 'Start'} - ${filter.to || 'Present'}`, 360, 62, { align: 'right', width: 180 });
        }
      };

      // 1. APPLICATIONS SECTION PDF
      if (section === 'applications') {
        drawHeaderBanner('Applications Report', 'Applications & Services Fulfillment Directory');

        // Status KPIs row
        let curY = 100;
        doc.fillColor('#12372A').fontSize(12).font('Helvetica-Bold').text('Applications Summary', 40, curY);
        curY += 16;

        const kpis = [
          { label: 'Total Apps', val: String(appsReport.total) },
          { label: 'Submitted', val: String(appsReport.statusCounts.SUBMITTED || 0) },
          { label: 'Under Review', val: String(appsReport.statusCounts.UNDER_REVIEW || 0) },
          { label: 'Approved', val: String(appsReport.statusCounts.APPROVED || 0) },
          { label: 'Rejected', val: String(appsReport.statusCounts.REJECTED || 0) },
        ];

        let kX = 40;
        kpis.forEach((k) => {
          doc.rect(kX, curY, 97, 36).fillAndStroke('#F9FAFB', '#E5E7EB');
          doc.fillColor('#6B7280').fontSize(7.5).font('Helvetica-Bold').text(k.label.toUpperCase(), kX + 6, curY + 6, { width: 85 });
          doc.fillColor('#12372A').fontSize(11).font('Helvetica-Bold').text(k.val, kX + 6, curY + 18, { width: 85 });
          kX += 104;
        });

        curY += 46;
        doc.fillColor('#12372A').fontSize(12).font('Helvetica-Bold').text('Application Records', 40, curY);
        curY += 16;

        const drawAppTableHeader = (y: number) => {
          doc.rect(40, y, 515, 18).fill('#12372A');
          doc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica-Bold');
          doc.text('APPLICATION #', 45, y + 5);
          doc.text('CUSTOMER / EMAIL', 135, y + 5);
          doc.text('SERVICE', 255, y + 5);
          doc.text('STATUS', 375, y + 5);
          doc.text('FEE (INR)', 445, y + 5);
          doc.text('DATE', 505, y + 5);
        };

        drawAppTableHeader(curY);
        curY += 18;

        appsReport.items.forEach((app, idx) => {
          if (curY + 22 > 760) {
            doc.addPage({ margin: 40, size: 'A4' });
            drawHeaderBanner('Applications Report', 'Applications Directory (Continued)');
            curY = 100;
            drawAppTableHeader(curY);
            curY += 18;
          }

          const bg = idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
          doc.rect(40, curY, 515, 20).fill(bg);

          doc.fillColor('#111827').fontSize(7.5).font('Helvetica-Bold').text(app.applicationNumber, 45, curY + 4);
          doc.fillColor('#1F2937').fontSize(7).font('Helvetica').text(app.customerName, 135, curY + 3, { width: 115, lineBreak: false });
          doc.fillColor('#6B7280').fontSize(6).text(app.customerEmail || '', 135, curY + 11, { width: 115, lineBreak: false });
          doc.fillColor('#374151').fontSize(7).font('Helvetica').text(app.serviceName, 255, curY + 5, { width: 115, lineBreak: false });
          doc.fillColor('#12372A').fontSize(7).font('Helvetica-Bold').text(app.status, 375, curY + 5);
          doc.fillColor('#111827').fontSize(7).font('Helvetica').text(`INR ${Number(app.serviceFee).toLocaleString('en-IN')}`, 445, curY + 5);
          doc.fillColor('#6B7280').fontSize(7).text(new Date(app.createdAt).toISOString().split('T')[0], 505, curY + 5);

          curY += 20;
        });
      }

      // 2. SERVICES SECTION PDF
      else if (section === 'services') {
        drawHeaderBanner('Services Report', 'Services & Revenue Performance');
        let curY = 105;

        const drawSvcTableHeader = (y: number) => {
          doc.rect(40, y, 515, 18).fill('#12372A');
          doc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica-Bold');
          doc.text('SERVICE NAME', 45, y + 5);
          doc.text('STATUS', 210, y + 5);
          doc.text('FEE (INR)', 270, y + 5);
          doc.text('APPS', 345, y + 5);
          doc.text('APPROVED', 395, y + 5);
          doc.text('REVENUE (INR)', 455, y + 5);
        };

        drawSvcTableHeader(curY);
        curY += 18;

        servicesReport.items.forEach((s, idx) => {
          if (curY + 20 > 760) {
            doc.addPage({ margin: 40, size: 'A4' });
            drawHeaderBanner('Services Report', 'Services Performance (Continued)');
            curY = 100;
            drawSvcTableHeader(curY);
            curY += 18;
          }

          const bg = idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
          doc.rect(40, curY, 515, 18).fill(bg);
          doc.fillColor('#111827').fontSize(7.5).font('Helvetica').text(s.name, 45, curY + 5, { width: 160, lineBreak: false });
          doc.fillColor('#12372A').fontSize(7).font('Helvetica-Bold').text(s.status, 210, curY + 5);
          doc.fillColor('#374151').fontSize(7).text(`INR ${Number(s.totalFee).toLocaleString('en-IN')}`, 270, curY + 5);
          doc.text(String(s.totalApplications), 345, curY + 5);
          doc.text(String(s.approved), 395, curY + 5);
          doc.fillColor('#12372A').fontSize(7.5).font('Helvetica-Bold').text(`INR ${Number(s.revenue).toLocaleString('en-IN')}`, 455, curY + 5);

          curY += 18;
        });
      }

      // 3. CUSTOMERS SECTION PDF
      else if (section === 'customers') {
        drawHeaderBanner('Customers Report', 'Registered Customer Directory');
        let curY = 105;

        const drawCustTableHeader = (y: number) => {
          doc.rect(40, y, 515, 18).fill('#12372A');
          doc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica-Bold');
          doc.text('CUSTOMER NAME', 45, y + 5);
          doc.text('EMAIL / PHONE', 170, y + 5);
          doc.text('STATUS', 315, y + 5);
          doc.text('APPS', 370, y + 5);
          doc.text('DOCS', 415, y + 5);
          doc.text('JOINED DATE', 460, y + 5);
        };

        drawCustTableHeader(curY);
        curY += 18;

        customersReport.items.forEach((c, idx) => {
          if (curY + 22 > 760) {
            doc.addPage({ margin: 40, size: 'A4' });
            drawHeaderBanner('Customers Report', 'Customer Directory (Continued)');
            curY = 100;
            drawCustTableHeader(curY);
            curY += 18;
          }

          const bg = idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
          doc.rect(40, curY, 515, 20).fill(bg);
          doc.fillColor('#111827').fontSize(7.5).font('Helvetica-Bold').text(c.name, 45, curY + 5, { width: 120, lineBreak: false });
          doc.fillColor('#374151').fontSize(7).font('Helvetica').text(c.email || '—', 170, curY + 3, { width: 140, lineBreak: false });
          doc.fillColor('#6B7280').fontSize(6.5).text(c.phone || '—', 170, curY + 11);
          doc.fillColor('#12372A').fontSize(7).font('Helvetica-Bold').text(c.status, 315, curY + 5);
          doc.fillColor('#374151').fontSize(7).font('Helvetica').text(String(c.applicationsCount), 370, curY + 5);
          doc.text(String(c.documentsCount), 415, curY + 5);
          doc.fillColor('#6B7280').fontSize(7).text(new Date(c.createdAt).toISOString().split('T')[0], 460, curY + 5);

          curY += 20;
        });
      }

      // 4. DOCUMENTS SECTION PDF
      else if (section === 'documents') {
        drawHeaderBanner('Documents Report', 'Document Verification & Review Queue');
        let curY = 105;

        const drawDocTableHeader = (y: number) => {
          doc.rect(40, y, 515, 18).fill('#12372A');
          doc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica-Bold');
          doc.text('DOCUMENT NAME', 45, y + 5);
          doc.text('TYPE', 175, y + 5);
          doc.text('APP NUMBER', 260, y + 5);
          doc.text('CUSTOMER', 345, y + 5);
          doc.text('STATUS', 440, y + 5);
          doc.text('DATE', 495, y + 5);
        };

        drawDocTableHeader(curY);
        curY += 18;

        docsReport.items.forEach((d, idx) => {
          if (curY + 20 > 760) {
            doc.addPage({ margin: 40, size: 'A4' });
            drawHeaderBanner('Documents Report', 'Documents Queue (Continued)');
            curY = 100;
            drawDocTableHeader(curY);
            curY += 18;
          }

          const bg = idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
          doc.rect(40, curY, 515, 18).fill(bg);
          doc.fillColor('#111827').fontSize(7).font('Helvetica').text(d.fileName, 45, curY + 5, { width: 125, lineBreak: false });
          doc.text(d.documentType, 175, curY + 5, { width: 80, lineBreak: false });
          doc.text(d.applicationNumber, 260, curY + 5, { width: 80, lineBreak: false });
          doc.text(d.customerName, 345, curY + 5, { width: 90, lineBreak: false });
          doc.fillColor('#12372A').fontSize(7).font('Helvetica-Bold').text(d.status, 440, curY + 5);
          doc.fillColor('#6B7280').fontSize(7).font('Helvetica').text(new Date(d.uploadedAt).toISOString().split('T')[0], 495, curY + 5);

          curY += 18;
        });
      }

      // 5. APPOINTMENTS SECTION PDF
      else if (section === 'appointments') {
        drawHeaderBanner('Appointments Report', 'Consultation & Appointment Schedule');
        let curY = 105;

        const drawAptTableHeader = (y: number) => {
          doc.rect(40, y, 515, 18).fill('#12372A');
          doc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica-Bold');
          doc.text('APPOINTMENT #', 45, y + 5);
          doc.text('CUSTOMER', 145, y + 5);
          doc.text('SERVICE', 255, y + 5);
          doc.text('MODE', 365, y + 5);
          doc.text('STATUS', 415, y + 5);
          doc.text('DATE & TIME', 465, y + 5);
        };

        drawAptTableHeader(curY);
        curY += 18;

        aptsReport.items.forEach((a, idx) => {
          if (curY + 20 > 760) {
            doc.addPage({ margin: 40, size: 'A4' });
            drawHeaderBanner('Appointments Report', 'Appointments Schedule (Continued)');
            curY = 100;
            drawAptTableHeader(curY);
            curY += 18;
          }

          const bg = idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
          doc.rect(40, curY, 515, 18).fill(bg);
          doc.fillColor('#111827').fontSize(7.5).font('Helvetica-Bold').text(a.appointmentNumber, 45, curY + 5);
          doc.fillColor('#374151').fontSize(7).font('Helvetica').text(a.customerName, 145, curY + 5, { width: 105, lineBreak: false });
          doc.text(a.serviceName, 255, curY + 5, { width: 105, lineBreak: false });
          doc.text(a.mode, 365, curY + 5);
          doc.fillColor('#12372A').fontSize(7).font('Helvetica-Bold').text(a.status, 415, curY + 5);
          doc.fillColor('#6B7280').fontSize(6.5).font('Helvetica').text(new Date(a.appointmentDate).toLocaleString(), 465, curY + 5, { width: 85 });

          curY += 18;
        });
      }

      // 6. FINANCE SECTION PDF
      else if (section === 'finance') {
        drawHeaderBanner('Financial Report', 'Revenue, Invoices & Billing Summary');

        let curY = 105;
        const finKpis = [
          { label: 'Total Billed', val: `INR ${financeReport.totalBilled.toLocaleString('en-IN')}` },
          { label: 'Collected Revenue', val: `INR ${financeReport.totalCollected.toLocaleString('en-IN')}` },
          { label: 'Pending Balance', val: `INR ${financeReport.pendingPayments.toLocaleString('en-IN')}` },
          { label: 'Net Outstanding', val: `INR ${financeReport.outstandingAmount.toLocaleString('en-IN')}` },
        ];

        let fX = 40;
        finKpis.forEach((f) => {
          doc.rect(fX, curY, 122, 38).fillAndStroke('#F9FAFB', '#E5E7EB');
          doc.fillColor('#6B7280').fontSize(7.5).font('Helvetica-Bold').text(f.label.toUpperCase(), fX + 8, curY + 6, { width: 106 });
          doc.fillColor('#12372A').fontSize(11).font('Helvetica-Bold').text(f.val, fX + 8, curY + 19, { width: 106 });
          fX += 131;
        });

        curY += 50;
        doc.fillColor('#12372A').fontSize(12).font('Helvetica-Bold').text('Recent Invoices', 40, curY);
        curY += 16;

        const drawInvTableHeader = (y: number) => {
          doc.rect(40, y, 515, 18).fill('#12372A');
          doc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica-Bold');
          doc.text('INVOICE #', 45, y + 5);
          doc.text('CUSTOMER', 150, y + 5);
          doc.text('SERVICE', 265, y + 5);
          doc.text('AMOUNT (INR)', 385, y + 5);
          doc.text('STATUS', 455, y + 5);
          doc.text('DATE', 505, y + 5);
        };

        drawInvTableHeader(curY);
        curY += 18;

        financeReport.invoices.forEach((inv, idx) => {
          if (curY + 20 > 760) {
            doc.addPage({ margin: 40, size: 'A4' });
            drawHeaderBanner('Financial Report', 'Invoices (Continued)');
            curY = 100;
            drawInvTableHeader(curY);
            curY += 18;
          }

          const bg = idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
          doc.rect(40, curY, 515, 18).fill(bg);
          doc.fillColor('#111827').fontSize(7.5).font('Helvetica-Bold').text(inv.invoiceNumber, 45, curY + 5);
          doc.fillColor('#374151').fontSize(7).font('Helvetica').text(inv.customerName, 150, curY + 5, { width: 110, lineBreak: false });
          doc.text(inv.serviceName, 265, curY + 5, { width: 115, lineBreak: false });
          doc.fillColor('#111827').fontSize(7.5).font('Helvetica-Bold').text(`INR ${inv.totalAmount.toLocaleString('en-IN')}`, 385, curY + 5);
          doc.fillColor('#12372A').fontSize(7).font('Helvetica-Bold').text(inv.status, 455, curY + 5);
          doc.fillColor('#6B7280').fontSize(7).font('Helvetica').text(new Date(inv.createdAt).toISOString().split('T')[0], 505, curY + 5);

          curY += 18;
        });
      }

      // 7. OVERVIEW SECTION (DEFAULT)
      else {
        drawHeaderBanner('Executive Report', 'Official Management & Performance Overview');

        doc.fillColor('#12372A').fontSize(12).font('Helvetica-Bold').text('Executive Summary', 40, 102);
        doc.rect(40, 116, 515, 1).fill('#12372A');

        const metrics = [
          { label: 'Total Customers', val: String(summary.totalCustomers) },
          { label: 'Total Applications', val: String(summary.totalApplications) },
          { label: 'Active Services', val: String(summary.activeServices) },
          { label: 'Total Revenue', val: `INR ${summary.totalRevenue.toLocaleString('en-IN')}` },
          { label: 'Pending Apps', val: String(summary.pendingApplications) },
          { label: 'Pending Docs', val: String(summary.pendingDocuments) },
          { label: 'Upcoming Appts', val: String(summary.upcomingAppointments) },
          { label: 'Outstanding Balance', val: `INR ${summary.outstandingPayments.toLocaleString('en-IN')}` },
        ];

        let cardX = 40;
        let cardY = 124;
        metrics.forEach((m, idx) => {
          doc.rect(cardX, cardY, 120, 36).fillAndStroke('#F9FAFB', '#E5E7EB');
          doc.fillColor('#6B7280').fontSize(7).font('Helvetica-Bold').text(m.label.toUpperCase(), cardX + 6, cardY + 5, { width: 108 });
          doc.fillColor('#12372A').fontSize(10).font('Helvetica-Bold').text(m.val, cardX + 6, cardY + 18, { width: 108 });
          cardX += 131;
          if ((idx + 1) % 4 === 0) {
            cardX = 40;
            cardY += 42;
          }
        });

        // Application Records Table (Multi-page with all records)
        let curY = cardY + 15;
        doc.fillColor('#12372A').fontSize(12).font('Helvetica-Bold').text('Application Records', 40, curY);
        curY += 16;

        const drawAppOverviewHeader = (y: number) => {
          doc.rect(40, y, 515, 18).fill('#12372A');
          doc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica-Bold');
          doc.text('APPLICATION #', 45, y + 5);
          doc.text('CUSTOMER / EMAIL', 135, y + 5);
          doc.text('SERVICE', 255, y + 5);
          doc.text('STATUS', 375, y + 5);
          doc.text('FEE (INR)', 445, y + 5);
          doc.text('DATE', 505, y + 5);
        };

        drawAppOverviewHeader(curY);
        curY += 18;

        appsReport.items.forEach((app, idx) => {
          if (curY + 22 > 760) {
            doc.addPage({ margin: 40, size: 'A4' });
            drawHeaderBanner('Executive Report', 'Applications Directory (Continued)');
            curY = 100;
            drawAppOverviewHeader(curY);
            curY += 18;
          }

          const bg = idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
          doc.rect(40, curY, 515, 20).fill(bg);
          doc.fillColor('#111827').fontSize(7.5).font('Helvetica-Bold').text(app.applicationNumber, 45, curY + 4);
          doc.fillColor('#1F2937').fontSize(7).font('Helvetica').text(app.customerName, 135, curY + 3, { width: 115, lineBreak: false });
          doc.fillColor('#6B7280').fontSize(6).text(app.customerEmail || '', 135, curY + 11, { width: 115, lineBreak: false });
          doc.fillColor('#374151').fontSize(7).font('Helvetica').text(app.serviceName, 255, curY + 5, { width: 115, lineBreak: false });
          doc.fillColor('#12372A').fontSize(7).font('Helvetica-Bold').text(app.status, 375, curY + 5);
          doc.fillColor('#111827').fontSize(7).font('Helvetica').text(`INR ${Number(app.serviceFee).toLocaleString('en-IN')}`, 445, curY + 5);
          doc.fillColor('#6B7280').fontSize(7).text(new Date(app.createdAt).toISOString().split('T')[0], 505, curY + 5);

          curY += 20;
        });
      }

      // Add page numbers on all buffered pages before finalizing document
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.fillColor('#9CA3AF').fontSize(8).text(
          `Confidential - Amman Communications MIS  |  Page ${i + 1} of ${range.count}`,
          40,
          785,
          { align: 'center', width: 515 }
        );
      }

      doc.end();
    });
  }
}

