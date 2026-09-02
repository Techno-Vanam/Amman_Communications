import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppointmentMode } from '@prisma/client';

import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Admin - Appointments')
@ApiBearerAuth()
@Controller(['admin/appointments', 'v1/admin/appointments', 'api/v1/admin/appointments'])
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get Appointment Statistics' })
  async getStats() {
    return this.appointmentsService.getStats();
  }

  @Get()
  @ApiOperation({ summary: 'List Appointments' })
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('mode') mode?: AppointmentMode,
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('timeframe') timeframe?: 'today' | 'upcoming' | 'past' | 'all',
  ) {
    return this.appointmentsService.findAll({
      search,
      status,
      mode,
      date,
      startDate,
      endDate,
      timeframe,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Appointment Details' })
  async findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create New Appointment' })
  async create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Appointment Details' })
  async update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, dto);
  }

  @Patch(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule Appointment' })
  async reschedule(@Param('id') id: string, @Body() dto: RescheduleAppointmentDto) {
    return this.appointmentsService.reschedule(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update Appointment Status' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateAppointmentStatusDto) {
    return this.appointmentsService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel/Delete Appointment' })
  async remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
