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
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const loginUrl = `${frontendUrl}/login`;
    
    this.logger.log(
      `\n` +
      `══════════════════════════════════════════════════════\n` +
      `  📧 NEW CUSTOMER CREDENTIALS ISSUED\n` +
      `──────────────────────────────────────────────────────\n` +
      `  Name:     ${event.name}\n` +
      `  Email:    ${event.email}\n` +
      `  Password: ${event.passwordRaw}\n` +
      `  LoginURL: ${loginUrl}\n` +
      `══════════════════════════════════════════════════════\n`,
    );

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #12372A; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Welcome to Amman Communications</h1>
        </div>
        <div style="padding: 24px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; background-color: #ffffff;">
          <p>Hi <strong>${event.name}</strong>,</p>
          <p>An administrator has created an account for you on the Amman Communications platform. You can now log in to manage your applications, appointments, and documents.</p>
          
          <div style="background-color: #f0f7f2; border: 1px solid #a8d5b9; padding: 18px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #12372A; font-weight: bold;">Your Login Credentials:</p>
            <p style="margin: 6px 0;"><strong>Email:</strong> ${event.email}</p>
            <p style="margin: 6px 0;"><strong>Password:</strong> <span style="font-family: monospace; background: #ffffff; padding: 3px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-weight: bold;">${event.passwordRaw}</span></p>
          </div>
          
          <p>Please log in using the button below. We recommend changing your password after your first login.</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${loginUrl}" style="background-color: #12372A; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Login to Portal</a>
          </div>
          
          <p style="font-size: 12px; color: #777; border-top: 1px solid #eeeeee; padding-top: 15px; margin-top: 25px;">
            If you did not expect this email, please contact support at support@ammancomm.in.
          </p>
        </div>
      </div>
    `;

    const success = await this.mailService.sendEmail(
      event.email,
      'Welcome to Amman Communications - Your Account Credentials',
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
