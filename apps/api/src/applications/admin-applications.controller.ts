import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { ApplicationsService } from './applications.service';
import { ApplicationStatus } from '@prisma/client';

@ApiTags('Admin - Applications')
@ApiBearerAuth()
@Controller('admin/applications')
@UseGuards(AdminAuthGuard)
export class AdminApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
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

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ApplicationStatus,
  ) {
    return this.applicationsService.adminUpdateApplicationStatus(id, status);
  }
}
