import fs from 'node:fs';
import path from 'node:path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';

const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);
const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

@Injectable()
export class BusinessProfileService {
  private readonly uploadDir: string;

  constructor(private readonly prisma: PrismaService) {
    this.uploadDir = path.resolve(process.cwd(), 'uploads/logos');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async getProfile() {
    const profile = await this.prisma.businessProfile.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (!profile) {
      return {
        id: null,
        businessName: '',
        registrationNumber: '',
        officeAddress: '',
        primaryPhone: '',
        supportEmail: '',
        logoUrl: null,
        createdAt: null,
        updatedAt: null,
      };
    }

    return profile;
  }

  async updateProfile(dto: UpdateBusinessProfileDto) {
    const existing = await this.prisma.businessProfile.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (existing) {
      return this.prisma.businessProfile.update({
        where: { id: existing.id },
        data: {
          businessName: dto.businessName,
          registrationNumber: dto.registrationNumber || null,
          officeAddress: dto.officeAddress,
          primaryPhone: dto.primaryPhone,
          supportEmail: dto.supportEmail,
        },
      });
    }

    return this.prisma.businessProfile.create({
      data: {
        businessName: dto.businessName,
        registrationNumber: dto.registrationNumber || null,
        officeAddress: dto.officeAddress,
        primaryPhone: dto.primaryPhone,
        supportEmail: dto.supportEmail,
      },
    });
  }

  async uploadLogo(file: { buffer: Buffer; mimetype: string; originalname: string; size: number }) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
      throw new BadRequestException('Unsupported file format. Only PNG, JPG, JPEG, and WebP are allowed.');
    }

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      throw new BadRequestException('File size exceeds maximum limit of 5MB.');
    }

    const existing = await this.prisma.businessProfile.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    // Remove old logo file if it exists
    if (existing?.logoUrl) {
      this.deleteLogoFile(existing.logoUrl);
    }

    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const filename = `logo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
    const filePath = path.join(this.uploadDir, filename);

    fs.writeFileSync(filePath, file.buffer);

    const logoUrl = `/uploads/logos/${filename}`;

    if (existing) {
      return this.prisma.businessProfile.update({
        where: { id: existing.id },
        data: { logoUrl },
      });
    }

    return this.prisma.businessProfile.create({
      data: {
        businessName: 'Amman Communications',
        officeAddress: '124 Main Street, Business District',
        primaryPhone: '+91 9876543210',
        supportEmail: 'support@example.com',
        logoUrl,
      },
    });
  }

  async deleteLogo() {
    const existing = await this.prisma.businessProfile.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (existing?.logoUrl) {
      this.deleteLogoFile(existing.logoUrl);
      return this.prisma.businessProfile.update({
        where: { id: existing.id },
        data: { logoUrl: null },
      });
    }

    return this.getProfile();
  }

  private deleteLogoFile(logoUrl: string) {
    try {
      const filename = path.basename(logoUrl);
      const filePath = path.join(this.uploadDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // Ignore file removal error if already deleted
    }
  }
}
