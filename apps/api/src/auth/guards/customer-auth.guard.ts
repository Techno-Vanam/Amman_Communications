import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomerAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string; cookie?: string };
      cookies?: Record<string, string>;
      user?: unknown;
    }>();

    // 1. Check Authorization Bearer header
    let token = request.headers.authorization?.replace(/^Bearer\s+/i, '');

    // 2. Fallback: Parse access_token cookie from request headers if bearer token not present
    if (!token && request.headers.cookie) {
      const match = request.headers.cookie.match(/(?:^|; )access_token=([^;]*)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (!token) throw new UnauthorizedException('No authorization token provided');

    try {
      const payload = await this.jwt.verifyAsync(token, { secret: process.env.JWT_ACCESS_SECRET });
      if (payload.role !== 'CUSTOMER') throw new UnauthorizedException('Access denied. Customer role required.');
      
      const customerId = payload.customerId || payload.sub;
      if (!customerId) throw new UnauthorizedException('Invalid customer identity');

      request.user = { ...payload, customerId, sub: customerId };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }
}
