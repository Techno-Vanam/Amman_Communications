import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { ReportFilterDto } from './dto/report-filter.dto';
import { ExportReportDto } from './dto/export-report.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('Admin - Reports')
@ApiBearerAuth()
@Controller(['admin/reports', 'v1/admin/reports', 'api/v1/admin/reports'])
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get overall summary metrics for reports' })
  async getSummary(@Query() filter: ReportFilterDto) {
    return this.reportsService.getSummary(filter);
  }

  @Get('applications')
  @ApiOperation({ summary: 'Get application performance and status reports' })
  async getApplicationsReport(@Query() filter: ReportFilterDto) {
    return this.reportsService.getApplicationsReport(filter);
  }

  @Get('services')
  @ApiOperation({ summary: 'Get service performance and revenue metrics' })
  async getServicesReport(@Query() filter: ReportFilterDto) {
    return this.reportsService.getServicesReport(filter);
  }

  @Get('customers')
  @ApiOperation({ summary: 'Get customer activity and registration reports' })
  async getCustomersReport(@Query() filter: ReportFilterDto) {
    return this.reportsService.getCustomersReport(filter);
  }

  @Get('documents')
  @ApiOperation({ summary: 'Get document review workflow reports' })
  async getDocumentsReport(@Query() filter: ReportFilterDto) {
    return this.reportsService.getDocumentsReport(filter);
  }

  @Get('appointments')
  @ApiOperation({ summary: 'Get appointments and consultation reports' })
  async getAppointmentsReport(@Query() filter: ReportFilterDto) {
    return this.reportsService.getAppointmentsReport(filter);
  }

  @Get('finance')
  @ApiOperation({ summary: 'Get comprehensive financial performance reports' })
  async getFinanceReport(@Query() filter: ReportFilterDto) {
    return this.reportsService.getFinanceReport(filter);
  }

  @Get('export/pdf')
  @ApiOperation({ summary: 'Export complete filtered report as branded PDF' })
  async exportPdf(@Query() filter: ExportReportDto, @Res() res: Response) {
    try {
      const pdfBuffer = await this.reportsService.generatePdfReport(filter);
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `amman-communications-report-${dateStr}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', String(pdfBuffer.length));

      res.send(pdfBuffer);
    } catch (err: any) {
      console.error('❌ exportPdf Controller Error:', err);
      res.status(500).json({ statusCode: 500, message: err.message || 'PDF Generation Error' });
    }
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Export complete filtered report as multi-sheet Excel workbook' })
  async exportExcel(@Query() filter: ExportReportDto, @Res() res: Response) {
    try {
      const excelBuffer = await this.reportsService.generateExcelReport(filter);
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `amman-communications-report-${dateStr}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', String(excelBuffer.length));

      res.send(excelBuffer);
    } catch (err: any) {
      console.error('❌ exportExcel Controller Error:', err);
      res.status(500).json({ statusCode: 500, message: err.message || 'Excel Generation Error' });
    }
  }
}
