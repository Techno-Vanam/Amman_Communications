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
import { CustomerAuthGuard } from '../auth/guards/customer-auth.guard';
import { CustomerAppointmentsService } from './customer-appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { GetAppointmentsDto } from './dto/get-appointments.dto';
import { CompleteDocumentUploadDto, CreateUploadUrlDto } from './dto/upload-document.dto';

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
  @UseGuards(CustomerAuthGuard)
  async createAppointment(
    @Req() req: RequestWithUser,
    @Body() dto: CreateAppointmentDto,
  ) {
    const customerId = req.user.customerId || req.user.sub;
    if (!customerId) throw new Error('Customer ID missing from session');
    return this.appointmentsService.createAppointment(customerId, dto);
  }

  @Post('appointments/:id/documents/upload-url')
  @UseGuards(CustomerAuthGuard)
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
  @UseGuards(CustomerAuthGuard)
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
  @UseGuards(CustomerAuthGuard)
  async getAppointments(
    @Req() req: RequestWithUser,
    @Query() query: GetAppointmentsDto,
  ) {
    const customerId = req.user.customerId || req.user.sub;
    if (!customerId) throw new Error('Customer ID missing from session');
    return this.appointmentsService.getAppointments(customerId, query);
  }

  @Get('appointments/:id')
  @UseGuards(CustomerAuthGuard)
  async getAppointmentDetail(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    const customerId = req.user.customerId || req.user.sub;
    if (!customerId) throw new Error('Customer ID missing from session');
    return this.appointmentsService.getAppointmentDetail(customerId, id);
  }

  @Delete('appointments/:id')
  @UseGuards(CustomerAuthGuard)
  async cancelAppointment(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    const customerId = req.user.customerId || req.user.sub;
    if (!customerId) throw new Error('Customer ID missing from session');
    return this.appointmentsService.cancelAppointment(customerId, id);
  }
}
