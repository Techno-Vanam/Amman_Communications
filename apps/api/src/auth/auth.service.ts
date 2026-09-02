import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { createHash, randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

export type AuthRole = 'ADMIN' | 'CUSTOMER';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  private get accessSecret() {
    return this.requireSecret('JWT_ACCESS_SECRET');
  }

  private get refreshSecret() {
    return this.requireSecret('JWT_REFRESH_SECRET');
  }

  private requireSecret(name: 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET') {
    const value = process.env[name];
    if (!value || value.length < 32) throw new Error(`${name} must contain at least 32 characters`);
    return value;
  }

  private refreshLifetimeSeconds() {
    const configured = process.env.JWT_REFRESH_EXPIRY ?? '7d';
    const match = configured.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60;
    const units = { s: 1, m: 60, h: 60 * 60, d: 24 * 60 * 60 } as const;
    return Number(match[1]) * units[match[2] as keyof typeof units];
  }

  private hashRefreshToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async issueSession(user: { id: string; name: string; email: string }, role: AuthRole) {
    const refreshId = randomUUID();
    const refreshLifetime = this.refreshLifetimeSeconds();
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, role, jti: refreshId },
      { secret: this.refreshSecret, expiresIn: refreshLifetime },
    );
    const expiresAt = new Date(Date.now() + refreshLifetime * 1000);

    await this.prisma.$transaction([
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id, role, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      this.prisma.refreshToken.create({
        data: { id: refreshId, tokenHash: this.hashRefreshToken(refreshToken), userId: user.id, role, expiresAt },
      }),
    ]);

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, role },
      { secret: this.accessSecret, expiresIn: 15 * 60 },
    );

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role },
    };
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const [admin, customer] = await Promise.all([
      this.prisma.admin.findUnique({ where: { email: normalizedEmail } }),
      this.prisma.customer.findFirst({ 
        where: { 
          OR: [
            { email: normalizedEmail },
            { phone: normalizedEmail }
          ]
        } 
      }),
    ]);

    if (admin && customer) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = admin || customer;
    const role = admin ? 'ADMIN' : (customer ? 'CUSTOMER' : null);

    if (!user || !role) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

<<<<<<< HEAD
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, role },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '7d' }
    );

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
        isProfileCompleted: 'isProfileCompleted' in user ? Boolean((user as any).isProfileCompleted) : true,
      },
    };
=======
    return this.issueSession(user, role);
>>>>>>> origin/backend-merge
  }

  async register(name: string, email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const [existingAdmin, existingCustomer] = await Promise.all([
      this.prisma.admin.findUnique({ where: { email: normalizedEmail } }),
      this.prisma.customer.findUnique({ where: { email: normalizedEmail } }),
    ]);

    if (existingAdmin || existingCustomer) {
      throw new UnauthorizedException('Registration failed. Email already exists.');
    }

    const passwordHash = await hash(password, 10);

    const customer = await this.prisma.customer.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        isProfileCompleted: false,
      },
    });

    return this.issueSession(customer, 'CUSTOMER');
  }

  async refresh(refreshToken: string) {
    let payload: { sub?: unknown; role?: unknown; jti?: unknown };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, { secret: this.refreshSecret });
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.jti !== 'string' ||
      (payload.role !== 'ADMIN' && payload.role !== 'CUSTOMER')
    ) throw new UnauthorizedException('Refresh token is invalid');

    const stored = await this.prisma.refreshToken.findUnique({ where: { id: payload.jti } });
    if (
      !stored ||
      stored.revokedAt ||
      stored.expiresAt <= new Date() ||
      stored.userId !== payload.sub ||
      stored.role !== payload.role ||
      stored.tokenHash !== this.hashRefreshToken(refreshToken)
    ) throw new UnauthorizedException('Refresh token is invalid or revoked');

    const user = payload.role === 'ADMIN'
      ? await this.prisma.admin.findUnique({ where: { id: payload.sub } })
      : await this.prisma.customer.findUnique({ where: { id: payload.sub } });
    if (!user || ('status' in user && user.status !== 'ACTIVE')) {
      throw new UnauthorizedException('Account is inactive or no longer exists');
    }

    await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    return this.issueSession(user, payload.role);
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash: this.hashRefreshToken(refreshToken), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }

  async getUserFromAccessToken(accessToken: string) {
    let payload: { sub?: unknown; role?: unknown };
    try {
      payload = await this.jwt.verifyAsync(accessToken, { secret: this.accessSecret });
    } catch {
      throw new UnauthorizedException('Access token is invalid or expired');
    }

    if (
      typeof payload.sub !== 'string' ||
      (payload.role !== 'ADMIN' && payload.role !== 'CUSTOMER')
    ) throw new UnauthorizedException('Invalid token payload');

    const user = payload.role === 'ADMIN'
      ? await this.prisma.admin.findUnique({ where: { id: payload.sub } })
      : await this.prisma.customer.findUnique({ where: { id: payload.sub } });

    if (!user || ('status' in user && user.status !== 'ACTIVE')) {
      throw new UnauthorizedException('User account not found or inactive');
    }

    return {
<<<<<<< HEAD
      accessToken,
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        role: 'CUSTOMER',
        isProfileCompleted: false,
      },
=======
      id: user.id,
      name: user.name,
      email: user.email,
      role: payload.role as AuthRole,
>>>>>>> origin/backend-merge
    };
  }
}
