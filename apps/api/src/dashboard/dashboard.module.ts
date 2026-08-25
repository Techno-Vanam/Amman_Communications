import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminDashboardController, CustomerDashboardController } from './dashboard.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [AdminDashboardController, CustomerDashboardController],
})
export class DashboardModule {}
