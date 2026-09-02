import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CustomerApplicationsController } from './customer-applications.controller';
import { AdminApplicationsController } from './admin-applications.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

import { AdminApplicationsController } from './admin-applications.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CustomerApplicationsController, AdminApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
