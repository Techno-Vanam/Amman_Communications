import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePreferencesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsBoolean()
  smsAlerts?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsBoolean()
  whatsappUpdates?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ApiProperty()
  @IsString()
  preferredLanguage?: string;
}
