import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

export interface AppointmentCreatedEvent {
  appointmentId: string;
  appointmentNumber: string;
  customerEmail?: string;
  name: string;
}

export interface CustomerCreatedEvent {
  customerId: string;
  name: string;
  email: string;
  passwordRaw: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  @OnEvent('customer.created')
  async handleCustomerCreated(event: CustomerCreatedEvent) {
    this.logger.log(`Received customer.created event for: ${event.email}`);
    await this.sendCustomerWelcomeEmail(event);
  }

  async sendCustomerWelcomeEmail(event: CustomerCreatedEvent) {
    const loginUrl = 'http://localhost:3000/login'; // Adjust based on env if needed
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #0e2a47; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">Welcome to Amman Communications!</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
          <p>Hi <strong>${event.name}</strong>,</p>
          <p>An administrator has created an account for you on our platform. You can now log in to view your applications, appointments, and payments.</p>
          
          <div style="background-color: #f5f7fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Your Login Credentials:</strong></p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${event.email}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> <span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${event.passwordRaw}</span></p>
          </div>
          
          <p>Please log in using the button below and we recommend changing your password after your first login.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #0e2a47; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login to Portal</a>
          </div>
          
          <p style="font-size: 12px; color: #777;">If you did not expect this email, please contact our support.</p>
        </div>
      </div>
    `;

    const success = await this.mailService.sendEmail(
      event.email,
      'Welcome to Amman Communications - Your Account Details',
      html,
    );

    if (success) {
      this.logger.log(`Welcome email successfully sent to ${event.email}`);
    }
  }

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
