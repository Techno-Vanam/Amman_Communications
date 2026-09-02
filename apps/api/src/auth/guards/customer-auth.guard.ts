import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomerAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: { customerId: string; sub: string; role: 'CUSTOMER' };
    }>();

    const authorization = request.headers.authorization;
    const token = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];

    if (token) {
      try {
        const payload = await this.jwt.verifyAsync<{ sub?: string; role?: string }>(token, {
          secret: process.env.JWT_ACCESS_SECRET,
        });
        if (payload.role !== 'CUSTOMER' || !payload.sub) throw new ForbiddenException('Customer access required');
        const customer = await this.prisma.customer.findUnique({ where: { id: payload.sub } });
        if (customer?.status === 'ACTIVE') {
          request.user = { customerId: customer.id, sub: customer.id, role: 'CUSTOMER' };
          return true;
        }
      } catch (error) {
        if (error instanceof ForbiddenException) throw error;
      }
    }

    throw new UnauthorizedException('Authentication token missing or invalid');
  }
}
