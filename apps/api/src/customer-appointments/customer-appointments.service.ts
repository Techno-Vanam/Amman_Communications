import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, AppointmentType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentNumberService } from './appointment-number.service';
import { CreateCustomerAppointmentDto } from './dto/create-appointment.dto';
import { GetAppointmentsDto } from './dto/get-appointments.dto';
import { CompleteDocumentUploadDto, CreateUploadUrlDto } from './dto/upload-document.dto';

@Injectable()
export class CustomerAppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly appointmentNumberService: AppointmentNumberService,
  ) {}

  async getServices() {
    // Only return services that have status = 'ACTIVE' set by the Admin
    const services = await this.prisma.service.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });

    return services;
  }

  async getOffices() {
    let offices = await this.prisma.office.findMany({
      where: { isActive: true },
    });

    if (offices.length === 0) {
      const defaultOffice = await this.prisma.office.upsert({
        where: { id: '22222222-0000-4000-8000-000000000001' },
        update: { isActive: true },
        create: {
          id: '22222222-0000-4000-8000-000000000001',
          name: 'Amman Head Office - Zahran St',
          address: 'Building 12, 4th Circle, Zahran St, Amman',
          isActive: true,
        },
      });
      return [defaultOffice];
    }

    return offices;
  }

  async createAppointment(customerId: string, dto: CreateCustomerAppointmentDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });

    if (!service) {
      throw new NotFoundException('Selected service not found');
    }

    let targetOfficeId: string | null = null;

    if (dto.appointmentType === AppointmentType.OFFICE_VISIT) {
      if (dto.officeId) {
        const existingOffice = await this.prisma.office.findUnique({
          where: { id: dto.officeId },
        });
        if (existingOffice) {
          targetOfficeId = existingOffice.id;
        } else {
          const defaultOffice = await this.prisma.office.upsert({
            where: { id: '22222222-0000-4000-8000-000000000001' },
            update: { isActive: true },
            create: {
              id: '22222222-0000-4000-8000-000000000001',
              name: 'Amman Head Office - Zahran St',
              address: 'Building 12, 4th Circle, Zahran St, Amman',
              isActive: true,
            },
          });
          targetOfficeId = defaultOffice.id;
        }
      } else {
        const offices = await this.getOffices();
        targetOfficeId = offices[0].id;
      }
    }

    if (dto.appointmentType === AppointmentType.ONLINE_CONSULTATION && !dto.consultationMode) {
      throw new BadRequestException('Consultation mode is required for Online Consultation appointments');
    }

    const preferredDate = new Date(dto.preferredDate);
    const appointmentNumber = await this.appointmentNumberService.generateNextNumber();

    return this.prisma.appointment.create({
      data: {
        appointmentNumber,
        customerId,
        serviceId: dto.serviceId,
        appointmentType: dto.appointmentType,
        officeId: targetOfficeId,
        consultationMode: dto.appointmentType === AppointmentType.ONLINE_CONSULTATION ? dto.consultationMode : null,
        preferredDate,
        appointmentDate: preferredDate,
        preferredTime: dto.preferredTime,
        customerPhone: dto.contactNumber || customer.contactNumber || '',
        customerName: customer.name,
        customerEmail: customer.email,
        email: customer.email,
        notes: dto.notes?.trim() || null,
        status: AppointmentStatus.PENDING,
      },
      include: {
        service: true,
        documents: true,
      },
    });
  }

  async createDocumentUploadUrl(customerId: string, appointmentId: string, dto: CreateUploadUrlDto) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, customerId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const fileExtension = dto.fileName.split('.').pop() || 'tmp';
    const storagePath = `appointments/${appointmentId}/${dto.documentType}_${Date.now()}.${fileExtension}`;
    const uploadUrl = `http://localhost:3003/api/v1/customer/appointments/${appointmentId}/documents/mock-upload`;

    return { uploadUrl, storagePath };
  }

  async completeDocumentUpload(customerId: string, appointmentId: string, dto: CompleteDocumentUploadDto) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, customerId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return this.prisma.appointmentDocument.create({
      data: {
        appointmentId,
        documentType: dto.fileType || 'OTHER',
        fileUrl: dto.storagePath,
        fileName: dto.fileName,
        fileType: dto.fileType,
        fileSize: dto.fileSize,
      },
    });
  }

  async getAppointments(customerId: string, query: GetAppointmentsDto) {
    const whereClause: any = { customerId };

    if (query.status && query.status !== 'ALL') {
      if (query.status === 'UPCOMING') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        whereClause.status = { in: ['PENDING', 'CONFIRMED'] };
        whereClause.preferredDate = { gte: today };
      } else {
        whereClause.status = query.status;
      }
    }

    return this.prisma.appointment.findMany({
      where: whereClause,
      include: {
        service: true,
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAppointmentDetail(customerId: string, appointmentId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, customerId },
      include: {
        service: true,
        documents: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async cancelAppointment(customerId: string, appointmentId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, customerId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status !== AppointmentStatus.PENDING && appointment.status !== AppointmentStatus.CONFIRMED) {
      throw new BadRequestException(`Cannot cancel appointment with status ${appointment.status}`);
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.CANCELLED },
    });

    return {
      ...updated,
      message: 'Appointment cancelled successfully',
    };
  }
}
