import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentMode, AppointmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

export interface AppointmentFilters {
  search?: string;
  status?: string;
  mode?: AppointmentMode;
  date?: string; // YYYY-MM-DD
  startDate?: string;
  endDate?: string;
  timeframe?: 'today' | 'upcoming' | 'past' | 'all';
}

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [todayCount, upcomingCount, confirmedCount, completedCount, cancelledCount, totalCount] =
      await Promise.all([
        this.prisma.appointment.count({
          where: {
            appointmentDate: {
              gte: startOfToday,
              lte: endOfToday,
            },
          },
        }),
        this.prisma.appointment.count({
          where: {
            appointmentDate: {
              gte: now,
            },
            status: {
              in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING, AppointmentStatus.RESCHEDULED],
            },
          },
        }),
        this.prisma.appointment.count({
          where: { status: AppointmentStatus.CONFIRMED },
        }),
        this.prisma.appointment.count({
          where: { status: AppointmentStatus.COMPLETED },
        }),
        this.prisma.appointment.count({
          where: { status: AppointmentStatus.CANCELLED },
        }),
        this.prisma.appointment.count(),
      ]);

    return {
      today: todayCount,
      upcoming: upcomingCount,
      confirmed: confirmedCount,
      completed: completedCount,
      cancelled: cancelledCount,
      total: totalCount,
    };
  }

  async findAll(filters: AppointmentFilters = {}) {
    const { search, status, mode, date, startDate, endDate, timeframe } = filters;
    const where: Prisma.AppointmentWhereInput = {};

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Timeframe / Date filters
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);
      where.appointmentDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (startDate || endDate) {
      where.appointmentDate = {};
      if (startDate) where.appointmentDate.gte = new Date(startDate);
      if (endDate) where.appointmentDate.lte = new Date(endDate);
    } else if (timeframe === 'today') {
      where.appointmentDate = {
        gte: startOfToday,
        lte: endOfToday,
      };
    } else if (timeframe === 'upcoming') {
      where.appointmentDate = {
        gte: now,
      };
    } else if (timeframe === 'past') {
      where.appointmentDate = {
        lt: now,
      };
    }

    // Status filter
    if (status && status !== 'ALL') {
      if (status === 'UPCOMING') {
        where.appointmentDate = { ...(where.appointmentDate as object), gte: now };
        where.status = {
          in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING, AppointmentStatus.RESCHEDULED],
        };
      } else if (status in AppointmentStatus) {
        where.status = status as AppointmentStatus;
      }
    }

    // Mode filter
    if (mode) {
      where.mode = mode;
    }

    // Search query
    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerEmail: { contains: q, mode: 'insensitive' } },
        { customerPhone: { contains: q, mode: 'insensitive' } },
        { notes: { contains: q, mode: 'insensitive' } },
        { service: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const appointments = await this.prisma.appointment.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            totalFee: true,
            estimatedTime: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        appointmentDate: 'asc',
      },
    });

    return appointments;
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        service: true,
        customer: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID "${id}" not found`);
    }

    return appointment;
  }

  async create(dto: CreateAppointmentDto) {
    const appointmentDate = new Date(dto.appointmentDate);
    if (isNaN(appointmentDate.getTime())) {
      throw new BadRequestException('Invalid appointment date format');
    }

    if (!dto.customerId) {
      const existingCustomer = await this.prisma.customer.findFirst({
        where: {
          OR: [
            { email: { equals: dto.customerEmail.toLowerCase().trim(), mode: 'insensitive' } },
            { name: { equals: dto.customerName.trim(), mode: 'insensitive' } },
          ]
        }
      });
      if (existingCustomer) {
        throw new BadRequestException('A customer with this email or name already exists.');
      }
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        customerName: dto.customerName.trim(),
        customerEmail: dto.customerEmail.toLowerCase().trim(),
        customerPhone: dto.customerPhone.trim(),
        customerId: dto.customerId,
        serviceId: dto.serviceId,
        appointmentDate,
        durationMinutes: dto.durationMinutes ?? 30,
        mode: dto.mode,
        onlineType: dto.onlineType,
        meetingLink: dto.meetingLink?.trim(),
        status: dto.status ?? AppointmentStatus.CONFIRMED,
        notes: dto.notes?.trim(),
      },
      include: {
        service: {
          select: { id: true, name: true, totalFee: true },
        },
      },
    });

    return appointment;
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    const existing = await this.prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Appointment with ID "${id}" not found`);
    }

    const data: Prisma.AppointmentUpdateInput = {
      ...(dto.customerName !== undefined && { customerName: dto.customerName.trim() }),
      ...(dto.customerEmail !== undefined && { customerEmail: dto.customerEmail.toLowerCase().trim() }),
      ...(dto.customerPhone !== undefined && { customerPhone: dto.customerPhone.trim() }),
      ...(dto.customerId !== undefined && { customer: dto.customerId ? { connect: { id: dto.customerId } } : { disconnect: true } }),
      ...(dto.serviceId !== undefined && { service: dto.serviceId ? { connect: { id: dto.serviceId } } : { disconnect: true } }),
      ...(dto.appointmentDate !== undefined && { appointmentDate: new Date(dto.appointmentDate) }),
      ...(dto.durationMinutes !== undefined && { durationMinutes: dto.durationMinutes }),
      ...(dto.mode !== undefined && { mode: dto.mode }),
      ...(dto.onlineType !== undefined && { onlineType: dto.onlineType }),
      ...(dto.meetingLink !== undefined && { meetingLink: dto.meetingLink }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      ...(dto.rescheduledFrom !== undefined && { rescheduledFrom: dto.rescheduledFrom ? new Date(dto.rescheduledFrom) : null }),
      ...(dto.rescheduleReason !== undefined && { rescheduleReason: dto.rescheduleReason }),
    };

    return this.prisma.appointment.update({
      where: { id },
      data,
      include: {
        service: true,
        customer: true,
      },
    });
  }

  async reschedule(id: string, dto: RescheduleAppointmentDto) {
    const existing = await this.prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Appointment with ID "${id}" not found`);
    }

    const newDate = new Date(dto.newDate);
    if (isNaN(newDate.getTime())) {
      throw new BadRequestException('Invalid appointment date format for rescheduling');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        appointmentDate: newDate,
        rescheduledFrom: existing.appointmentDate,
        rescheduleReason: dto.reason?.trim() || 'Rescheduled by administrator',
        status: AppointmentStatus.RESCHEDULED,
        ...(dto.mode !== undefined && { mode: dto.mode }),
        ...(dto.onlineType !== undefined && { onlineType: dto.onlineType }),
        ...(dto.meetingLink !== undefined && { meetingLink: dto.meetingLink }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: {
        service: true,
        customer: true,
      },
    });
  }

  async updateStatus(id: string, status: AppointmentStatus) {
    const existing = await this.prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Appointment with ID "${id}" not found`);
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        service: true,
        customer: true,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Appointment with ID "${id}" not found`);
    }

    await this.prisma.appointment.delete({ where: { id } });
    return { success: true, message: `Appointment ${id} removed successfully` };
  }
}
