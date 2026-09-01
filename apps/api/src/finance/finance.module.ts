import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { FinanceController } from './finance.controller';
import { CustomerPaymentsController } from './customer-payments.controller';
import { FinanceService } from './finance.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [FinanceController, CustomerPaymentsController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
