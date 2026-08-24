import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { CustomerAuthGuard } from './guards/customer-auth.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AdminAuthGuard, CustomerAuthGuard],
  exports: [JwtModule, AdminAuthGuard, CustomerAuthGuard],
})
export class AuthModule {}
