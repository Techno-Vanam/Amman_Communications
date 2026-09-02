import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InAppNotificationsService } from './in-app-notifications.service';
import { NotificationUserType } from '@prisma/client';

interface RequestWithUser {
  user: {
    customerId?: string; // from customer jwt
    sub?: string; // fallback or admin jwt
    role?: string;
  };
}

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class InAppNotificationsController {
  constructor(private readonly notificationsService: InAppNotificationsService) {}

  private getUserIdAndType(req: RequestWithUser): { userId: string; userType: NotificationUserType } {
    const role = req.user.role || 'CUSTOMER';
    const userId = req.user.customerId || req.user.sub || '';
    const userType = role === 'ADMIN' ? NotificationUserType.ADMIN : NotificationUserType.CUSTOMER;
    return { userId, userType };
  }

  @Get()
  @ApiOperation({ summary: 'Get notifications for current user' })
  async getNotifications(@Req() req: RequestWithUser) {
    const { userId, userType } = this.getUserIdAndType(req);
    return this.notificationsService.getUserNotifications(userId, userType);
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  async markAllAsRead(@Req() req: RequestWithUser) {
    const { userId, userType } = this.getUserIdAndType(req);
    await this.notificationsService.markAllAsRead(userId, userType);
    return { success: true };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a specific notification as read' })
  async markAsRead(@Param('id') id: string, @Req() req: RequestWithUser) {
    const { userId } = this.getUserIdAndType(req);
    await this.notificationsService.markAsRead(id, userId);
    return { success: true };
  }
}
