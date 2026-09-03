import { describe, it, expect } from 'vitest';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { DocumentsService } from '../documents/documents.service';

function contextWithToken(token?: string) {
  const req = { headers: { authorization: token ? `Bearer ${token}` : undefined } };
  return {
    switchToHttp: () => ({
      getRequest: () => req,
    }),
  } as any;
}

function jwtFor(payload: { sub: string; role: string }) {
  return { verifyAsync: async () => payload } as any;
}

function jwtForError() {
  return {
    verifyAsync: async () => {
      throw new Error('JWT verification failed');
    },
  } as any;
}

describe('Authorization', () => {
  it('JwtAuthGuard verifies JWT token and attaches user payload', async () => {
    const guard = new JwtAuthGuard(jwtFor({ sub: 'customer-1', role: 'CUSTOMER' }));
    const context = contextWithToken('valid-token');
    expect(await guard.canActivate(context)).toBe(true);
    expect((context.switchToHttp().getRequest() as any).user).toEqual({ sub: 'customer-1', role: 'CUSTOMER' });
  });

  it('JwtAuthGuard throws UnauthorizedException on missing token', async () => {
    const guard = new JwtAuthGuard(jwtFor({ sub: 'customer-1', role: 'CUSTOMER' }));
    const context = contextWithToken();
    await expect(() => guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('JwtAuthGuard throws UnauthorizedException on invalid token', async () => {
    const guard = new JwtAuthGuard(jwtForError());
    const context = contextWithToken('invalid-token');
    await expect(() => guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('RolesGuard allows access if user role matches', async () => {
    const reflector = {
      getAllAndOverride: () => ['CUSTOMER'],
    } as never;
    const guard = new RolesGuard(reflector);
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: 'CUSTOMER' } }),
      }),
    } as never;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('RolesGuard rejects access if user role does not match', async () => {
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

  it('customer document completion rejects another customer application', async () => {
    const prisma = {
      application: { findFirst: async () => null, findUnique: async () => null },
      document: { create: async () => { throw new Error('must not create'); } },
    } as never;
    const storageMock = {
      validateFile: () => {},
      createDownloadUrl: async () => 'url',
      deleteFile: async () => {},
    } as never;
    const service = new DocumentsService(prisma, storageMock);

    await expect(
      () => service.complete('customer-1', {
        applicationId: 'other-application',
        documentType: 'passport',
        storagePath: 'documents/customer-1/other-application/file.pdf',
        fileName: 'file.pdf',
        mimeType: 'application/pdf',
        fileSize: 100,
      }),
    ).rejects.toThrow();
  });

  it('AuthService hashes refreshToken, saves to DB, rotates, and revokes on logout', async () => {
    const { hash } = await import('bcryptjs');
    const { JwtService } = await import('@nestjs/jwt');
    const { AuthService } = await import('./auth.service');

    let currentHash: string | null = null;
    const adminRecord = {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@test.com',
      passwordHash: await hash('Password@123', 10),
      get refreshTokenHash() {
        return currentHash;
      },
    };

    const mockPrisma = {
      admin: {
        findUnique: async () => adminRecord,
        update: async ({ data }: { data: { refreshTokenHash?: string | null } }) => {
          currentHash = data.refreshTokenHash ?? null;
          return { ...adminRecord, refreshTokenHash: currentHash };
        },
      },
      customer: {
        findFirst: async () => null,
        findUnique: async () => null,
      },
    } as never;

    const jwtService = new JwtService({ secret: 'amman-communications-jwt-access-secret-32-chars-minimum' });
    const authService = new AuthService(mockPrisma, jwtService);

    // 1. Login generates access token and stores SHA-256 refreshTokenHash in database
    const session = await authService.login('admin@test.com', 'Password@123');
    expect(session.accessToken).toBeDefined();
    expect(session.refreshToken).toBeDefined();
    expect(currentHash).not.toBeNull();
    expect(typeof currentHash).toBe('string');

    // 2. Refresh rotates tokens
    const refreshedSession = await authService.refresh(session.refreshToken);
    expect(refreshedSession.accessToken).toBeDefined();
    expect(refreshedSession.refreshToken).toBeDefined();
    expect(currentHash).not.toBeNull();

    // 3. Logout revokes token hash
    await authService.logout(refreshedSession.refreshToken);
    expect(currentHash).toBe('REVOKED');

    // 4. Subsequent refresh after logout is rejected
    await expect(() => authService.refresh(refreshedSession.refreshToken)).rejects.toThrow(UnauthorizedException);
  });
});
