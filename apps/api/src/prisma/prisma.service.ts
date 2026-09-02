import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ [PrismaService] Connected to Database successfully');
    } catch (error) {
      console.error('❌ [PrismaService] Failed to connect to database on startup:', (error as Error).message);
    }
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
