import path from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ServicesModule } from './services/services.module';
import { CustomersModule } from './customers/customers.module';
import { CustomerAppointmentsModule } from './customer-appointments/customer-appointments.module';
import { CustomerProfileModule } from './customer-profile/customer-profile.module';
import { ApplicationsModule } from './applications/applications.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ExpensesModule } from './expenses/expenses.module';
import { BusinessProfileModule } from './settings/business-profile/business-profile.module';
import { StorageModule } from './storage/storage.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FinanceModule } from './finance/finance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), '../../.env'),
        path.resolve(__dirname, '../.env'),
      ],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    DocumentsModule,
    DashboardModule,
    ServicesModule,
    CustomersModule,
    CustomerAppointmentsModule,
    CustomerProfileModule,
    ApplicationsModule,
    AppointmentsModule,
    ExpensesModule,
    BusinessProfileModule,
    StorageModule,
    NotificationsModule,
    FinanceModule,
  ],
})
export class AppModule {}
