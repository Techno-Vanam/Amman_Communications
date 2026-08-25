import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { IStorageService, STORAGE_SERVICE } from '../storage/storage.interface';
import { AppointmentNumberService } from './appointment-number.service';
import { AppointmentType, CreateAppointmentDto } from './dto/create-appointment.dto';
import { GetAppointmentsDto } from './dto/get-appointments.dto';
import { CompleteDocumentUploadDto, CreateUploadUrlDto } from './dto/upload-document.dto';

const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']);

@Injectable()
export class CustomerAppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly appointmentNumberService: AppointmentNumberService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(STORAGE_SERVICE) private readonly storage: IStorageService,
  ) {}

  async getServices() {
    return this.prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getOffices() {
    return this.prisma.office.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createAppointment(customerId: string, dto: CreateAppointmentDto) {
    // 1. Fetch customer profile to overwrite client name/email/address safely
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    // 2. Validate Service exists and is active
    const service = await this.prisma.service.findFirst({
      where: { id: dto.serviceId, isActive: true },
    });
    if (!service) {
      throw new BadRequestException('Invalid or inactive service selected');
    }

    // 3. Conditional Branch Validation
    if (dto.appointmentType === AppointmentType.OFFICE_VISIT) {
      if (!dto.officeId) {
        throw new BadRequestException('officeId is required for OFFICE_VISIT appointments');
      }
      const office = await this.prisma.office.findFirst({
        where: { id: dto.officeId, isActive: true },
      });
      if (!office) {
        throw new BadRequestException('Invalid or inactive office selected');
      }
    } else if (dto.appointmentType === AppointmentType.ONLINE_CONSULTATION) {
      if (!dto.consultationMode) {
        throw new BadRequestException('consultationMode is required for ONLINE_CONSULTATION appointments');
      }
    }

    // 4. Validate Date
    const prefDate = new Date(dto.preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (prefDate < today) {
      throw new BadRequestException('Preferred date cannot be in the past');
    }

    // 5. Database transaction for atomic appointment creation & sequence generation
    const appointment = await this.prisma.$transaction(async (tx) => {
      const appointmentNumber = await this.appointmentNumberService.generateNextNumber(tx);

      const created = await tx.appointment.create({
        data: {
          appointmentNumber,
          customerId,
          serviceId: dto.serviceId,
          appointmentType: dto.appointmentType,
          officeId: dto.appointmentType === AppointmentType.OFFICE_VISIT ? dto.officeId : null,
          consultationMode: dto.appointmentType === AppointmentType.ONLINE_CONSULTATION ? dto.consultationMode : null,
          preferredDate: prefDate,
          preferredTime: dto.preferredTime,
          contactNumber: dto.contactNumber,
          name: customer.name,
          email: customer.email,
          address: dto.address?.trim() || customer.address,
          notes: dto.notes ?? null,
          status: 'PENDING',
        },
        include: {
          service: true,
          office: true,
        },
      });

      // Write initial status history log
      await tx.appointmentStatusHistory.create({
        data: {
          appointmentId: created.id,
          status: 'PENDING',
          changedBy: 'system',
          remarks: 'Initial appointment request submitted',
        },
      });

      return created;
    });

    // 6. Fire internal event for async notification
    this.eventEmitter.emit('appointment.created', {
      appointmentId: appointment.id,
      appointmentNumber: appointment.appointmentNumber,
      customerEmail: appointment.email ?? undefined,
      name: appointment.name,
    });

    return appointment;
  }

  async createDocumentUploadUrl(customerId: string, appointmentId: string, dto: CreateUploadUrlDto) {
    // Cross-customer isolation check
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, customerId },
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (!ALLOWED_MIME_TYPES.has(dto.mimeType.toLowerCase())) {
      throw new BadRequestException('Unsupported file type. Allowed: PDF, JPG, PNG');
    }

    const maxMb = Number(process.env.MAX_UPLOAD_SIZE_MB ?? 10);
    const maxSizeBytes = maxMb * 1024 * 1024;
    if (dto.fileSize > maxSizeBytes) {
      throw new BadRequestException(`File size exceeds maximum allowed limit of ${maxMb}MB`);
    }

    const safeName = dto.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `documents/${customerId}/${appointmentId}/${dto.documentType}_${Date.now()}_${safeName}`;
    const uploadUrl = await this.storage.createUploadUrl(storagePath, dto.mimeType);

    return { uploadUrl, storagePath };
  }

  async completeDocumentUpload(customerId: string, appointmentId: string, dto: CompleteDocumentUploadDto) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, customerId },
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (!dto.storagePath.startsWith(`documents/${customerId}/${appointmentId}/`)) {
      throw new BadRequestException('Invalid storage path for appointment document');
    }

    const signedUrl = await this.storage.createDownloadUrl(dto.storagePath);

    const doc = await this.prisma.appointmentDocument.create({
      data: {
        appointmentId,
        fileUrl: signedUrl,
        fileName: dto.fileName,
        fileType: dto.fileType,
        fileSize: dto.fileSize,
      },
    });

    return doc;
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
        office: true,
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAppointmentDetail(customerId: string, appointmentId: string) {
    // Cross-customer isolation strictly enforced
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, customerId },
      include: {
        service: true,
        office: true,
        documents: true,
        statusHistory: {
          orderBy: { changedAt: 'asc' },
        },
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

    if (appointment.status !== 'PENDING' && appointment.status !== 'CONFIRMED') {
      throw new BadRequestException('Only appointments in PENDING or CONFIRMED status can be cancelled');
    }

    const now = new Date();
    if (new Date(appointment.preferredDate) < now) {
      throw new BadRequestException('Cannot cancel past appointments');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: 'CANCELLED' },
        include: { service: true, office: true, documents: true },
      });

      await tx.appointmentStatusHistory.create({
        data: {
          appointmentId,
          status: 'CANCELLED',
          changedBy: customerId,
          remarks: 'Cancelled by customer',
        },
      });

      return result;
    });

    return updated;
  }
}
