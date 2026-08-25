import path from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ServicesModule } from './services/services.module';

@Module({ imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: path.resolve(__dirname, '../.env') }), PrismaModule, HealthModule, AuthModule, DocumentsModule, DashboardModule, ServicesModule] })
export class AppModule {}
