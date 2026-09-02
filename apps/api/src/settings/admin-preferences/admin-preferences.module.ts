import { Module } from '@nestjs/common';
import { AdminPreferencesController } from './admin-preferences.controller';
import { AdminPreferencesService } from './admin-preferences.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminPreferencesController],
  providers: [AdminPreferencesService],
  exports: [AdminPreferencesService],
})
export class AdminPreferencesModule {}
