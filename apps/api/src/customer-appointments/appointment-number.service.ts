import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppointmentNumberService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates next sequential appointment number formatted as APT-YYYY-NNNNNN.
   * Can be run inside an existing Prisma transaction or standalone.
   */
  async generateNextNumber(tx?: any): Promise<string> {
    const db = tx || this.prisma;
    const currentYear = new Date().getFullYear();

    // Upsert yearly counter record atomically
    const counter = await db.appointmentCounter.upsert({
      where: { year: currentYear },
      update: {
        lastNumber: {
          increment: 1,
        },
      },
      create: {
        year: currentYear,
        lastNumber: 1,
      },
    });

    const sequenceNum = String(counter.lastNumber).padStart(6, '0');
    return `APT-${currentYear}-${sequenceNum}`;
  }
}
