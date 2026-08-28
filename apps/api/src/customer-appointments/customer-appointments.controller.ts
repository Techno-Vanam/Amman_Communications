import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CustomerAppointmentsService } from './customer-appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { GetAppointmentsDto } from './dto/get-appointments.dto';
import { CompleteDocumentUploadDto, CreateUploadUrlDto } from './dto/upload-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';


interface RequestWithUser {
  user: {
    customerId?: string;
    sub?: string;
    role?: string;
  };
}

@ApiTags('Customer - Appointments')
@ApiBearerAuth()
@Controller('customer')
export class CustomerAppointmentsController {
  constructor(private readonly appointmentsService: CustomerAppointmentsService) {}

  @Get('services')
  async getServices() {
    return this.appointmentsService.getServices();
  }

  @Get('offices')
  async getOffices() {
    return this.appointmentsService.getOffices();
  }

  @Post('appointments')
  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER')
  async createAppointment(
    @Req() req: RequestWithUser,
    @Body() dto: CreateAppointmentDto,
  ) {
    const customerId = req.user.customerId || req.user.sub;
    if (!customerId) throw new Error('Customer ID missing from session');
    return this.appointmentsService.createAppointment(customerId, dto);
  }

  @Post('appointments/:id/documents/upload-url')
  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER')
  async createDocumentUploadUrl(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: CreateUploadUrlDto,
  ) {
    const customerId = req.user.customerId || req.user.sub;
    if (!customerId) throw new Error('Customer ID missing from session');
    return this.appointmentsService.createDocumentUploadUrl(customerId, id, dto);
  }

  @Post('appointments/:id/documents')
  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER')
  async completeDocumentUpload(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: CompleteDocumentUploadDto,
  ) {
    const customerId = req.user.customerId || req.user.sub;
    if (!customerId) throw new Error('Customer ID missing from session');
    return this.appointmentsService.completeDocumentUpload(customerId, id, dto);
  }

  @Get('appointments')
  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER')
  async getAppointments(
    @Req() req: RequestWithUser,
    @Query() query: GetAppointmentsDto,
  ) {
    const customerId = req.user.customerId || req.user.sub;
    if (!customerId) throw new Error('Customer ID missing from session');
    return this.appointmentsService.getAppointments(customerId, query);
  }

  @Get('appointments/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER')
  async getAppointmentDetail(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    const customerId = req.user.customerId || req.user.sub;
    if (!customerId) throw new Error('Customer ID missing from session');
    return this.appointmentsService.getAppointmentDetail(customerId, id);
  }

  @Delete('appointments/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER')
  async cancelAppointment(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    const customerId = req.user.customerId || req.user.sub;
    if (!customerId) throw new Error('Customer ID missing from session');
    return this.appointmentsService.cancelAppointment(customerId, id);
  }
}
