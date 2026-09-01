import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { FinanceController } from './finance.controller';
import { CustomerPaymentsController } from './customer-payments.controller';
import { FinanceService } from './finance.service';
import { ManualSalesController } from './manual-sales.controller';
import { ManualSalesService } from './manual-sales.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [FinanceController, ManualSalesController, CustomerPaymentsController],
  providers: [FinanceService, ManualSalesService],
  exports: [FinanceService, ManualSalesService],
})
export class FinanceModule {}
