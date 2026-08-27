import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ServiceStatus } from '@prisma/client';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceStatusDto } from './dto/update-service-status.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';

@Controller(['v1/admin/services', 'api/v1/admin/services', 'admin/services'])
@UseGuards(AdminAuthGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('stats')
  async getStats() {
    return this.servicesService.getStats();
  }

  @Get()
  async findAll(@Query('search') search?: string, @Query('status') status?: ServiceStatus) {
    return this.servicesService.findAll(search, status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateServiceStatusDto) {
    return this.servicesService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
