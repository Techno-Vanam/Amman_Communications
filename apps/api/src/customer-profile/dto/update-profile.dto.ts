import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  @ApiProperty()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  contactNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  address?: string;
}
