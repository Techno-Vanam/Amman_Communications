import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { FinanceSummaryQueryDto, InvoiceQueryDto, PaymentQueryDto } from './dto/finance-query.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { FinanceService } from './finance.service';

@Controller('v1/admin/finance')
@UseGuards(AdminAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('summary')
  async getSummary(@Query() query: FinanceSummaryQueryDto) {
    return this.financeService.getSummary(query);
  }

  @Get('invoices')
  async findAllInvoices(@Query() query: InvoiceQueryDto) {
    return this.financeService.findAllInvoices(query);
  }

  @Get('invoices/:id')
  async findOneInvoice(@Param('id') id: string) {
    return this.financeService.findOneInvoice(id);
  }

  @Post('invoices')
  async createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.financeService.createInvoice(dto);
  }

  @Patch('invoices/:id')
  async updateInvoice(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.financeService.updateInvoice(id, dto);
  }

  @Patch('invoices/:id/status')
  async updateInvoiceStatus(@Param('id') id: string, @Body() dto: UpdateInvoiceStatusDto) {
    return this.financeService.updateInvoiceStatus(id, dto.status);
  }

  @Post('invoices/:id/payments')
  async recordPayment(@Param('id') id: string, @Body() dto: RecordPaymentDto) {
    return this.financeService.recordPayment(id, dto);
  }

  @Get('payments')
  async findAllPayments(@Query() query: PaymentQueryDto) {
    return this.financeService.findAllPayments(query);
  }

  @Get('payments/:id')
  async findOnePayment(@Param('id') id: string) {
    return this.financeService.findOnePayment(id);
  }
}
