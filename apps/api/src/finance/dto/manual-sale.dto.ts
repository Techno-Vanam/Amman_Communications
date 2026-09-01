import { IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { SaleCategory, PaymentMethod } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateManualSaleDto {
  @ApiProperty({ description: 'The name of the walk-in customer', example: 'John Doe' })
  @IsString()
  @MinLength(1)
  customerName!: string;

  @ApiProperty({ enum: SaleCategory, description: 'Category of the sale', example: SaleCategory.XEROX })
  @IsEnum(SaleCategory)
  category!: SaleCategory;

  @ApiProperty({ description: 'Amount for the sale', example: 10.5 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ enum: PaymentMethod, description: 'Payment Method', example: PaymentMethod.CASH })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ description: 'Optional details about the sale', example: '2 copies of A4' })
  @IsOptional()
  @IsString()
  details?: string;
}
