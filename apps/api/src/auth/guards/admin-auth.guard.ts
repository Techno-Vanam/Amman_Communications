import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string; cookie?: string };
      cookies?: Record<string, string>;
      user?: { sub: string; role: string };
    }>();

    const authorization = request.headers.authorization;
    const token = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];

    if (token) {
      try {
        const payload = await this.jwt.verifyAsync(token, {
          secret: process.env.JWT_ACCESS_SECRET,
        });

          if (payload.role === 'CUSTOMER') {
            throw new ForbiddenException('Admin access required');
          }

          if (typeof payload.sub === 'string' && payload.role === 'ADMIN') {
          const admin = await this.prisma.admin.findUnique({
            where: { id: payload.sub },
          });

          if (admin) {
            request.user = { sub: admin.id, role: 'ADMIN' };
            return true;
          }
        }
      } catch (error) {
        if (error instanceof ForbiddenException) throw error;
      }
    }

    throw new UnauthorizedException('Authentication token missing or invalid');
  }
}
