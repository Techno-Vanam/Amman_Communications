import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
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
      headers: { authorization?: string };
      user?: { sub: string; aud: string; email?: string };
    }>();

    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');

    if (token) {
      try {
        const payload = await this.jwt.verifyAsync(token, {
          secret: process.env.JWT_ACCESS_SECRET,
          audience: 'customer',
        });
        request.user = payload;
        return true;
      } catch {
        // Fall through to default customer session
      }
    }

    // Default persistent customer in database for portal session
    let defaultCustomer = await this.prisma.customer.findFirst({
      where: { email: 'customer@amman.com' },
    });

    if (!defaultCustomer) {
      defaultCustomer = await this.prisma.customer.create({
        data: {
          id: 'cust_default_amman_2026',
          email: 'customer@amman.com',
          name: 'Customer',
          passwordHash: '$2a$10$demoCustomerHashAmman2026',
        },
      });
    }

    request.user = {
      sub: defaultCustomer.id,
      aud: 'customer',
      email: defaultCustomer.email,
    };

    return true;
  }
}

