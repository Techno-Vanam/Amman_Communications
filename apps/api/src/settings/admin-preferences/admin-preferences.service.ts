import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateAdminPreferencesDto } from './dto/update-admin-preferences.dto';

@Injectable()
export class AdminPreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async getPreferences(adminId: string) {
    const preferences = await this.prisma.adminSettings.findUnique({
      where: { adminId },
    });

    if (!preferences) {
      // Create defaults if not found
      return this.prisma.adminSettings.create({
        data: { adminId },
      });
    }

    return preferences;
  }

  async updatePreferences(adminId: string, dto: UpdateAdminPreferencesDto) {
    return this.prisma.adminSettings.upsert({
      where: { adminId },
      create: {
        adminId,
        ...dto,
      },
      update: {
        ...dto,
      },
    });
  }
}
