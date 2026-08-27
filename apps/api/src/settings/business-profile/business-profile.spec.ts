import assert from 'node:assert/strict';
import test from 'node:test';
import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AdminAuthGuard } from '../../auth/guards/admin-auth.guard';
import { BusinessProfileService } from './business-profile.service';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

function contextWithToken(token?: string) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers: { authorization: token ? `Bearer ${token}` : undefined } }),
    }),
  } as never;
}

function jwtFor(payload: { sub: string; role: string }) {
  return { verifyAsync: async () => payload } as never;
}

function prismaFor(options: { admin?: boolean; customer?: boolean } = {}) {
  return {
    admin: { findUnique: async () => (options.admin ? { id: 'admin-1' } : null) },
    customer: { findUnique: async () => (options.customer ? { id: 'customer-1' } : null) },
  } as never;
}

test('AdminAuthGuard allows ADMIN role to access Business Profile', async () => {
  const guard = new AdminAuthGuard(jwtFor({ sub: 'admin-1', role: 'ADMIN' }), prismaFor({ admin: true }));
  assert.equal(await guard.canActivate(contextWithToken('admin-token')), true);
});

test('AdminAuthGuard rejects CUSTOMER role with 403 Forbidden', async () => {
  const guard = new AdminAuthGuard(jwtFor({ sub: 'customer-1', role: 'CUSTOMER' }), prismaFor({ customer: true }));
  await assert.rejects(() => guard.canActivate(contextWithToken('customer-token')), (err: unknown) => {
    return err instanceof ForbiddenException && err.getStatus() === 403;
  });
});

test('AdminAuthGuard rejects unauthenticated requests with 401 Unauthorized', async () => {
  const guard = new AdminAuthGuard(jwtFor({ sub: 'admin-1', role: 'ADMIN' }), prismaFor({ admin: true }));
  await assert.rejects(() => guard.canActivate(contextWithToken()), (err: unknown) => {
    return err instanceof UnauthorizedException && err.getStatus() === 401;
  });
});

test('UpdateBusinessProfileDto validation rules', async () => {
  // Valid DTO
  const validData = plainToInstance(UpdateBusinessProfileDto, {
    businessName: ' Amman Communications ',
    registrationNumber: ' REG-12345 ',
    officeAddress: ' 124 Main Street, Amman ',
    primaryPhone: ' +91 9876543210 ',
    supportEmail: ' SUPPORT@TEST.COM ',
  });
  const validErrors = await validate(validData);
  assert.equal(validErrors.length, 0);

  // Invalid DTO: empty business name, short address, invalid email, bad phone
  const invalidData = plainToInstance(UpdateBusinessProfileDto, {
    businessName: 'A', // too short (<2)
    officeAddress: '123', // too short (<5)
    primaryPhone: 'not-a-phone',
    supportEmail: 'invalid-email',
  });
  const invalidErrors = await validate(invalidData);
  assert.ok(invalidErrors.length >= 4);
});

test('BusinessProfileService maintains single profile', async () => {
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
  assert.equal(empty.id, null);

  // 2. First update creates profile
  const created = await service.updateProfile({
    businessName: 'Amman Communications',
    officeAddress: '124 Main Street',
    primaryPhone: '+91 9876543210',
    supportEmail: 'support@example.com',
  });
  assert.equal(created.id, 'bp-1');
  assert.equal(dbStore.length, 1);

  // 3. Second update modifies existing profile without creating duplicate
  const updated = await service.updateProfile({
    businessName: 'Amman Communications Updated',
    officeAddress: '124 Main Street',
    primaryPhone: '+91 9876543210',
    supportEmail: 'support@example.com',
  });
  assert.equal(updated.businessName, 'Amman Communications Updated');
  assert.equal(dbStore.length, 1);
});

test('BusinessProfileService logo upload validation & delete', async () => {
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
  await assert.rejects(
    () => service.uploadLogo({ buffer: Buffer.from('test'), mimetype: 'application/pdf', originalname: 'doc.pdf', size: 100 }),
    BadRequestException,
  );

  // Reject file over 5MB
  await assert.rejects(
    () => service.uploadLogo({ buffer: Buffer.from('test'), mimetype: 'image/png', originalname: 'large.png', size: 6 * 1024 * 1024 }),
    BadRequestException,
  );

  // Valid upload
  const uploaded = await service.uploadLogo({ buffer: Buffer.from('fake-png'), mimetype: 'image/png', originalname: 'logo.png', size: 1000 });
  assert.ok(uploaded.logoUrl?.startsWith('/uploads/logos/logo_'));

  // Delete logo
  const deleted = await service.deleteLogo();
  assert.equal(deleted.logoUrl, null);
});
