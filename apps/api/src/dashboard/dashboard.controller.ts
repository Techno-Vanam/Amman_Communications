import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { CustomerAuthGuard } from '../auth/guards/customer-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Admin - Dashboard')
@ApiBearerAuth()
@Controller('admin/dashboard')
@UseGuards(AdminAuthGuard)
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
}

@ApiTags('Customer - Dashboard')
@ApiBearerAuth()
@Controller('customer/dashboard')
@UseGuards(CustomerAuthGuard)
export class CustomerDashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get summary statistics for the customer dashboard' })
  async summary(@Req() request: { user: { sub: string } }) {
    const customerId = request.user.sub;
    const [applications, documents] = await Promise.all([
      this.prisma.application.count({ where: { customerId } }),
      this.prisma.document.count({ where: { customerId } }),
    ]);
    return { applications, documents };
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get customer profile details' })
  async profile(@Req() request: { user: { sub: string } }) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: request.user.sub },
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
  async me(@Req() request: { user: { sub: string } }) {
    return this.profile(request);
  }
}
