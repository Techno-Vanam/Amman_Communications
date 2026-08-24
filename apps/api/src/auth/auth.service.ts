import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async login(role: 'customer' | 'admin', email: string, password: string) {
    const user = role === 'admin'
      ? await this.prisma.admin.findUnique({ where: { email } })
      : await this.prisma.customer.findUnique({ where: { email } });
    if (!user || !(await compare(password, user.passwordHash))) throw new UnauthorizedException('Invalid credentials');
    return { accessToken: await this.jwt.signAsync({ sub: user.id, aud: role }, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' }) };
  }
}
