import assert from 'node:assert/strict';
import test from 'node:test';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { CustomerAuthGuard } from './guards/customer-auth.guard';
import { DocumentsService } from '../documents/documents.service';

function contextWithToken(token?: string) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers: { authorization: token ? `Bearer ${token}` : undefined } }),
    }),
  } as never;
}

function contextWithAuthorization(authorization: string) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers: { authorization } }),
    }),
  } as never;
}

function jwtFor(payload: { sub: string; role: string }) {
  return { verifyAsync: async () => payload } as never;
}

function prismaFor(options: { admin?: boolean; customer?: boolean } = {}) {
  return {
    admin: { findUnique: async () => (options.admin ? { id: 'admin-1' } : null) },
    customer: { findUnique: async () => (options.customer ? { id: 'customer-1', status: 'ACTIVE' } : null) },
  } as never;
}

test('ADMIN token is accepted by the admin guard', async () => {
  const guard = new AdminAuthGuard(jwtFor({ sub: 'admin-1', role: 'ADMIN' }), prismaFor({ admin: true }));
  assert.equal(await guard.canActivate(contextWithToken('admin-token')), true);
});

test('CUSTOMER token is rejected from the admin guard with 403', async () => {
  const guard = new AdminAuthGuard(jwtFor({ sub: 'customer-1', role: 'CUSTOMER' }), prismaFor());
  await assert.rejects(() => guard.canActivate(contextWithToken('customer-token')), (error: unknown) => {
    return error instanceof ForbiddenException && error.getStatus() === 403;
  });
});

test('missing credentials return 401', async () => {
  const guard = new CustomerAuthGuard(jwtFor({ sub: 'customer-1', role: 'CUSTOMER' }), prismaFor({ customer: true }));
  await assert.rejects(() => guard.canActivate(contextWithToken()), (error: unknown) => {
    return error instanceof UnauthorizedException && error.getStatus() === 401;
  });
});

test('malformed bearer credentials return 401', async () => {
	const guard = new CustomerAuthGuard(jwtFor({ sub: 'customer-1', role: 'CUSTOMER' }), prismaFor({ customer: true }));
  await assert.rejects(() => guard.canActivate(contextWithAuthorization('Bearer token extra')), UnauthorizedException);
});

test('CUSTOMER token is accepted only for an existing customer', async () => {
  const guard = new CustomerAuthGuard(jwtFor({ sub: 'customer-1', role: 'CUSTOMER' }), prismaFor({ customer: true }));
  assert.equal(await guard.canActivate(contextWithToken('customer-token')), true);

  const unknownCustomerGuard = new CustomerAuthGuard(
    jwtFor({ sub: 'missing', role: 'CUSTOMER' }),
    prismaFor(),
  );
  await assert.rejects(() => unknownCustomerGuard.canActivate(contextWithToken('stale-token')), UnauthorizedException);
});

test('customer document completion rejects another customer application', async () => {
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
