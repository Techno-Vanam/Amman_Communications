import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppointmentNumberService {
  constructor(private readonly prisma: PrismaService) {}

  async generateNextNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();

    const counter = await this.prisma.appointmentCounter.upsert({
      where: { year: currentYear },
      update: { lastNumber: { increment: 1 } },
      create: { year: currentYear, lastNumber: 1 },
    });

    const paddedNumber = String(counter.lastNumber).padStart(6, '0');
    return `APT-${currentYear}-${paddedNumber}`;
  }
}
