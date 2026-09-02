<<<<<<< HEAD
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
=======
>>>>>>> origin/backend-merge
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
<<<<<<< HEAD
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ApplicationsService } from './applications.service';
import { AdminCreateApplicationDto } from './dto/admin-create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';


@ApiTags('Admin - Applications')
@ApiBearerAuth()
@Controller('admin/applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
=======
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { ApplicationsService } from './applications.service';

@ApiTags('Admin - Applications')
@ApiBearerAuth()
@Controller(['v1/admin/applications-management', 'api/v1/admin/applications-management', 'admin/applications-management'])
@UseGuards(AdminAuthGuard)
>>>>>>> origin/backend-merge
export class AdminApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
<<<<<<< HEAD
  async getApplications(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.applicationsService.adminGetApplications(search, status, pageNumber, limitNumber);
  }

  @Post()
  @ApiOperation({ summary: 'Admin creates an application for a customer' })
  async create(@Body() dto: AdminCreateApplicationDto) {
    return this.applicationsService.adminCreateApplication(dto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update application status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ApplicationStatus,
  ) {
    return this.applicationsService.adminUpdateApplicationStatus(id, status);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Patch application status (alias for PUT)' })
  async patchStatus(
    @Param('id') id: string,
    @Body('status') status: ApplicationStatus,
    @Body('notes') notes?: string,
  ) {
    return this.applicationsService.adminUpdateApplicationStatus(id, status, notes);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an application fully' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applicationsService.adminUpdateApplication(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single application by ID' })
  async findOne(@Param('id') id: string) {
    return this.applicationsService.adminGetApplicationById(id);
  }

  @Get(':id/documents')
  @ApiOperation({ summary: 'Get documents for application' })
  async getDocuments(@Param('id') id: string) {
    return this.applicationsService.getApplicationDocuments(id);
=======
  async listApplications(
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.applicationsService.adminListApplications({ search, status });
  }

  @Get(':id')
  async getApplicationById(@Param('id') id: string) {
    return this.applicationsService.adminGetApplicationById(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.applicationsService.adminUpdateApplicationStatus(id, status);
>>>>>>> origin/backend-merge
  }
}
