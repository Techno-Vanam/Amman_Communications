import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ [PrismaService] Connected to Database successfully');
      
      // Auto-ensure required auth security columns exist across all DB configurations
      try {
        await this.$executeRawUnsafe(`ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "refreshTokenHash" TEXT;`);
        await this.$executeRawUnsafe(`ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "refreshTokenHash" TEXT;`);
      } catch (colErr) {
        console.warn('⚠️ [PrismaService] Auto-column verification skipped:', (colErr as Error).message);
      }
    } catch (error) {
      console.error('❌ [PrismaService] Failed to connect to database on startup:', (error as Error).message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
