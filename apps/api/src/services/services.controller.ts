import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ServiceStatus } from '@prisma/client';

import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceStatusDto } from './dto/update-service-status.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';


@ApiTags('Admin - Services')
@ApiBearerAuth()
@Controller('admin/services')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get Service Statistics' })
  async getStats() {
    return this.servicesService.getStats();
  }

  @Get()
  @ApiOperation({ summary: 'List Services' })
  async findAll(@Query('search') search?: string, @Query('status') status?: ServiceStatus) {
    return this.servicesService.findAll(search, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Service Details' })
  async findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create New Service' })
  @ApiResponse({ status: 201, description: 'Service created successfully.' })
  async create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Service Details' })
  async update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update Service Status' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateServiceStatusDto) {
    return this.servicesService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Service' })
  async remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
