import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class UpdateBusinessProfileDto {
  @ApiProperty({ description: 'Name of the business organization', example: 'Amman Communications' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  businessName!: string;

  @ApiPropertyOptional({ description: 'Official business registration number', example: 'AC-2023-894' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  registrationNumber?: string;

  @ApiProperty({ description: 'Physical office address of the business', example: '124 Main Street, Business District' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  officeAddress!: string;

  @ApiProperty({ description: 'Primary contact phone number', example: '+91 9876543210' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[+]?[\d\s\-()]{7,20}$/, {
    message: 'primaryPhone must be a valid phone number format',
  })
  @ApiProperty()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  primaryPhone!: string;

  @ApiProperty({ description: 'Support email address', example: 'support@example.com' })
  @IsEmail({}, { message: 'supportEmail must be a valid email address' })
  @ApiProperty()
  @IsNotEmpty()
  @ApiProperty()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  supportEmail!: string;
}
