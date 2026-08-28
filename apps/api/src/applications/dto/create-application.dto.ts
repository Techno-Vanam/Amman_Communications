import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty()
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  serviceType!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  applicationNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  notes?: string;
}
