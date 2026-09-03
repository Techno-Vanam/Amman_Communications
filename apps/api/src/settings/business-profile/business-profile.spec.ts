import { describe, it, expect } from 'vitest';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { BusinessProfileService } from './business-profile.service';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

describe('Business Profile Tests', () => {
  it('RolesGuard allows ADMIN role to access Business Profile', async () => {
    const reflector = {
      getAllAndOverride: () => ['ADMIN'],
    } as never;
    const guard = new RolesGuard(reflector);
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: 'ADMIN' } }),
      }),
    } as never;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('RolesGuard rejects CUSTOMER role if ADMIN is required', async () => {
    const reflector = {
      getAllAndOverride: () => ['ADMIN'],
    } as never;
    const guard = new RolesGuard(reflector);
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: 'CUSTOMER' } }),
      }),
    } as never;

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('UpdateBusinessProfileDto validation rules', async () => {
    // Valid DTO
    const validData = plainToInstance(UpdateBusinessProfileDto, {
      businessName: ' Amman Communications ',
      registrationNumber: ' REG-12345 ',
      officeAddress: ' 124 Main Street, Amman ',
      primaryPhone: ' +91 9876543210 ',
      supportEmail: ' SUPPORT@TEST.COM ',
    });
    const validErrors = await validate(validData);
    expect(validErrors.length).toBe(0);

    // Invalid DTO: empty business name, short address, invalid email, bad phone
    const invalidData = plainToInstance(UpdateBusinessProfileDto, {
      businessName: 'A', // too short (<2)
      officeAddress: '123', // too short (<5)
      primaryPhone: 'not-a-phone',
      supportEmail: 'invalid-email',
    });
    const invalidErrors = await validate(invalidData);
    expect(invalidErrors.length).toBeGreaterThanOrEqual(4);
  });

  it('BusinessProfileService maintains single profile', async () => {
    const dbStore: Array<{
      id: string;
      businessName: string;
      registrationNumber: string | null;
      officeAddress: string;
      primaryPhone: string;
      supportEmail: string;
      logoUrl: string | null;
      createdAt: Date;
      updatedAt: Date;
    }> = [];

    const mockPrisma = {
      businessProfile: {
        findFirst: async () => dbStore[0] || null,
        create: async ({ data }: { data: { businessName: string; registrationNumber?: string | null; officeAddress: string; primaryPhone: string; supportEmail: string; logoUrl?: string | null } }) => {
          const record = { id: 'bp-1', logoUrl: null, ...data, registrationNumber: data.registrationNumber ?? null, createdAt: new Date(), updatedAt: new Date() };
          dbStore.push(record);
          return record;
        },
        update: async ({ data }: { data: Partial<{ businessName: string; registrationNumber?: string | null; officeAddress: string; primaryPhone: string; supportEmail: string; logoUrl?: string | null }> }) => {
          if (dbStore.length > 0) {
            dbStore[0] = { ...dbStore[0], ...data, updatedAt: new Date() };
          }
          return dbStore[0];
        },
      },
    } as never;

    const service = new BusinessProfileService(mockPrisma);

    // 1. Initial GET when empty
    const empty = await service.getProfile();
    expect(empty.id).toBe(null);

    // 2. First update creates profile
    const created = await service.updateProfile({
      businessName: 'Amman Communications',
      officeAddress: '124 Main Street',
      primaryPhone: '+91 9876543210',
      supportEmail: 'support@example.com',
    });
    expect(created.id).toBe('bp-1');
    expect(dbStore.length).toBe(1);

    // 3. Second update modifies existing profile without creating duplicate
    const updated = await service.updateProfile({
      businessName: 'Amman Communications Updated',
      officeAddress: '124 Main Street',
      primaryPhone: '+91 9876543210',
      supportEmail: 'support@example.com',
    });
    expect(updated.businessName).toBe('Amman Communications Updated');
    expect(dbStore.length).toBe(1);
  });

  it('BusinessProfileService logo upload validation & delete', async () => {
    let currentLogo: string | null = null;
    const mockPrisma = {
      businessProfile: {
        findFirst: async () => ({
          id: 'bp-1',
          businessName: 'Amman',
          officeAddress: 'Address',
          primaryPhone: '1234567',
          supportEmail: 'a@b.com',
          logoUrl: currentLogo,
        }),
        update: async ({ data }: { data: { logoUrl: string | null } }) => {
          currentLogo = data.logoUrl;
          return { id: 'bp-1', logoUrl: currentLogo };
        },
        create: async () => ({ id: 'bp-1' }),
      },
    } as never;

    const service = new BusinessProfileService(mockPrisma);

    // Reject unsupported file format
    await expect(
      () => service.uploadLogo({ buffer: Buffer.from('test'), mimetype: 'application/pdf', originalname: 'doc.pdf', size: 100 })
    ).rejects.toThrow(BadRequestException);

    // Reject file over 5MB
    await expect(
      () => service.uploadLogo({ buffer: Buffer.from('test'), mimetype: 'image/png', originalname: 'large.png', size: 6 * 1024 * 1024 })
    ).rejects.toThrow(BadRequestException);

    // Valid upload
    const uploaded = await service.uploadLogo({ buffer: Buffer.from('fake-png'), mimetype: 'image/png', originalname: 'logo.png', size: 1000 });
    expect(uploaded.logoUrl?.startsWith('/uploads/logos/logo_')).toBe(true);

    // Delete logo
    const deleted = await service.deleteLogo();
    expect(deleted.logoUrl).toBe(null);
  });
});
