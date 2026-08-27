import { Controller, Get, NotFoundException, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomerAuthGuard } from '../auth/guards/customer-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Customer Profile')
@ApiBearerAuth()
@Controller('customer/me')
@UseGuards(CustomerAuthGuard)
export class CustomerMeController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get authenticated customer profile' })
  @ApiResponse({ status: 200, description: 'Returns authenticated customer profile details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req: { user: { customerId: string } }) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: req.user.customerId },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        contactNumber: true,
        createdAt: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    return customer;
  }
}
