import { IsString, IsEnum, IsNumber, IsOptional, IsDateString, IsPositive } from 'class-validator';
import { ExpenseCategory, PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ example: 'Office Supplies' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ example: 'Pens, paper, and staplers' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ExpenseCategory, example: ExpenseCategory.OFFICE })
  @IsEnum(ExpenseCategory)
  category!: ExpenseCategory;

  @ApiProperty({ example: 250.50 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount!: number;

  @ApiProperty({ example: '2026-08-25T10:00:00Z' })
  @IsDateString()
  expenseDate!: string;

  @ApiPropertyOptional({ enum: PaymentMethod, example: PaymentMethod.CREDIT_CARD })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ example: 'Bought from Staples' })
  @IsOptional()
  @IsString()
  notes?: string;
  
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  isVoided?: boolean;
}

export class UpdateExpenseDto {
  @ApiPropertyOptional({ example: 'Updated Office Supplies' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ExpenseCategory, example: ExpenseCategory.OFFICE })
  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @ApiPropertyOptional({ example: 300.00 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount?: number;

  @ApiPropertyOptional({ example: '2026-08-26T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  expenseDate?: string;

  @ApiPropertyOptional({ enum: PaymentMethod, example: PaymentMethod.CASH })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ example: 'Price went up' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isVoided?: boolean;
}
