import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dob?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aadhaarNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  panNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  altPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isProfileCompleted?: boolean;
}
