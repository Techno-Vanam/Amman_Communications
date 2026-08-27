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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CustomerAuthGuard } from '../auth/guards/customer-auth.guard';
import { CustomerAppointmentsService } from './customer-appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { GetAppointmentsDto } from './dto/get-appointments.dto';
import { CompleteDocumentUploadDto, CreateUploadUrlDto } from './dto/upload-document.dto';

@ApiTags('Customer Appointments')
@ApiBearerAuth()
@Controller('customer')
@UseGuards(CustomerAuthGuard)
export class CustomerAppointmentsController {
  constructor(private readonly appointmentsService: CustomerAppointmentsService) {}

  @Get('services')
  @ApiOperation({ summary: 'List active services available for booking' })
  @ApiResponse({ status: 200, description: 'List of active services' })
  async getServices() {
    return this.appointmentsService.getServices();
  }

  @Get('offices')
  @ApiOperation({ summary: 'List active office locations' })
  @ApiResponse({ status: 200, description: 'List of active offices' })
  async getOffices() {
    return this.appointmentsService.getOffices();
  }

  @Post('appointments')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Book a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed or invalid parameters' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async createAppointment(
    @Req() req: { user: { customerId: string } },
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.createAppointment(req.user.customerId, dto);
  }

  @Post('appointments/:id/documents/upload-url')
  @ApiOperation({ summary: 'Generate short-lived signed URL for document upload' })
  @ApiResponse({ status: 200, description: 'Signed upload URL generated' })
  @ApiResponse({ status: 400, description: 'Unsupported file type or size' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async createDocumentUploadUrl(
    @Req() req: { user: { customerId: string } },
    @Param('id') id: string,
    @Body() dto: CreateUploadUrlDto,
  ) {
    return this.appointmentsService.createDocumentUploadUrl(req.user.customerId, id, dto);
  }

  @Post('appointments/:id/documents')
  @ApiOperation({ summary: 'Complete document upload and link to appointment' })
  @ApiResponse({ status: 201, description: 'Document linked to appointment' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async completeDocumentUpload(
    @Req() req: { user: { customerId: string } },
    @Param('id') id: string,
    @Body() dto: CompleteDocumentUploadDto,
  ) {
    return this.appointmentsService.completeDocumentUpload(req.user.customerId, id, dto);
  }

  @Get('appointments')
  @ApiOperation({ summary: "List logged-in customer's appointments" })
  @ApiResponse({ status: 200, description: 'List of customer appointments' })
  async getAppointments(
    @Req() req: { user: { customerId: string } },
    @Query() query: GetAppointmentsDto,
  ) {
    return this.appointmentsService.getAppointments(req.user.customerId, query);
  }

  @Get('appointments/:id')
  @ApiOperation({ summary: 'Get single appointment detail by ID' })
  @ApiResponse({ status: 200, description: 'Appointment details' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async getAppointmentDetail(
    @Req() req: { user: { customerId: string } },
    @Param('id') id: string,
  ) {
    return this.appointmentsService.getAppointmentDetail(req.user.customerId, id);
  }

  @Delete('appointments/:id')
  @ApiOperation({ summary: 'Cancel own appointment (only PENDING or CONFIRMED status allowed)' })
  @ApiResponse({ status: 200, description: 'Appointment cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel appointment' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async cancelAppointment(
    @Req() req: { user: { customerId: string } },
    @Param('id') id: string,
  ) {
    return this.appointmentsService.cancelAppointment(req.user.customerId, id);
  }
}
