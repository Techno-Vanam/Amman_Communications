import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomerAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string; cookie?: string };
      cookies?: Record<string, string>;
      user?: { sub: string; role?: string; aud?: string; email?: string };
    }>();

    const authorization = request.headers.authorization;
    let token =
      authorization?.match(/^Bearer\s+(\S+)$/i)?.[1] ||
      authorization?.replace(/^Bearer\s+/i, '');

    if (!token && (request.cookies?.customer_access_token || request.cookies?.access_token)) {
      token = request.cookies.customer_access_token || request.cookies.access_token;
    }

    if (!token && request.headers.cookie) {
      const match =
        request.headers.cookie.match(/customer_access_token=([^;]+)/) ||
        request.headers.cookie.match(/access_token=([^;]+)/);
      if (match) token = match[1];
    }

    if (token) {
      try {
        const payload = await this.jwt.verifyAsync(token, {
          secret: process.env.JWT_ACCESS_SECRET,
        });

        if (typeof payload.sub === 'string') {
          const customer = await this.prisma.customer.findUnique({
            where: { id: payload.sub },
          });

          if (customer) {
            request.user = {
              sub: customer.id,
              role: payload.role ?? 'CUSTOMER',
              aud: payload.aud ?? 'customer',
              email: customer.email,
            };
            return true;
          }
        }
      } catch (error) {
        if (error instanceof ForbiddenException) throw error;
      }
    }

    throw new UnauthorizedException('Authentication required. Please sign in to your account.');
  }
}
