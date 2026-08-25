import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CustomerApplicationsController } from './customer-applications.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CustomerApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
