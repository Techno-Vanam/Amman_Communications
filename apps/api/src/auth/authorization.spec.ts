import assert from 'node:assert/strict';
import test from 'node:test';
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

function contextWithAuthorization(authorization: string) {
  const req = { headers: { authorization } };
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

test('JwtAuthGuard verifies JWT token and attaches user payload', async () => {
  const guard = new JwtAuthGuard(jwtFor({ sub: 'customer-1', role: 'CUSTOMER' }));
  const context = contextWithToken('valid-token');
  assert.equal(await guard.canActivate(context), true);
  assert.deepEqual((context.switchToHttp().getRequest() as any).user, { sub: 'customer-1', role: 'CUSTOMER' });
});

test('JwtAuthGuard throws UnauthorizedException on missing token', async () => {
  const guard = new JwtAuthGuard(jwtFor({ sub: 'customer-1', role: 'CUSTOMER' }));
  const context = contextWithToken();
  await assert.rejects(() => guard.canActivate(context), UnauthorizedException);
});

test('JwtAuthGuard throws UnauthorizedException on invalid token', async () => {
  const guard = new JwtAuthGuard(jwtForError());
  const context = contextWithToken('invalid-token');
  await assert.rejects(() => guard.canActivate(context), UnauthorizedException);
});

test('RolesGuard allows access if user role matches', async () => {
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

  assert.equal(guard.canActivate(context), true);
});

test('RolesGuard rejects access if user role does not match', async () => {
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

  assert.throws(() => guard.canActivate(context), ForbiddenException);
});

test('customer document completion rejects another customer application', async () => {
  const prisma = {
    application: { findFirst: async () => null },
    document: { create: async () => { throw new Error('must not create'); } },
  } as never;
  const storageMock = {
    validateFile: () => {},
    createDownloadUrl: async () => 'url',
    deleteFile: async () => {},
  } as never;
  const service = new DocumentsService(prisma, storageMock);

  await assert.rejects(
    () => service.complete('customer-1', {
      applicationId: 'other-application',
      documentType: 'passport',
      storagePath: 'documents/customer-1/other-application/file.pdf',
      fileName: 'file.pdf',
      mimeType: 'application/pdf',
      fileSize: 100,
    }),
    (error: unknown) => error instanceof UnauthorizedException === false && (error as { getStatus?: () => number }).getStatus?.() === 404,
  );
});
