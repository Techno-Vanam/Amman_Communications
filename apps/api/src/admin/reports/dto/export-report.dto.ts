import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { ReportFilterDto } from './report-filter.dto';

export class ExportReportDto extends ReportFilterDto {
  @ApiPropertyOptional({ enum: ['pdf', 'excel'], description: 'Export file format' })
  @IsOptional()
  @IsIn(['pdf', 'excel'])
  format?: 'pdf' | 'excel';
}
