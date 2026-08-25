import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';

@Module({ imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }), PrismaModule, HealthModule, AuthModule, DocumentsModule] })
export class AppModule {}
