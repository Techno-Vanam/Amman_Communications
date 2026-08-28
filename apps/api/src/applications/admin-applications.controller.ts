import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
export class AdminApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
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
  }
}
