import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ReportFilterDto {
  @ApiPropertyOptional({ description: 'Start date filter (ISO string, e.g. 2026-01-01)' })
  @IsOptional()
  @Transform(({ value }) => (!value || value === '' ? undefined : String(value)))
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: 'End date filter (ISO string, e.g. 2026-01-31)' })
  @IsOptional()
  @Transform(({ value }) => (!value || value === '' ? undefined : String(value)))
  @IsString()
  to?: string;

  @ApiPropertyOptional({ description: 'Filter by specific service ID' })
  @IsOptional()
  @Transform(({ value }) => (!value || value === '' || value === 'ALL' ? undefined : String(value)))
  @IsString()
  serviceId?: string;

  @ApiPropertyOptional({ description: 'Filter by application status (SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, etc.)' })
  @IsOptional()
  @Transform(({ value }) => (!value || value === '' || value === 'ALL' ? undefined : String(value)))
  @IsString()
  applicationStatus?: string;

  @ApiPropertyOptional({ description: 'Filter by payment status (PAID, UNPAID, PARTIALLY_PAID, OVERDUE, etc.)' })
  @IsOptional()
  @Transform(({ value }) => (!value || value === '' || value === 'ALL' ? undefined : String(value)))
  @IsString()
  paymentStatus?: string;

  @ApiPropertyOptional({ description: 'Page number for pagination', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of records per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Keyword search query' })
  @IsOptional()
  @Transform(({ value }) => (!value || value === '' ? undefined : String(value)))
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Field to sort by' })
  @IsOptional()
  @Transform(({ value }) => (!value || value === '' ? undefined : String(value)))
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort direction', enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @Transform(({ value }) => (!value || value === '' ? 'desc' : value))
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ description: 'Specific report section to view or export' })
  @IsOptional()
  @Transform(({ value }) => (!value || value === '' ? undefined : String(value)))
  @IsString()
  section?: string;
}
