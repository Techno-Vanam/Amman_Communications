import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CustomerAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: unknown }>();
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw new UnauthorizedException();
    try { const payload = await this.jwt.verifyAsync(token, { secret: process.env.JWT_ACCESS_SECRET, audience: 'customer' }); request.user = payload; return true; }
    catch { throw new UnauthorizedException(); }
  }
}
