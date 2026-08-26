import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly prisma: PrismaService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: { sub: string; role: string } }>();
    const authorization = request.headers.authorization;
    const token = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];
    if (!token) throw new UnauthorizedException();
    try { 
      const payload = await this.jwt.verifyAsync(token, { secret: process.env.JWT_ACCESS_SECRET }); 
      if (typeof payload.sub !== 'string' || payload.role !== 'ADMIN') throw new ForbiddenException();
      const admin = await this.prisma.admin.findUnique({ where: { id: payload.sub } });
      if (!admin) throw new UnauthorizedException();
      request.user = payload; 
      return true; 
    }
    catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException();
    }
  }
}
