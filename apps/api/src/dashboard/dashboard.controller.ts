import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { CustomerAuthGuard } from '../auth/guards/customer-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiBearerAuth()
@Controller('admin/dashboard')
@UseGuards(AdminAuthGuard)
export class AdminDashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('summary')
  async summary() {
    const [customers, applications, documents] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.application.count(),
      this.prisma.document.count(),
    ]);
    return { customers, applications, documents };
  }
}

@ApiBearerAuth()
@Controller('customer/dashboard')
@UseGuards(CustomerAuthGuard)
export class CustomerDashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('summary')
  async summary(@Req() request: { user: { sub: string } }) {
    const customerId = request.user.sub;
    const [applications, documents] = await Promise.all([
      this.prisma.application.count({ where: { customerId } }),
      this.prisma.document.count({ where: { customerId } }),
    ]);
    return { applications, documents };
  }
}
