import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AppointmentNumberService } from './appointment-number.service';
import { CustomerAppointmentsController } from './customer-appointments.controller';
import { CustomerAppointmentsService } from './customer-appointments.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CustomerAppointmentsController],
  providers: [CustomerAppointmentsService, AppointmentNumberService],
  exports: [CustomerAppointmentsService],
})
export class CustomerAppointmentsModule {}
