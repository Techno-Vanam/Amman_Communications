import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ManualSalesService } from './manual-sales.service';
import { CreateManualSaleDto } from './dto/manual-sale.dto';

@ApiTags('Admin - Finance - Manual Sales')
@ApiBearerAuth()
@Controller('admin/finance/manual-sales')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ManualSalesController {
  constructor(private readonly manualSalesService: ManualSalesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new manual sale (e.g. walk-in customer)' })
  async create(@Body() dto: CreateManualSaleDto) {
    return this.manualSalesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all manual sales' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by customer name or sale number' })
  async findAll(@Query('search') search?: string) {
    return this.manualSalesService.findAll({ search });
  }
}
