import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Req, Delete } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';

import { ExpenseCategory } from '@prisma/client';

@ApiBearerAuth()
@Controller('v1/admin/expenses')
@UseGuards(AdminAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@Req() req: { user: { sub: string; role: string } }, @Body() createExpenseDto: CreateExpenseDto) {
    const adminId = req.user.sub; // The JWT payload stores the ID in 'sub'
    return this.expensesService.create(adminId, createExpenseDto);
  }

  @Get()
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('category') category?: ExpenseCategory,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.expensesService.findAll({ skip, take, category, startDate, endDate, search });
  }

  @Get('stats')
  getStats(@Query('category') category?: ExpenseCategory) {
    return this.expensesService.getStats(category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
