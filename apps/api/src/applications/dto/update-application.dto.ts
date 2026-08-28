import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateApplicationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  serviceType?: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  status?: any;
}
