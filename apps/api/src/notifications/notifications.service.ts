import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';

export interface AppointmentCreatedEvent {
  appointmentId: string;
  appointmentNumber: string;
  customerEmail?: string;
  name: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('appointment.created')
  async handleAppointmentCreated(event: AppointmentCreatedEvent) {
    this.logger.log(`Received appointment.created event for APT: ${event.appointmentNumber} (${event.appointmentId})`);
    await this.sendAppointmentConfirmation(event.appointmentId);
  }

  /**
   * Channel-agnostic notification sender for V1 (Email logger / interface)
   */
  async sendAppointmentConfirmation(appointmentId: string): Promise<boolean> {
    try {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { service: true, office: true },
      });

      if (!appointment) {
        this.logger.warn(`Appointment ${appointmentId} not found for sending notification`);
        return false;
      }

      const recipient = appointment.email || 'customer@amman.com';
      this.logger.log(
        `[EMAIL NOTIFICATION SENT] To: ${recipient} | Subject: Appointment Confirmation - ${appointment.appointmentNumber} | Service: ${appointment.service?.name} | Date: ${appointment.preferredDate?.toISOString().substring(0, 10)} ${appointment.preferredTime}`
      );

      return true;
    } catch (error) {
      this.logger.error(`Failed to send appointment confirmation for ${appointmentId}:`, error);
      return false;
    }
  }
}
