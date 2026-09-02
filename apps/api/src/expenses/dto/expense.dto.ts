import { IsString, IsEnum, IsNumber, IsOptional, IsDateString, IsPositive } from 'class-validator';
import { PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ example: 'Office Supplies' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Pens, paper, and staplers', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Operations' })
  @IsString()
  category!: string;

  @ApiProperty({ example: 250.50 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount!: number;

  @ApiProperty({ example: '2026-08-25T10:00:00Z' })
  @IsDateString()
  expenseDate!: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CREDIT_CARD, required: false })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({ example: 'Bought from Staples', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
  
  @ApiProperty({ example: false, required: false })
  @IsOptional()
  isVoided?: boolean;
}

export class UpdateExpenseDto {
  @ApiProperty({ example: 'Updated Office Supplies', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Operations', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 300.00, required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount?: number;

  @ApiProperty({ example: '2026-08-26T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  expenseDate?: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH, required: false })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({ example: 'Price went up', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  isVoided?: boolean;
}
