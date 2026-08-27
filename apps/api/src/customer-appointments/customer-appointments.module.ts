import { Module } from '@nestjs/common';
import { CustomerAppointmentsController } from './customer-appointments.controller';
import { CustomerAppointmentsService } from './customer-appointments.service';
import { CustomerMeController } from './customer-me.controller';
import { AppointmentNumberService } from './appointment-number.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, StorageModule, AuthModule],
  controllers: [CustomerAppointmentsController, CustomerMeController],
  providers: [CustomerAppointmentsService, AppointmentNumberService],
  exports: [CustomerAppointmentsService, AppointmentNumberService],
})
export class CustomerAppointmentsModule {}
