import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly prisma: PrismaService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: { sub: string; role: string } }>();
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) {
      console.log('[AdminAuthGuard] Token is missing from headers');
      throw new UnauthorizedException('Token is missing');
    }
    try { 
      const payload = await this.jwt.verifyAsync(token, { secret: process.env.JWT_ACCESS_SECRET }); 
      if (payload.role !== 'ADMIN') {
        console.log(`[AdminAuthGuard] Role mismatch: ${payload.role}`);
        throw new ForbiddenException();
      }
      const admin = await this.prisma.admin.findUnique({ where: { id: payload.sub } });
      if (!admin) {
        console.log(`[AdminAuthGuard] Admin not found for id: ${payload.sub}`);
        throw new UnauthorizedException('Admin not found');
      }
      request.user = payload; 
      return true; 
    }
    catch (error) {
      console.log('[AdminAuthGuard] Verification failed:', error);
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException();
    }
  }
}
