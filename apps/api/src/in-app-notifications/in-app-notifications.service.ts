import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, NotificationUserType } from '@prisma/client';

export interface CreateNotificationDto {
  title: string;
  message: string;
  type?: NotificationType;
  href?: string;
}

@Injectable()
export class InAppNotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Broadcast a notification to all admins
   */
  async notifyAdmins(dto: CreateNotificationDto) {
    const admins = await this.prisma.admin.findMany({ select: { id: true } });
    
    if (admins.length === 0) return;

    await this.prisma.notification.createMany({
      data: admins.map((admin) => ({
        title: dto.title,
        message: dto.message,
        type: dto.type || NotificationType.INFO,
        href: dto.href,
        userId: admin.id,
        userType: NotificationUserType.ADMIN,
      })),
    });
  }

  /**
   * Send a notification to a specific customer
   */
  async notifyCustomer(customerId: string, dto: CreateNotificationDto) {
    await this.prisma.notification.create({
      data: {
        title: dto.title,
        message: dto.message,
        type: dto.type || NotificationType.INFO,
        href: dto.href,
        userId: customerId,
        userType: NotificationUserType.CUSTOMER,
      },
    });
  }

  /**
   * Get notifications for a user (admin or customer)
   */
  async getUserNotifications(userId: string, userType: NotificationUserType, limit = 50) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        userType,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Mark a specific notification as read
   */
  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string, userType: NotificationUserType) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        userType,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }
}
