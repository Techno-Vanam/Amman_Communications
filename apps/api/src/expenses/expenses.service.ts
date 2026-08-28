import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { ExpenseCategory } from '@prisma/client';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(adminId: string, createExpenseDto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        ...createExpenseDto,
        createdById: adminId,
        isVoided: false,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    category?: ExpenseCategory;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    const { skip = 0, take = 10, category, startDate, endDate, search } = params;

    const where: import('@prisma/client').Prisma.ExpenseWhereInput = {};
    if (category) where.category = category;
    if (startDate && endDate) {
      where.expenseDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        skip: Number(skip),
        take: Number(take),
        where,
        orderBy: { expenseDate: 'desc' },
        include: { createdBy: { select: { id: true, name: true } } },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return { data: expenses, total, page: skip / take + 1, limit: take };
  }

  async getStats(category?: ExpenseCategory) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    const baseWhere: import('@prisma/client').Prisma.ExpenseWhereInput = { isVoided: false };
    if (category) {
      baseWhere.category = category;
    }

    const totalExpensesAggr = await this.prisma.expense.aggregate({
      where: baseWhere,
      _sum: { amount: true },
    });
    
    const currentMonthAggr = await this.prisma.expense.aggregate({
      where: { 
        ...baseWhere,
        expenseDate: { gte: startOfMonth }
      },
      _sum: { amount: true },
    });
    
    const currentYearAggr = await this.prisma.expense.aggregate({
      where: { 
        ...baseWhere,
        expenseDate: { gte: startOfYear }
      },
      _sum: { amount: true },
    });

    return {
      totalAmount: totalExpensesAggr._sum.amount || 0,
      currentMonthAmount: currentMonthAggr._sum.amount || 0,
      currentYearAmount: currentYearAggr._sum.amount || 0,
    };
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, name: true } } },
    });
    if (!expense) throw new NotFoundException(`Expense with ID ${id} not found`);
    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    const expense = await this.findOne(id);
    if (expense.isVoided) {
      throw new BadRequestException('Cannot edit a voided expense');
    }
    if (updateExpenseDto.isVoided === false) {
      throw new BadRequestException('Cannot unvoid an expense');
    }
    return this.prisma.expense.update({
      where: { id },
      data: updateExpenseDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // verify exists
    return this.prisma.expense.delete({
      where: { id },
    });
  }
}
