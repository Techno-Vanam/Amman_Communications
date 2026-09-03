import { createHash, randomUUID } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

export type AuthRole = 'ADMIN' | 'CUSTOMER';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  private get accessSecret() {
    return process.env.JWT_ACCESS_SECRET || 'amman-communications-jwt-access-secret-32-chars-minimum';
  }

  private get refreshSecret() {
    return process.env.JWT_REFRESH_SECRET || process.env.JWT_ACCESS_SECRET || 'amman-communications-jwt-refresh-secret-32-chars-minimum';
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async issueSession(user: { id: string; name: string; email: string | null; isProfileCompleted?: boolean }, role: AuthRole) {
    const tokenId = randomUUID();
    const refreshExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
    const accessExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';

    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, role, type: 'refresh', jti: tokenId },
      { secret: this.refreshSecret, expiresIn: refreshExpiry as never },
    );

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email || '', role, name: user.name },
      { secret: this.accessSecret, expiresIn: accessExpiry as never },
    );

    const refreshTokenHash = this.hashToken(refreshToken);

    // Persist cryptographically hashed refresh token in database for revocation tracking
    try {
      if (role === 'ADMIN') {
        await this.prisma.admin.update({
          where: { id: user.id },
          data: { refreshTokenHash },
        });
      } else {
        await this.prisma.customer.update({
          where: { id: user.id },
          data: { refreshTokenHash },
        });
      }
    } catch (dbErr) {
      console.warn('⚠️ [AuthService] Failed to persist refreshTokenHash:', (dbErr as Error).message);
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email || '',
        role,
        isProfileCompleted: 'isProfileCompleted' in user ? Boolean(user.isProfileCompleted) : true,
      },
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
    const role: AuthRole | null = admin ? 'ADMIN' : (customer ? 'CUSTOMER' : null);

    if (!user || !role) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueSession(user, role);
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
    let payload: { sub?: unknown; role?: unknown; type?: unknown };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, { secret: this.refreshSecret });
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    if (
      typeof payload.sub !== 'string' ||
      (payload.role !== 'ADMIN' && payload.role !== 'CUSTOMER') ||
      payload.type !== 'refresh'
    ) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    const user = payload.role === 'ADMIN'
      ? await this.prisma.admin.findUnique({ where: { id: payload.sub } })
      : await this.prisma.customer.findUnique({ where: { id: payload.sub } });

    if (!user || ('status' in user && user.status !== 'ACTIVE')) {
      throw new UnauthorizedException('Account is inactive or no longer exists');
    }

    // Compare incoming refresh token's hash with the stored hash in database
    const incomingHash = this.hashToken(refreshToken);
    if (user.refreshTokenHash === 'REVOKED' || (user.refreshTokenHash && user.refreshTokenHash !== incomingHash)) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    // Rotate refresh token and issue new session
    return this.issueSession(user, payload.role as AuthRole);
  }

  async verifySession(refreshToken: string) {
    let payload: { sub?: unknown; role?: unknown; type?: unknown };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, { secret: this.refreshSecret });
    } catch {
      throw new UnauthorizedException('Session token is invalid or expired');
    }

    if (
      typeof payload.sub !== 'string' ||
      (payload.role !== 'ADMIN' && payload.role !== 'CUSTOMER') ||
      payload.type !== 'refresh'
    ) {
      throw new UnauthorizedException('Session token is invalid');
    }

    const user = payload.role === 'ADMIN'
      ? await this.prisma.admin.findUnique({ where: { id: payload.sub } })
      : await this.prisma.customer.findUnique({ where: { id: payload.sub } });

    if (!user || ('status' in user && user.status !== 'ACTIVE')) {
      throw new UnauthorizedException('Account is inactive or no longer exists');
    }

    if (user.refreshTokenHash === 'REVOKED') {
      throw new UnauthorizedException('Session has been revoked');
    }

    const accessExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email || '', role: payload.role, name: user.name },
      { secret: this.accessSecret, expiresIn: accessExpiry as never },
    );

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email || '',
        role: payload.role as AuthRole,
        isProfileCompleted: 'isProfileCompleted' in user ? Boolean((user as any).isProfileCompleted) : true,
      },
    };
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      try {
        const payload = await this.jwt.verifyAsync<{ sub?: string; role?: string }>(refreshToken, {
          secret: this.refreshSecret,
          ignoreExpiration: true,
        });
        if (payload?.sub && payload?.role) {
          if (payload.role === 'ADMIN') {
            await this.prisma.admin.update({
              where: { id: payload.sub },
              data: { refreshTokenHash: 'REVOKED' },
            }).catch(() => {});
          } else {
            await this.prisma.customer.update({
              where: { id: payload.sub },
              data: { refreshTokenHash: 'REVOKED' },
            }).catch(() => {});
          }
        }
      } catch {
        // Token could not be decoded, proceed with cookie cleanup
      }
    }
    return { success: true };
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
    ) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = payload.role === 'ADMIN'
      ? await this.prisma.admin.findUnique({ where: { id: payload.sub } })
      : await this.prisma.customer.findUnique({ where: { id: payload.sub } });

    if (!user || ('status' in user && user.status !== 'ACTIVE')) {
      throw new UnauthorizedException('User account not found or inactive');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email || '',
      role: payload.role as AuthRole,
      isProfileCompleted: 'isProfileCompleted' in user ? Boolean((user as any).isProfileCompleted) : true,
    };
  }
}
