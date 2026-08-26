import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const [admin, customer] = await Promise.all([
      this.prisma.admin.findUnique({ where: { email: normalizedEmail } }),
      this.prisma.customer.findUnique({ where: { email: normalizedEmail } }),
    ]);

    if (admin && customer) {
      // Ambiguous identity - safely reject without revealing account status
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

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, role },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' }
    );

    return { 
      accessToken,
      user: {
        id: user.id,
        role,
      }
    };
  }

  async register(name: string, email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();

    // Check both tables for existing email
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
      },
    });

    const accessToken = await this.jwt.signAsync(
      { sub: customer.id, role: 'CUSTOMER' },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' }
    );

    return {
      accessToken,
      user: {
        id: customer.id,
        role: 'CUSTOMER',
      }
    };
  }
}
