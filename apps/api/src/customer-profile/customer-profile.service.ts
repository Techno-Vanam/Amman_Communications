import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateContactInfoDto } from './dto/update-contact-info.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class CustomerProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    return {
      ...customer,
      role: 'CLIENT',
    };
  }

  async updateProfile(customerId: string, dto: UpdateProfileDto) {
    const existing = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!existing) {
      throw new NotFoundException('Customer profile not found');
    }

    if (dto.email && dto.email.toLowerCase().trim() !== existing.email) {
      const emailTaken = await this.prisma.customer.findUnique({
        where: { email: dto.email.toLowerCase().trim() },
      });
      if (emailTaken) {
        throw new BadRequestException('Email address is already in use');
      }
    }

    const updated = await this.prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.email ? { email: dto.email.toLowerCase().trim() } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async changePassword(customerId: string, dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new BadRequestException('New password and confirm password do not match');
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    const isValid = await compare(dto.currentPassword, customer.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await hash(dto.newPassword, 10);
    await this.prisma.customer.update({
      where: { id: customerId },
      data: { passwordHash },
    });

    return { success: true, message: 'Password changed successfully' };
  }

  async updateContactInfo(customerId: string, dto: UpdateContactInfoDto) {
    return {
      id: customerId,
      altContactName: dto.altContactName || null,
      altPhoneNumber: dto.altPhoneNumber || null,
      preferredContactMethod: dto.preferredContactMethod || 'EMAIL',
    };
  }

  async updatePreferences(customerId: string, dto: UpdatePreferencesDto) {
    return {
      id: customerId,
      emailNotifications: dto.emailNotifications ?? true,
      smsAlerts: dto.smsAlerts ?? true,
      whatsappUpdates: dto.whatsappUpdates ?? true,
      preferredLanguage: dto.preferredLanguage || 'en',
    };
  }
}
